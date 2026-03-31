export interface PivotHistoryItem {
  idea: string;
  status: string;
  date: string;
  reportUrl: string | null;
}

export interface Idea {
  idea: string;
  description: string;
  pain: string;
  source: string;
  painScore: number | null;
  status: string;
  reportUrl: string | null;
  pivotHistory: PivotHistoryItem[] | null;
}

export interface IdeasData {
  candidates: Idea[];
  backlog: Idea[];
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

export interface Product {
  name: string;
  slug: string;
  phase: string;
  url: string;
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
