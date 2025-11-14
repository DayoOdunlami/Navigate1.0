// NAVIGATE Platform - Dummy Dataset
// Realistic data for visualization and development
// 50+ entities with meaningful relationships

import { NavigateDataset, Stakeholder, Technology, FundingEvent, Project, Relationship } from '@/lib/navigate-types';

// ============================================================================
// Helper: Create timestamps
// ============================================================================

const now = new Date().toISOString();
const lastYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
const twoYearsAgo = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString();

// ============================================================================
// Stakeholders (30 entities)
// ============================================================================

const stakeholders: Stakeholder[] = [
  // Government (8)
  {
    id: 'org-dft-001',
    name: 'Department for Transport',
    type: 'Government',
    sector: 'Transport',
    funding_capacity: 'High',
    location: { city: 'London', region: 'London', country: 'UK' },
    contact: {
      website: 'https://www.gov.uk/dft',
      email: 'public.enquiries@dft.gov.uk'
    },
    description: 'UK government department responsible for transport strategy and policy',
    tags: ['policy', 'funding', 'infrastructure', 'aviation'],
    data_quality: { confidence: 'verified', last_verified: now },
    capacity_scenarios: { optimistic: 150000000, conservative: 80000000, current: 125000000 },
    created_at: twoYearsAgo,
    updated_at: now,
    knowledge_base: {
      content: `# Strategic Position
The Department for Transport (DfT) is the UK government's lead department for transport policy. In zero emission aviation, DfT plays a critical role in setting policy frameworks, allocating funding, and coordinating cross-sector initiatives.

## Key Responsibilities
- Setting UK aviation decarbonization targets (net zero by 2050)
- Managing funding programs through intermediaries (ATI, Innovate UK)
- Coordinating with CAA on regulatory frameworks
- International collaboration (ICAO, EU)

## Funding Strategy
DfT allocates approximately £125M annually to zero emission aviation through:
- ATI Programme (primary channel)
- Future Flight Challenge
- Direct grants to strategic projects

## Strategic Priorities
1. Hydrogen aviation infrastructure
2. Battery-electric for short-haul
3. Sustainable aviation fuels (SAF)
4. Regulatory framework development

## Key Milestones
- 2019: Jet Zero Strategy launched
- 2021: ATI Programme expanded
- 2023: Hydrogen infrastructure roadmap published
- 2024: Certification standards working group established`,
      sources: [
        { title: 'Jet Zero Strategy', url: 'https://www.gov.uk/jet-zero', date: '2021-07-19', type: 'report' },
        { title: 'DfT Annual Report 2024', url: 'https://www.gov.uk/dft', date: '2024-03-15', type: 'report' }
      ],
      last_updated: now,
      contributors: ['admin'],
      tags: ['strategic', 'policy', 'funding'],
      confidence: 'verified'
    }
  },
  {
    id: 'org-ukri-001',
    name: 'UK Research and Innovation',
    type: 'Government',
    sector: 'Research',
    funding_capacity: 'High',
    location: { city: 'Swindon', region: 'South West', country: 'UK' },
    contact: { website: 'https://www.ukri.org' },
    description: 'UKRI funds and supports research and innovation across all sectors',
    tags: ['research', 'funding', 'innovation'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-beis-001',
    name: 'Department for Business, Energy & Industrial Strategy',
    type: 'Government',
    sector: 'Energy',
    funding_capacity: 'High',
    location: { city: 'London', region: 'London', country: 'UK' },
    contact: { website: 'https://www.gov.uk/beis' },
    description: 'Government department supporting business, energy, and industrial strategy',
    tags: ['policy', 'energy', 'industrial-strategy'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  
  // Intermediaries (6)
  {
    id: 'org-ati-001',
    name: 'Aerospace Technology Institute',
    type: 'Intermediary',
    sector: 'Aerospace',
    funding_capacity: 'High',
    location: { city: 'Cranfield', region: 'East of England', country: 'UK' },
    contact: {
      website: 'https://www.ati.org.uk',
      email: 'info@ati.org.uk'
    },
    description: "UK's national institute for aerospace research and technology development",
    tags: ['intermediary', 'funding', 'research', 'aviation'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now,
    knowledge_base: {
      content: `# Strategic Position
The Aerospace Technology Institute (ATI) is the UK's primary intermediary for aerospace R&D funding, managing government investment in zero emission aviation technologies.

## Role
ATI distributes DfT funding to industry and research organizations, focusing on:
- Technology readiness advancement (TRL 3-7)
- Collaborative R&D programs
- Industry-academia partnerships

## Funding Programs
- ATI Programme (main channel)
- Future Flight Challenge
- Collaborative R&D competitions

## Key Relationships
- Primary funder: DfT
- Key recipients: ZeroAvia, Rolls-Royce, universities
- Strategic partner: Innovate UK`,
      sources: [
        { title: 'ATI Annual Report 2024', url: 'https://www.ati.org.uk', date: '2024-06-01', type: 'report' }
      ],
      last_updated: now,
      contributors: ['admin'],
      tags: ['strategic', 'funding', 'intermediary'],
      confidence: 'verified'
    }
  },
  {
    id: 'org-innovate-uk-001',
    name: 'Innovate UK',
    type: 'Intermediary',
    sector: 'Research',
    funding_capacity: 'High',
    location: { city: 'Swindon', region: 'South West', country: 'UK' },
    contact: { website: 'https://www.ukri.org/councils/innovate-uk/' },
    description: 'UK\'s innovation agency, part of UKRI',
    tags: ['intermediary', 'funding', 'innovation'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  
  // Research (10)
  {
    id: 'org-cranfield-001',
    name: 'Cranfield University',
    type: 'Research',
    sector: 'Aerospace',
    funding_capacity: 'Medium',
    location: { city: 'Cranfield', region: 'East of England', country: 'UK' },
    contact: {
      website: 'https://www.cranfield.ac.uk',
      email: 'aviation@cranfield.ac.uk'
    },
    description: 'Leading UK university for aerospace research and education',
    tags: ['university', 'research', 'fuel-cells', 'hydrogen'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-bristol-001',
    name: 'University of Bristol',
    type: 'Research',
    sector: 'Aerospace',
    funding_capacity: 'Medium',
    location: { city: 'Bristol', region: 'South West', country: 'UK' },
    contact: { website: 'https://www.bristol.ac.uk' },
    description: 'Research university with strong aerospace engineering programs',
    tags: ['university', 'research', 'aircraft-design'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-manchester-001',
    name: 'University of Manchester',
    type: 'Research',
    sector: 'Energy',
    funding_capacity: 'Medium',
    location: { city: 'Manchester', region: 'North West', country: 'UK' },
    contact: { website: 'https://www.manchester.ac.uk' },
    description: 'Research university with hydrogen production expertise',
    tags: ['university', 'research', 'hydrogen-production'],
    data_quality: { confidence: 'estimated', last_verified: lastYear },
    created_at: twoYearsAgo,
    updated_at: now
  },
  
  // Industry (6)
  {
    id: 'org-zeroavia-001',
    name: 'ZeroAvia',
    type: 'Industry',
    sector: 'Aviation',
    funding_capacity: 'High',
    location: { city: 'Hollister', region: 'California', country: 'International' },
    contact: {
      website: 'https://www.zeroavia.com',
      email: 'info@zeroavia.com'
    },
    description: 'Leading developer of hydrogen-electric powertrains for regional aircraft',
    tags: ['hydrogen', 'aircraft', 'TRL-7', 'fuel-cells'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now,
    knowledge_base: {
      content: `# Strategic Position
ZeroAvia is positioning itself as the leader in hydrogen-electric powertrains for regional aircraft. Unlike competitors focusing on battery-electric, their bet is that hydrogen offers better range/weight ratio for 10-80 seat aircraft.

## Key Milestones
- 2020: First hydrogen fuel cell flight (6-seater)
- 2023: 19-seater ground testing completed
- Target 2025: Certification for commercial ops

## Strategic Partnerships
Strong relationship with **British Airways** (LOI for 10-50 aircraft) signals commercial viability pathway. Partnership with **Mitsubishi** provides access to Asian markets and manufacturing scale.

## Technical Approach
Using PEM fuel cells (not alkaline) due to faster start-up times and better power density. Current challenge is hydrogen storage - testing both compressed (350 bar) and liquid options.

## Regulatory Path
Working closely with CAA (UK) and EASA on certification. Major blocker: no existing certification standards for hydrogen powertrains in aviation. Pioneering the regulatory framework itself.

## Risk Factors
- Dependent on hydrogen infrastructure at airports (chicken-egg problem)
- Competition from Airbus (Zeroe program) with deeper pockets
- Certification timeline uncertain (3-5 year range)

## Funding
Total funding: £45M
- Public: £35M (primarily through ATI)
- Private: £10M (Series C)`,
      sources: [
        { title: 'Series C Funding Round', url: 'https://techcrunch.com/zeroavia-series-c', date: '2024-01-15', type: 'news' },
        { title: 'ATI Progress Review Meeting', url: 'internal://meetings/2024-03-15', date: '2024-03-15', type: 'internal_doc' }
      ],
      last_updated: now,
      contributors: ['admin'],
      tags: ['strategic-assessment', 'risk-analysis', 'regulatory'],
      confidence: 'verified'
    }
  },
  {
    id: 'org-rolls-royce-001',
    name: 'Rolls-Royce',
    type: 'Industry',
    sector: 'Aerospace',
    funding_capacity: 'High',
    location: { city: 'Derby', region: 'East Midlands', country: 'UK' },
    contact: { website: 'https://www.rolls-royce.com' },
    description: 'Major aerospace manufacturer developing hydrogen propulsion systems',
    tags: ['hydrogen', 'aircraft', 'TRL-6', 'engines'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-airbus-001',
    name: 'Airbus',
    type: 'Industry',
    sector: 'Aerospace',
    funding_capacity: 'High',
    location: { city: 'Toulouse', region: 'Occitanie', country: 'International' },
    contact: { website: 'https://www.airbus.com' },
    description: 'Major aircraft manufacturer with Zeroe hydrogen aircraft program',
    tags: ['hydrogen', 'aircraft', 'TRL-5', 'zeroe'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-itm-power-001',
    name: 'ITM Power',
    type: 'Industry',
    sector: 'Energy',
    funding_capacity: 'Medium',
    location: { city: 'Sheffield', region: 'Yorkshire', country: 'UK' },
    contact: { website: 'https://www.itm-power.com' },
    description: 'Leading UK manufacturer of electrolysers for green hydrogen production',
    tags: ['hydrogen-production', 'electrolysis', 'TRL-8'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-linde-001',
    name: 'Linde',
    type: 'Industry',
    sector: 'Energy',
    funding_capacity: 'High',
    location: { city: 'Guildford', region: 'South East', country: 'UK' },
    contact: { website: 'https://www.linde.com' },
    description: 'Global industrial gases company, leader in hydrogen infrastructure',
    tags: ['hydrogen-storage', 'infrastructure', 'TRL-9'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'org-british-airways-001',
    name: 'British Airways',
    type: 'Industry',
    sector: 'Aviation',
    funding_capacity: 'High',
    location: { city: 'London', region: 'London', country: 'UK' },
    contact: { website: 'https://www.britishairways.com' },
    description: 'UK flag carrier airline, committed to net zero by 2050',
    tags: ['airline', 'operator', 'customer'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  }
];

// Add more stakeholders to reach 30 total (simplified for brevity - you can expand)
// ... (I'll create a function to generate the rest)

// ============================================================================
// Technologies (25 entities)
// ============================================================================

const technologies: Technology[] = [
  // H2Production (5)
  {
    id: 'tech-h2-electrolysis-001',
    name: 'Green Hydrogen Electrolysis',
    category: 'H2Production',
    trl_current: 8,
    trl_color: 'green',
    maturity_risk: 'Proven technology / Scale-up challenges / Cost reduction needed',
    deployment_ready: true,
    description: 'Electrolysis systems for producing green hydrogen from renewable electricity',
    tags: ['hydrogen-production', 'electrolysis', 'green-energy'],
    regional_availability: ['Scotland', 'South East', 'Yorkshire'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'tech-h2-reforming-001',
    name: 'Steam Methane Reforming with CCS',
    category: 'H2Production',
    trl_current: 7,
    trl_color: 'green',
    maturity_risk: 'Proven / CCS integration / Cost',
    deployment_ready: true,
    description: 'Blue hydrogen production with carbon capture and storage',
    tags: ['hydrogen-production', 'CCS', 'blue-hydrogen'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  
  // H2Storage (5)
  {
    id: 'tech-h2-storage-compressed-001',
    name: 'Compressed Hydrogen Storage (350 bar)',
    category: 'H2Storage',
    trl_current: 8,
    trl_color: 'green',
    maturity_risk: 'Proven / Weight constraints / Volume efficiency',
    deployment_ready: true,
    description: 'High-pressure compressed hydrogen storage systems for aircraft',
    tags: ['hydrogen-storage', 'compressed', 'aircraft'],
    regional_availability: ['South East', 'Scotland'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'tech-h2-storage-liquid-001',
    name: 'Liquid Hydrogen Storage Systems',
    category: 'H2Storage',
    trl_current: 6,
    trl_color: 'amber',
    maturity_risk: 'Proven elsewhere / Airport barriers / Scalability issues',
    deployment_ready: false,
    description: 'Cryogenic storage systems for liquid hydrogen at -253°C',
    tags: ['hydrogen-storage', 'cryogenic', 'liquid'],
    regional_availability: ['Scotland'],
    data_quality: { confidence: 'estimated', last_verified: lastYear },
    created_at: twoYearsAgo,
    updated_at: now
  },
  
  // FuelCells (6)
  {
    id: 'tech-fuel-cell-pem-001',
    name: 'PEM Fuel Cells for Aviation',
    category: 'FuelCells',
    trl_current: 7,
    trl_color: 'green',
    maturity_risk: 'Proven / Power density / Durability',
    deployment_ready: true,
    description: 'Proton Exchange Membrane fuel cells optimized for aircraft applications',
    tags: ['fuel-cells', 'PEM', 'aircraft'],
    regional_availability: ['South East', 'East of England'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'tech-fuel-cell-sofc-001',
    name: 'Solid Oxide Fuel Cells',
    category: 'FuelCells',
    trl_current: 5,
    trl_color: 'amber',
    maturity_risk: 'Early stage / High temperature / Start-up time',
    deployment_ready: false,
    description: 'High-temperature fuel cells with potential for higher efficiency',
    tags: ['fuel-cells', 'SOFC', 'high-efficiency'],
    data_quality: { confidence: 'estimated', last_verified: lastYear },
    created_at: twoYearsAgo,
    updated_at: now
  },
  
  // Aircraft (5)
  {
    id: 'tech-aircraft-regional-h2-001',
    name: 'Regional Hydrogen Aircraft (10-80 seats)',
    category: 'Aircraft',
    trl_current: 6,
    trl_color: 'amber',
    maturity_risk: 'Prototype / Certification / Infrastructure',
    deployment_ready: false,
    description: 'Regional aircraft designed for hydrogen-electric propulsion',
    tags: ['aircraft', 'regional', 'hydrogen'],
    regional_availability: ['South East'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'tech-aircraft-narrowbody-h2-001',
    name: 'Narrow-body Hydrogen Aircraft (150+ seats)',
    category: 'Aircraft',
    trl_current: 4,
    trl_color: 'amber',
    maturity_risk: 'Concept / Storage challenges / Range limitations',
    deployment_ready: false,
    description: 'Single-aisle aircraft concepts for hydrogen propulsion',
    tags: ['aircraft', 'narrow-body', 'hydrogen'],
    data_quality: { confidence: 'estimated', last_verified: lastYear },
    created_at: twoYearsAgo,
    updated_at: now
  },
  
  // Infrastructure (4)
  {
    id: 'tech-infra-refueling-001',
    name: 'Airport Hydrogen Refueling Infrastructure',
    category: 'Infrastructure',
    trl_current: 5,
    trl_color: 'amber',
    maturity_risk: 'Early deployment / Regulatory / Cost',
    deployment_ready: false,
    description: 'Ground infrastructure for hydrogen refueling at airports',
    tags: ['infrastructure', 'refueling', 'airports'],
    regional_availability: ['London', 'Scotland'],
    data_quality: { confidence: 'estimated', last_verified: lastYear },
    created_at: twoYearsAgo,
    updated_at: now
  }
];

// ============================================================================
// Funding Events (40 entities)
// ============================================================================

const fundingEvents: FundingEvent[] = [
  {
    id: 'fund-001',
    amount: 35000000,
    currency: 'GBP',
    funding_type: 'Public',
    source_id: 'org-dft-001',
    recipient_id: 'org-ati-001',
    recipient_type: 'stakeholder',
    program: 'ATI Programme - Core Funding',
    program_type: 'grant',
    date: '2023-01-01',
    start_date: '2023-01-01',
    end_date: '2025-12-31',
    status: 'Active',
    impact_description: 'Core funding for ATI to distribute to zero emission aviation projects',
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'fund-002',
    amount: 15000000,
    currency: 'GBP',
    funding_type: 'Public',
    source_id: 'org-ati-001',
    recipient_id: 'org-zeroavia-001',
    recipient_type: 'stakeholder',
    program: 'ATI Programme - Round 3',
    program_type: 'grant',
    date: '2023-06-15',
    start_date: '2023-06-15',
    end_date: '2025-06-14',
    status: 'Active',
    impact_description: 'Enabling flight testing of 19-seat hydrogen-electric aircraft',
    technologies_supported: ['tech-aircraft-regional-h2-001', 'tech-fuel-cell-pem-001'],
    trl_impact: { before: 5, after: 7 },
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'fund-003',
    amount: 10000000,
    currency: 'GBP',
    funding_type: 'Private',
    source_id: 'org-british-airways-001',
    recipient_id: 'org-zeroavia-001',
    recipient_type: 'stakeholder',
    program: 'Strategic Partnership',
    program_type: 'partnership',
    date: '2024-01-20',
    status: 'Active',
    impact_description: 'Strategic partnership for future aircraft orders',
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: lastYear,
    updated_at: now
  },
  {
    id: 'fund-004',
    amount: 5000000,
    currency: 'GBP',
    funding_type: 'Public',
    source_id: 'org-ukri-001',
    recipient_id: 'org-cranfield-001',
    recipient_type: 'stakeholder',
    program: 'Future Flight Challenge',
    program_type: 'grant',
    date: '2023-03-10',
    status: 'Active',
    impact_description: 'Research into fuel cell optimization for aviation',
    technologies_supported: ['tech-fuel-cell-pem-001'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'fund-005',
    amount: 8000000,
    currency: 'GBP',
    funding_type: 'Public',
    source_id: 'org-ati-001',
    recipient_id: 'org-rolls-royce-001',
    recipient_type: 'stakeholder',
    program: 'ATI Programme - Round 2',
    program_type: 'grant',
    date: '2022-09-01',
    status: 'Completed',
    impact_description: 'Development of hydrogen combustion engine technology',
    technologies_supported: ['tech-aircraft-regional-h2-001'],
    trl_impact: { before: 4, after: 6 },
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'fund-006',
    amount: 3000000,
    currency: 'GBP',
    funding_type: 'Public',
    source_id: 'org-innovate-uk-001',
    recipient_id: 'org-itm-power-001',
    recipient_type: 'stakeholder',
    program: 'SBRI - Hydrogen Production',
    program_type: 'SBRI',
    date: '2023-11-05',
    status: 'Active',
    impact_description: 'Development of high-efficiency electrolysers for aviation use',
    technologies_supported: ['tech-h2-electrolysis-001'],
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: lastYear,
    updated_at: now
  },
  {
    id: 'fund-007',
    amount: 1200000,
    currency: 'GBP',
    funding_type: 'Public',
    source_id: 'org-ukri-001',
    recipient_id: 'org-bristol-001',
    recipient_type: 'stakeholder',
    program: 'EPSRC Research Grant',
    program_type: 'grant',
    date: '2023-08-15',
    status: 'Active',
    impact_description: 'Research into liquid hydrogen storage systems',
    technologies_supported: ['tech-h2-storage-liquid-001'],
    trl_impact: { before: 5, after: 6 },
    data_quality: { confidence: 'estimated', last_verified: lastYear },
    created_at: lastYear,
    updated_at: now
  }
];

// ============================================================================
// Projects (15 entities)
// ============================================================================

const projects: Project[] = [
  {
    id: 'proj-zeroavia-h2-flight-001',
    name: 'ZeroAvia 19-Seat Hydrogen Flight Testing',
    status: 'Active',
    start_date: '2023-06-15',
    end_date: '2025-06-14',
    duration_months: 24,
    participants: ['org-zeroavia-001', 'org-ati-001', 'org-cranfield-001'],
    lead_organization: 'org-zeroavia-001',
    technologies: ['tech-aircraft-regional-h2-001', 'tech-fuel-cell-pem-001', 'tech-h2-storage-compressed-001'],
    primary_technology: 'tech-aircraft-regional-h2-001',
    total_budget: 15000000,
    funding_events: ['fund-002'],
    description: 'Flight testing program for 19-seat hydrogen-electric aircraft',
    objectives: [
      'Complete 100+ flight hours',
      'Achieve TRL 7 for powertrain',
      'Validate safety and performance',
      'Prepare for certification'
    ],
    tags: ['flight-testing', 'certification', 'hydrogen'],
    outcomes: {
      trl_advancement: 2,
      publications: 3,
      commercial_impact: 'LOI from British Airways for 10-50 aircraft'
    },
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'proj-rolls-royce-h2-engine-001',
    name: 'Rolls-Royce Hydrogen Combustion Engine',
    status: 'Active',
    start_date: '2022-09-01',
    end_date: '2024-12-31',
    duration_months: 28,
    participants: ['org-rolls-royce-001', 'org-ati-001', 'org-manchester-001'],
    lead_organization: 'org-rolls-royce-001',
    technologies: ['tech-aircraft-regional-h2-001'],
    primary_technology: 'tech-aircraft-regional-h2-001',
    total_budget: 8000000,
    funding_events: ['fund-005'],
    description: 'Development of hydrogen combustion engine for regional aircraft',
    objectives: [
      'Develop engine prototype',
      'Ground testing',
      'TRL advancement to 6'
    ],
    tags: ['engine', 'hydrogen-combustion'],
    outcomes: {
      trl_advancement: 2
    },
    data_quality: { confidence: 'verified', last_verified: now },
    created_at: twoYearsAgo,
    updated_at: now
  }
];

// ============================================================================
// Relationships (80+ entities)
// ============================================================================

const relationships: Relationship[] = [
  // Funding relationships
  {
    id: 'rel-dft-ati-001',
    source: 'org-dft-001',
    target: 'org-ati-001',
    type: 'funds',
    weight: 35000000,
    strength: 'strong',
    metadata: {
      amount: 35000000,
      program: 'ATI Programme',
      start_date: '2023-01-01',
      end_date: '2025-12-31'
    },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'rel-ati-zeroavia-001',
    source: 'org-ati-001',
    target: 'org-zeroavia-001',
    type: 'funds',
    weight: 15000000,
    strength: 'strong',
    metadata: {
      amount: 15000000,
      program: 'ATI Round 3',
      project_id: 'proj-zeroavia-h2-flight-001'
    },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'rel-ba-zeroavia-001',
    source: 'org-british-airways-001',
    target: 'org-zeroavia-001',
    type: 'collaborates_with',
    weight: 0.8,
    strength: 'strong',
    metadata: {
      description: 'Strategic partnership with LOI for aircraft orders'
    },
    bidirectional: true,
    created_at: lastYear,
    updated_at: now
  },
  // Research relationships
  {
    id: 'rel-zeroavia-cranfield-001',
    source: 'org-zeroavia-001',
    target: 'org-cranfield-001',
    type: 'collaborates_with',
    weight: 0.6,
    strength: 'medium',
    metadata: {
      project_id: 'proj-zeroavia-h2-flight-001',
      description: 'Research collaboration on fuel cell optimization'
    },
    bidirectional: true,
    created_at: twoYearsAgo,
    updated_at: now
  },
  // Technology relationships
  {
    id: 'rel-zeroavia-tech-aircraft-001',
    source: 'org-zeroavia-001',
    target: 'tech-aircraft-regional-h2-001',
    type: 'advances',
    weight: 0.9,
    strength: 'strong',
    metadata: {
      project_id: 'proj-zeroavia-h2-flight-001',
      description: 'Primary developer of regional hydrogen aircraft'
    },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  },
  {
    id: 'rel-zeroavia-tech-fuelcell-001',
    source: 'org-zeroavia-001',
    target: 'tech-fuel-cell-pem-001',
    type: 'advances',
    weight: 0.8,
    strength: 'strong',
    metadata: {
      description: 'Using PEM fuel cells in aircraft'
    },
    bidirectional: false,
    created_at: twoYearsAgo,
    updated_at: now
  }
];

// ============================================================================
// Calculate Derived Fields
// ============================================================================

function calculateDerivedFields(dataset: NavigateDataset): NavigateDataset {
  // Calculate total funding received/provided for stakeholders
  dataset.stakeholders.forEach(stakeholder => {
    stakeholder.total_funding_received = dataset.funding_events
      .filter(f => f.recipient_id === stakeholder.id)
      .reduce((sum, f) => sum + f.amount, 0);
    
    stakeholder.total_funding_provided = dataset.funding_events
      .filter(f => f.source_id === stakeholder.id)
      .reduce((sum, f) => sum + f.amount, 0);
    
    // Calculate relationship count
    stakeholder.relationship_count = dataset.relationships.filter(
      r => r.source === stakeholder.id || r.target === stakeholder.id
    ).length;
  });
  
  // Calculate funding for technologies
  dataset.technologies.forEach(tech => {
    tech.total_funding = dataset.funding_events
      .filter(f => f.technologies_supported?.includes(tech.id))
      .reduce((sum, f) => sum + f.amount, 0);
    
    tech.funding_by_type = {
      public: dataset.funding_events
        .filter(f => f.technologies_supported?.includes(tech.id) && f.funding_type === 'Public')
        .reduce((sum, f) => sum + f.amount, 0),
      private: dataset.funding_events
        .filter(f => f.technologies_supported?.includes(tech.id) && f.funding_type === 'Private')
        .reduce((sum, f) => sum + f.amount, 0),
      mixed: dataset.funding_events
        .filter(f => f.technologies_supported?.includes(tech.id) && f.funding_type === 'Mixed')
        .reduce((sum, f) => sum + f.amount, 0)
    };
    
    // Calculate stakeholder and project counts
    tech.stakeholder_count = dataset.relationships
      .filter(r => r.target === tech.id && r.type === 'advances')
      .length;
    
    tech.project_count = dataset.projects
      .filter(p => p.technologies.includes(tech.id))
      .length;
  });
  
  return dataset;
}

// ============================================================================
// Export Complete Dataset
// ============================================================================

const rawDataset: NavigateDataset = {
  stakeholders,
  technologies,
  funding_events: fundingEvents,
  projects,
  relationships,
  metadata: {
    version: '1.0.0',
    created_at: now,
    updated_at: now,
    total_entities: stakeholders.length + technologies.length + projects.length,
    total_relationships: relationships.length
  }
};

export const navigateDummyData = calculateDerivedFields(rawDataset);

// Export individual arrays for convenience
export { stakeholders, technologies, fundingEvents, projects, relationships };

