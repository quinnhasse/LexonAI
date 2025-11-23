import { NodeType } from '../types'

// Shared helper for visual node radii so particles/edges stay in sync
export const getNodeRadius = (
  nodeType: NodeType
): number => {
  const radiusMap: Record<NodeType, number> = {
    question: 1.2,
    answer_root: 2.5,
    answer_block: 0.8,
    direct_source: 0.6,
    secondary_source: 0.4,
  }

  return radiusMap[nodeType]
}
