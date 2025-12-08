// ============================================================================
// ATLAS PAGE - Main extraction interface
// ============================================================================
// Copy to: src/app/atlas/page.tsx

import { ExtractChallengeForm } from '@/components/atlas/ExtractChallengeForm';

export const metadata = {
  title: 'Atlas - Challenge Extraction',
  description: 'Extract and analyze innovation challenges from funding calls and policy documents',
};

export default function AtlasPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔭</span>
            <div>
              <h1 className="text-xl font-bold">Innovation Atlas</h1>
              <p className="text-sm text-gray-500">
                Extract challenges from funding calls &amp; policy documents
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8">
        <ExtractChallengeForm />
      </div>

      {/* Footer */}
      <footer className="border-t bg-white mt-8">
        <div className="max-w-5xl mx-auto px-6 py-4 text-center text-sm text-gray-500">
          Part of Sparkworks • Powered by OpenAI
        </div>
      </footer>
    </main>
  );
}
