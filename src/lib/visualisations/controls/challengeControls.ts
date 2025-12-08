/**
 * Challenge Filter Controls Schema
 * 
 * AI-compatible control definitions for filtering challenges
 */

import type { ControlDefinition } from '../types';

export const challengeControlSchema: ControlDefinition[] = [
  {
    id: 'modes',
    type: 'multiselect',
    label: 'Transport Modes',
    description: 'Filter challenges by transport mode',
    group: 'filters',
    domains: ['atlas'],
    options: [
      { value: 'Rail', label: 'Rail' },
      { value: 'Aviation', label: 'Aviation' },
      { value: 'Maritime', label: 'Maritime' },
      { value: 'Highways', label: 'Highways' },
    ],
    defaultValue: ['Rail', 'Aviation', 'Maritime', 'Highways'],
    aiHint: 'Filter challenges by transport mode. Use this to focus on specific modes like Rail or Aviation.',
  },
  {
    id: 'themes',
    type: 'multiselect',
    label: 'Strategic Themes',
    description: 'Filter challenges by strategic theme',
    group: 'filters',
    domains: ['atlas'],
    options: [
      { value: 'Decarbonisation', label: 'Decarbonisation' },
      { value: 'Autonomy', label: 'Autonomy' },
      { value: 'Safety', label: 'Safety' },
      { value: 'People Experience', label: 'People Experience' },
      { value: 'Supply Chain', label: 'Supply Chain' },
    ],
    defaultValue: ['Decarbonisation', 'Autonomy', 'Safety', 'People Experience', 'Supply Chain'],
    aiHint: 'Filter by strategic theme. Use this to focus on areas like Decarbonisation or Autonomy.',
  },
  {
    id: 'tiers',
    type: 'multiselect',
    label: 'Source Tier',
    description: 'Filter by funding source tier',
    group: 'filters',
    domains: ['atlas'],
    options: [
      { value: '1', label: 'Tier 1 - Core Transport' },
      { value: '2', label: 'Tier 2 - Government' },
      { value: '3', label: 'Tier 3 - International' },
      { value: '4', label: 'Tier 4 - Regional' },
      { value: '5', label: 'Tier 5 - Industry' },
    ],
    defaultValue: ['1', '2', '3', '4', '5'],
    aiHint: 'Filter by funding source tier. Tier 1 is core transport funding, Tier 5 is industry-led.',
  },
  {
    id: 'minRelevance',
    type: 'slider',
    label: 'Min CPC Relevance',
    description: 'Filter to show only challenges with relevance score >= this value',
    group: 'filters',
    domains: ['atlas'],
    min: 1,
    max: 10,
    step: 1,
    defaultValue: 1,
    aiHint: 'Filter to show only challenges with CPC relevance score >= this value. Higher values show more relevant opportunities.',
  },
  {
    id: 'status',
    type: 'multiselect',
    label: 'Status',
    description: 'Filter by challenge status',
    group: 'filters',
    domains: ['atlas'],
    options: [
      { value: 'open', label: 'Open' },
      { value: 'upcoming', label: 'Upcoming' },
      { value: 'ongoing', label: 'Ongoing' },
      { value: 'closing', label: 'Closing' },
    ],
    defaultValue: ['open', 'upcoming', 'ongoing'],
    aiHint: 'Filter by challenge status. Use this to focus on currently open opportunities.',
  },
  {
    id: 'smeOnly',
    type: 'toggle',
    label: 'SME-Specific Only',
    description: 'Show only challenges specifically for SMEs',
    group: 'filters',
    domains: ['atlas'],
    defaultValue: false,
    aiHint: 'Toggle to show only SME-specific challenges. Useful for identifying opportunities tailored to small and medium enterprises.',
  },
  {
    id: 'fundingRange',
    type: 'range',
    label: 'Funding Range (£)',
    description: 'Filter by funding amount range',
    group: 'filters',
    domains: ['atlas'],
    min: 0,
    max: 1000000000,
    step: 1000000,
    defaultValue: [0, 1000000000],
    aiHint: 'Filter challenges by funding amount range. Use this to focus on opportunities within a specific budget range.',
  },
];

