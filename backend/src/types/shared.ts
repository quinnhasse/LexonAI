/**
 * Shared types for Transparens AI
 * These types define the structure of our JSON responses and data flow
 */

export interface Source {
  id: string;              // e.g. "s1"
  title: string;
  url: string;
  snippet: string;
  full_text?: string;
  score?: number;
  metadata?: Record<string, any>;
}

export type AnswerBlockType = "paragraph" | "bullet";

export interface AnswerBlock {
  id: string;              // e.g. "ans-1"
  type: AnswerBlockType;
  text: string;
  source_ids: string[];    // IDs of Source objects like ["s1", "s3"]
}

export interface AnswerPayload {
  text: string;            // full answer text
  blocks: AnswerBlock[];
}

export interface EvidenceNode {
  id: string;              // "q", "ans-1", "s1", etc.
  type: "question" | "answer_block" | "source";
  label: string;
}

export interface EvidenceEdge {
  from: string;            // node id
  to: string;              // node id
  relation: "answers" | "supports";
}

export interface EvidenceGraph {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
}

export interface AnswerResponse {
  question: string;
  answer: AnswerPayload;
  sources: Source[];
  evidence_graph: EvidenceGraph;
  meta: {
    model?: string;
    retrieval_latency_ms?: number;
    answer_latency_ms?: number;
    [key: string]: any;
  };
}
