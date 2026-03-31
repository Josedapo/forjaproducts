export interface PivotHistoryItem {
  idea: string;
  status: string;
  date: string;
  reportUrl: string | null;
}

export interface ScreeningData {
  evaluatedDate: string;
  verdict: string;
  idea: {
    what: string;
    audience: string;
    problem: string;
    solution: string;
    differentiation: string;
  };
  assumptions: { assumption: string; risk: string }[];
  competitors: { name: string; type: string; dr?: number; weakness: string }[];
  competitiveDensity: string;
  keywords: { keyword: string; volume: number; kd: number }[];
  communitySignals: { type: string; signal: string; source: string }[];
  executability: {
    complexity: string;
    timeline: string;
    dependencies: string;
    risks: string;
  };
  verdict_detail: {
    decision: string;
    inFavor: string[];
    against: string[];
    pivotSuggestions?: string[];
  };
}

export interface Idea {
  idea: string;
  slug?: string;
  description: string;
  pain: string;
  source: string;
  painScore: number | null;
  status: string;
  reportUrl: string | null;
  pivotHistory: PivotHistoryItem[] | null;
  screeningData?: ScreeningData;
}

export interface ScreenedIdea {
  slug: string;
  idea: string;
  screeningData: ScreeningData;
}

export interface IdeasData {
  candidates: Idea[];
  backlog: Idea[];
  screenedIdeas: ScreenedIdea[];
}

export interface TimelineItem {
  idea: string;
  date: string;
  verdict: string;
}

export interface VitalSign {
  metric: string;
  target: string;
}

export interface ProductDocument {
  id: string;
  name: string;
  phase: string;
  content: string;
}

export interface Product {
  name: string;
  slug: string;
  phase: string;
  url: string;
  logoUrl?: string;
  documents?: ProductDocument[];
  origin: {
    ideaSlug: string;
    timeline: TimelineItem[];
  };
  shape: {
    audience: string;
    notFor: string;
    aspiration: string;
    differentiator: string;
    businessModel: string;
    keyMetric: string;
    mlpScope: string;
    seoTarget: string;
  } | null;
  build: {
    techStack: string;
    fonts: string;
    hosting: string;
    domain: string;
    status: string;
    next: string;
  } | null;
  validate: Record<string, unknown> | null;
  launch: {
    vitalSigns: VitalSign[];
  } | null;
}

export interface ProductsData {
  products: Product[];
}
