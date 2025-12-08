import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getGuardrails } from '@/config/ai-guardrails';
import { searchKnowledgeBase, formatKnowledgeBaseForContext } from '@/lib/knowledge-base-search';
import { getAIFunctionDefinitions, formatAICapabilities } from '@/lib/ai-functions';
import { getVectorStore } from '@/lib/ai/vector-store-json';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in .env.local' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { messages, context, model: requestModel, temperature: requestTemperature, toolCalls, toolResults } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get guardrails configuration
    const guardrails = getGuardrails();
    
    // Priority: request body > guardrails > environment variables > defaults
    // This allows admin panel to override settings per-request
    const model = requestModel || guardrails.model || process.env.OPENAI_MODEL || 'gpt-4o';
    const temperature = requestTemperature !== undefined 
      ? parseFloat(requestTemperature.toString())
      : (guardrails.temperature ?? parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'));

    // Search knowledge base for relevant context (keyword-based fallback)
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const kbResults = searchKnowledgeBase(lastUserMessage);
    const kbContext = formatKnowledgeBaseForContext(kbResults.slice(0, 3), 3000);

    // Search platform entities using vector store (semantic search)
    let entityResults: Array<{ entity: any; similarity: number; similarityPercent: number }> = [];
    let similarEntitiesContext = '';
    
    try {
      const vectorStore = getVectorStore();
      
      // Search entities semantically
      const semanticResults = await vectorStore.hybridSearch(lastUserMessage, {
        topK: 5,
        threshold: 0.5,
      });
      
      entityResults = semanticResults.map(r => ({
        entity: r.entity,
        similarity: r.similarity,
        similarityPercent: Math.round(r.similarity * 100),
      }));
      
      // If user seems to be asking about a specific entity (high similarity match),
      // find similar entities for cross-domain discovery
      const topMatch = entityResults[0];
      if (topMatch && topMatch.similarity > 0.75) {
        try {
          const similar = await vectorStore.findSimilar(topMatch.entity.id, { 
            topK: 3,
            threshold: 0.5,
          });
          
          if (similar.length > 0) {
            similarEntitiesContext = '\n\n## Similar Entities\n';
            similarEntitiesContext += `The user is asking about "${topMatch.entity.name}". Here are related entities they might find interesting:\n\n`;
            similar.forEach(s => {
              similarEntitiesContext += `- **${s.entity.name}** (${s.entity.entityType}, ${s.entity.domain}) - ${Math.round(s.similarity * 100)}% similar\n`;
              similarEntitiesContext += `  ${s.entity.description?.substring(0, 150) || ''}...\n\n`;
            });
          }
        } catch (error) {
          // Ignore errors finding similar entities (entity might not be in store)
          console.warn('Could not find similar entities:', error);
        }
      }
    } catch (error) {
      // If vector store fails, continue without entity search (graceful degradation)
      console.warn('Vector store search failed, continuing with keyword search only:', error);
    }

    // Build system prompt with context
    let systemPrompt = guardrails.systemPrompt;

    // Add AI capabilities (available visualizations and controls)
    systemPrompt += `\n\n${formatAICapabilities()}`;

    // Add knowledge base context if available (keyword-based, always available)
    if (kbContext) {
      systemPrompt += `\n\n## Relevant Knowledge Base Content\n\n${kbContext}\n\nUse this information to provide accurate, cited responses.`;
    }
    
    // Add entity search results (semantic search, if available)
    if (entityResults.length > 0) {
      systemPrompt += `\n\n## Relevant Platform Entities\n\n`;
      systemPrompt += `The following entities in the platform are relevant to the user's query:\n\n`;
      entityResults.forEach(result => {
        systemPrompt += `- **${result.entity.name}** (${result.entity.entityType}, ${result.entity.domain}) - ${result.similarityPercent}% match\n`;
        if (result.entity.description) {
          systemPrompt += `  ${result.entity.description.substring(0, 200)}${result.entity.description.length > 200 ? '...' : ''}\n`;
        }
        systemPrompt += `\n`;
      });
      systemPrompt += `Use this information when answering questions about these entities. You can reference specific entities by name when relevant.\n`;
    }
    
    // Add similar entities context (cross-domain discovery)
    if (similarEntitiesContext) {
      systemPrompt += similarEntitiesContext;
      systemPrompt += `\nUse this to suggest cross-domain connections or related entities the user might want to explore.\n`;
    }

    // Add current visualization context if provided
    if (context) {
      systemPrompt += `\n\n## Current Visualization Context\n`;
      if (context.activeViz) {
        systemPrompt += `- Active Visualization: ${context.activeViz}\n`;
      }
      if (context.useNavigateData) {
        systemPrompt += `- Data Source: NAVIGATE Platform Data\n`;
      }
      if (context.selectedEntities && context.selectedEntities.length > 0) {
        systemPrompt += `- Selected Entities: ${context.selectedEntities.map((e: any) => e.name || e.id).join(', ')}\n`;
      }
    }

    // Prepare messages for OpenAI
    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages.map((msg: any): OpenAI.Chat.Completions.ChatCompletionMessageParam | null => {
        try {
          // Handle messages with tool calls
          if (msg.role === 'assistant' && msg.tool_calls) {
            return {
              role: 'assistant' as const,
              content: msg.content || null,
              tool_calls: Array.isArray(msg.tool_calls) ? msg.tool_calls : [],
            };
          }
          // Handle tool result messages
          if (msg.role === 'tool') {
            return {
              role: 'tool' as const,
              content: msg.content || '',
              tool_call_id: msg.tool_call_id || '',
            };
          }
          // Handle user messages
          if (msg.role === 'user') {
            return {
              role: 'user' as const,
              content: msg.content || '',
            };
          }
          // Default to user role
          return {
            role: 'user' as const,
            content: msg.content || '',
          };
        } catch (error) {
          console.error('Error processing message:', error, msg);
          // Return a safe fallback message
          return {
            role: 'user' as const,
            content: '',
          };
        }
      }).filter((msg): msg is OpenAI.Chat.Completions.ChatCompletionMessageParam => 
        msg !== null && (msg.content !== '' || msg.role === 'assistant' || msg.role === 'tool')
      ), // Filter out empty messages except assistant/tool
    ];

    // Call OpenAI API with function calling enabled
    const stream = await openai.chat.completions.create({
      model: model,
      messages: openaiMessages,
      temperature: temperature,
      stream: true,
      tools: getAIFunctionDefinitions().map(def => ({
        type: 'function' as const,
        function: def,
      })),
      tool_choice: 'auto', // Let the model decide when to use functions
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let accumulatedText = '';
          const toolCallAccumulator: Record<number, { 
            id?: string; 
            name?: string; 
            arguments: string;
          }> = {};
          let finishReason: string | null = null;
          let hasToolCalls = false;
          
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;
            finishReason = chunk.choices[0]?.finish_reason || null;
            
            // Handle text content
            const content = delta?.content || '';
            if (content) {
              accumulatedText += content;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
            
            // Handle function calls (they come in chunks, need to accumulate)
            const toolCalls = delta?.tool_calls;
            if (toolCalls && toolCalls.length > 0) {
              hasToolCalls = true;
              for (const toolCall of toolCalls) {
                const index = toolCall.index;
                if (!toolCallAccumulator[index]) {
                  toolCallAccumulator[index] = { arguments: '' };
                }
                
                if (toolCall.id) {
                  toolCallAccumulator[index].id = toolCall.id;
                }
                
                if (toolCall.function) {
                  if (toolCall.function.name) {
                    toolCallAccumulator[index].name = toolCall.function.name;
                  }
                  if (toolCall.function.arguments) {
                    toolCallAccumulator[index].arguments += toolCall.function.arguments;
                  }
                }
              }
            }
          }
          
          // After stream completes, check if we have tool calls
          const completedToolCalls = Object.entries(toolCallAccumulator)
            .sort(([a], [b]) => Number(a) - Number(b)) // Sort by index
            .map(([index, toolCall]) => ({
              id: toolCall.id || `call_${index}`,
              name: toolCall.name || '',
              arguments: toolCall.arguments || '{}',
            }))
            .filter(tc => tc.name && tc.arguments);
          
          // If finish reason is tool_calls or we detected tool calls, return them
          if (finishReason === 'tool_calls' || (hasToolCalls && completedToolCalls.length > 0)) {
            // We have tool calls - return them and stop (client will handle continuation)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'requires_action',
              tool_calls: completedToolCalls,
            })}\n\n`));
          }
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      type: error.constructor?.name,
    });
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to process chat request';
    let errorDetails = error.message || 'Unknown error';
    
    if (error.message?.includes('API key')) {
      errorMessage = 'OpenAI API key error';
      errorDetails = 'Please check that your OPENAI_API_KEY in .env.local is valid and has not expired.';
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded';
      errorDetails = 'You have exceeded your OpenAI API rate limit. Please try again later.';
    } else if (error.message?.includes('insufficient_quota')) {
      errorMessage = 'Insufficient quota';
      errorDetails = 'Your OpenAI account has insufficient credits. Please add credits to your account.';
    } else if (error.message?.includes('model')) {
      errorMessage = 'Model error';
      errorDetails = `The model may not be available. Try changing the model in .env.local or admin panel.`;
    }
    
    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        type: error.constructor?.name || 'Error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY)
  const model = process.env.OPENAI_MODEL || 'gpt-4o'
  const temperature = parseFloat(process.env.OPENAI_TEMPERATURE || '0.7')

  if (!hasApiKey) {
    return NextResponse.json(
      {
        status: 'missing_api_key',
        message: 'OPENAI_API_KEY is not configured in .env.local',
        hasApiKey: false,
        model,
        temperature,
      },
      { status: 500 },
    )
  }

  return NextResponse.json({
    status: 'ok',
    message: 'Chat API ready',
    hasApiKey: true,
    model,
    temperature,
  })
}

