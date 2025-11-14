"use client"

import { useState, useMemo } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigateStore } from '@/stores/navigate-store';
import { Stakeholder, Technology, FundingEvent, Project } from '@/lib/navigate-types';

interface SearchResult {
  id: string;
  type: 'stakeholder' | 'technology' | 'funding' | 'project';
  name: string;
  description?: string;
  entity: Stakeholder | Technology | FundingEvent | Project;
}

export function Search() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const stakeholders = useNavigateStore((state) => state.stakeholders);
  const technologies = useNavigateStore((state) => state.technologies);
  const fundingEvents = useNavigateStore((state) => state.fundingEvents);
  const projects = useNavigateStore((state) => state.projects);
  const setFilters = useNavigateStore((state) => state.setFilters);
  const setActiveEntity = useNavigateStore((state) => state.setActiveEntity);
  const setSelectedEntities = useNavigateStore((state) => state.setSelectedEntities);

  // Search across all entities
  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search stakeholders
    stakeholders.forEach((s) => {
      const matches =
        s.name.toLowerCase().includes(lowerQuery) ||
        s.description?.toLowerCase().includes(lowerQuery) ||
        s.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        s.type.toLowerCase().includes(lowerQuery) ||
        s.sector.toLowerCase().includes(lowerQuery);

      if (matches) {
        searchResults.push({
          id: s.id,
          type: 'stakeholder',
          name: s.name,
          description: s.description,
          entity: s,
        });
      }
    });

    // Search technologies
    technologies.forEach((t) => {
      const matches =
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description?.toLowerCase().includes(lowerQuery) ||
        t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        t.category.toLowerCase().includes(lowerQuery);

      if (matches) {
        searchResults.push({
          id: t.id,
          type: 'technology',
          name: t.name,
          description: t.description,
          entity: t,
        });
      }
    });

    // Search funding events
    fundingEvents.forEach((f) => {
      const matches =
        f.program.toLowerCase().includes(lowerQuery) ||
        f.impact_description?.toLowerCase().includes(lowerQuery);

      if (matches) {
        searchResults.push({
          id: f.id,
          type: 'funding',
          name: f.program,
          description: f.impact_description,
          entity: f,
        });
      }
    });

    // Search projects
    projects.forEach((p) => {
      const matches =
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery);

      if (matches) {
        searchResults.push({
          id: p.id,
          type: 'project',
          name: p.name,
          description: p.description,
          entity: p,
        });
      }
    });

    return searchResults.slice(0, 10); // Limit to 10 results
  }, [query, stakeholders, technologies, fundingEvents, projects]);

  const handleSelect = (result: SearchResult) => {
    setActiveEntity(result.id);
    setSelectedEntities([result.id]);
    setFilters({ searchQuery: query });
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[focusedIndex]) {
      e.preventDefault();
      handleSelect(results[focusedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search stakeholders, technologies, projects..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setFocusedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute z-50 w-full mt-2 max-h-96 overflow-y-auto">
          <CardContent className="p-2">
            {results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`w-full text-left p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                  index === focusedIndex ? 'bg-slate-100 dark:bg-slate-800' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{result.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                    </div>
                    {result.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {result.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

