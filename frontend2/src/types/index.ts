// Node types for the 4-layer evidence graph
export type NodeType = 'question' | 'answer_root' | 'answer_block' | 'direct_source' | 'secondary_source';

// Base node interface
export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  displayHeading?: string; // Short heading for 3D graph display (max 3 words)
  position?: [number, number, number];
  metadata: {
    layer: number;
    [key: string]: any;
  };
}

// Layer 0: Question node
export interface QuestionNode extends GraphNode {
  type: 'question';
  metadata: {
    layer: 0;
    fullText: string;
  };
}

// Layer 0: Answer root node
export interface AnswerRootNode extends GraphNode {
  type: 'answer_root';
  metadata: {
    layer: 0;
    fullText: string;
  };
}

// Layer 1: Answer block nodes
export interface AnswerBlockNode extends GraphNode {
  type: 'answer_block';
  metadata: {
    layer: 1;
    fullText: string;
    blockType?: 'paragraph' | 'bullet';
  };
}

// Layer 2: Direct source nodes
export interface DirectSourceNode extends GraphNode {
  type: 'direct_source';
  metadata: {
    layer: 2;
    url?: string;
    snippet?: string;
    score?: number;
    provider?: string;
    publishedDate?: string;
    author?: string;
    highlights?: string[];
    favicon?: string;
    image?: string;
  };
}

// Layer 3: Secondary source (concept) nodes
export interface SecondarySourceNode extends GraphNode {
  type: 'secondary_source';
  metadata: {
    layer: 3;
    fullText?: string;
    primaryParentId?: string;
    parentSourceId?: string;
    relatedBlockIds?: string[];
    branchId?: string;
    importance?: number;
  };
}

// Union type for all nodes
export type Node = QuestionNode | AnswerRootNode | AnswerBlockNode | DirectSourceNode | SecondarySourceNode;

// Edge interface for evidence graph
export interface Edge {
  from: string;
  to: string;
  relation: 'answers' | 'supports' | 'underpins' | 'semantic_related';
  weight?: number;
  source?: string; // For compatibility - maps to 'from'
  target?: string; // For compatibility - maps to 'to'
}

// Evidence graph structure
export interface EvidenceGraph {
  nodes: Node[];
  edges: Edge[];
  metadata?: {
    totalNodes?: number;
    totalEdges?: number;
    layers?: number;
  };
}

// API Response structure
export interface ReasoningResponse {
  question: string;
  answer: {
    text: string;
    blocks: {
      id: string;
      type: 'paragraph' | 'bullet';
      text: string;
      source_ids: string[];
    }[];
  };
  sources: {
    id: string;
    title: string;
    url: string;
    snippet: string;
    full_text?: string;
    score: number;
    metadata?: {
      provider?: string;
      exa_id?: string;
      published_date?: string;
      author?: string;
      highlights?: string[];
      highlight_scores?: number[];
      favicon?: string;
      image?: string;
    };
  }[];
  evidence_graph: EvidenceGraph;
  meta?: {
    requestId?: string;
    processingTimeMs?: number;
  };
}
