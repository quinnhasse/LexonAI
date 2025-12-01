import React, { useState, useMemo } from 'react';
import { Node as GraphNode, Edge as GraphEdge } from '../types';
import './KnowledgeDeck.css';
import { Brain, FileText, Link as LinkIcon, HelpCircle, Layers, ChevronDown, ArrowRight, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KnowledgeDeckProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick: (node: GraphNode) => void;
  highlightedNodes?: Set<string>;
  activeSpotlight?: string | null;
}

interface IntelligenceRibbonProps {
  node: GraphNode;
  onClick: () => void;
  isHighlighted: boolean;
  isDimmed: boolean;
  onHover: (nodeId: string | null) => void;
  showArrow?: boolean;
}

const IntelligenceRibbon: React.FC<IntelligenceRibbonProps> = ({ node, onClick, isHighlighted, isDimmed, onHover, showArrow }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine accent color and icon based on node type/layer
  let accentClass = 'ribbon-accent-concept';
  let Icon = Layers;
  let typeLabel = 'Concept';
  
  if (node.type === 'question' || node.type === 'answer_root') {
    accentClass = 'ribbon-accent-query';
    Icon = HelpCircle;
    typeLabel = 'Query';
  } else if (node.type === 'answer_block') {
    accentClass = 'ribbon-accent-logic';
    Icon = Brain;
    typeLabel = 'Logic';
  } else if (node.type === 'direct_source') {
    accentClass = 'ribbon-accent-evidence';
    Icon = LinkIcon;
    typeLabel = 'Source';
  } else if (node.type === 'secondary_source') {
    accentClass = 'ribbon-accent-context';
    Icon = FileText;
    typeLabel = 'Context';
  }

  // Extract description snippet
  const description = useMemo(() => {
    if (node.metadata.snippet) return node.metadata.snippet;
    if (node.metadata.text) return node.metadata.text;
    if (node.metadata.fullText) return node.metadata.fullText;
    return 'No preview available.';
  }, [node]);

  // Create 1-line snippet for header
  const snippet = description.length > 60 ? description.substring(0, 60) + '...' : description;

  // Score Color Coding
  const score = node.metadata.score || 0;
  const scoreColor = score > 0.8 ? '#4ADE80' : score > 0.5 ? '#FACC15' : '#9CA3AF';

  const handleRibbonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    onClick();
  };

  return (
    <motion.div 
      className={`intelligence-ribbon ${isHighlighted ? 'highlighted' : ''} ${isDimmed ? 'dimmed' : ''}`}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onClick={handleRibbonClick}
      layout
    >
      {/* Thick Glowing Left Border */}
      <div className={`ribbon-left-border ${accentClass}`} />

      <div className="ribbon-content-wrapper">
        {/* Main Row Content (Always Visible) */}
        <div className="ribbon-header-row">
          {/* Rank Badge */}
          <div className="ribbon-rank-badge" style={{ color: scoreColor, borderColor: scoreColor }}>
            {score ? `${Math.round(score * 100)}%` : '-'}
          </div>

          {/* Title & Snippet Container */}
          <div className="ribbon-info-col">
            <div className="ribbon-title">
              {node.label || node.displayHeading || node.shortLabel}
            </div>
            <div className="ribbon-snippet">
              {snippet}
            </div>
          </div>

          {/* Metadata Icons (Right Aligned) */}
          <div className="ribbon-meta-icons">
            {showArrow && <ArrowRight size={14} className="ribbon-flow-arrow" />}
            <div className="ribbon-type-icon" title={typeLabel}>
              <Icon size={14} />
            </div>
            <motion.div 
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={14} className="ribbon-expand-icon" />
            </motion.div>
          </div>
        </div>

        {/* Expandable Description (Accordion) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="ribbon-expanded-content"
            >
              <div className="ribbon-description">
                {description}
              </div>
              <div className="ribbon-footer">
                 <span className="ribbon-tag">{typeLabel}</span>
                 <button className="ribbon-action-btn">View Details</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export const KnowledgeDeck: React.FC<KnowledgeDeckProps> = ({ nodes, edges, onNodeClick, highlightedNodes, activeSpotlight }) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Helper to check if node matches active spotlight
  const isNodeInSpotlight = (node: GraphNode): boolean => {
    if (!activeSpotlight) return true;
    switch (activeSpotlight) {
      case 'QUERY': return node.type === 'question' || node.type === 'answer_root';
      case 'LOGIC': return node.type === 'answer_block';
      case 'EVIDENCE': return node.type === 'direct_source';
      case 'CONTEXT': return node.type === 'secondary_source';
      default: return false;
    }
  };

  // Group nodes into columns
  const columns = useMemo(() => {
    const cols = {
      query: [] as GraphNode[],
      logic: [] as GraphNode[],
      evidence: [] as GraphNode[]
    };

    nodes.forEach(node => {
      if (node.metadata.layer === 0 || node.type === 'question' || node.type === 'answer_root') {
        cols.query.push(node);
      }
      else if (node.metadata.layer === 1 || node.metadata.layer === 3 || node.type === 'answer_block' || node.type === 'secondary_source') {
        cols.logic.push(node);
      }
      else if (node.metadata.layer === 2 || node.type === 'direct_source') {
        cols.evidence.push(node);
      }
    });

    // Sort columns
    cols.logic.sort((a, b) => (b.metadata.importance || 0) - (a.metadata.importance || 0));
    cols.evidence.sort((a, b) => (b.metadata.score || 0) - (a.metadata.score || 0));

    return cols;
  }, [nodes]);

  // Filter columns based on Show All toggle
  const filteredColumns = useMemo(() => {
    if (showAll) return columns;
    return {
      query: columns.query,
      logic: columns.logic.slice(0, 5),
      evidence: columns.evidence.slice(0, 5)
    };
  }, [columns, showAll]);

  // Determine highlighted nodes and dimming state
  const { activeIds, isDimmingActive } = useMemo(() => {
    const ids = new Set<string>();
    let dimmingActive = false;

    // 1. Add externally highlighted nodes (e.g. from search)
    if (highlightedNodes) {
      highlightedNodes.forEach(id => ids.add(id));
    }

    // 2. Handle Local Hover (Highest Priority)
    if (hoveredNodeId) {
      dimmingActive = true;
      ids.clear(); // Clear previous to focus on thread
      ids.add(hoveredNodeId);
      edges.forEach(edge => {
        const sourceId = edge.source || edge.from;
        const targetId = edge.target || edge.to;
        if (sourceId === hoveredNodeId) ids.add(targetId);
        if (targetId === hoveredNodeId) ids.add(sourceId);
      });
    } 
    // 3. Handle Spotlight (Secondary Priority)
    else if (activeSpotlight) {
      dimmingActive = true;
      // Add all nodes matching the spotlight type
      nodes.forEach(node => {
        if (isNodeInSpotlight(node)) {
          ids.add(node.id);
        }
      });
    }

    return { activeIds: ids, isDimmingActive: dimmingActive };
  }, [hoveredNodeId, edges, highlightedNodes, activeSpotlight, nodes]);

  return (
    <div className="knowledge-deck-container feed-mode">
      {/* Header / Filter Bar */}
      <div className="deck-controls-bar">
        <div className="deck-mode-label">INTELLIGENCE FEED</div>
          <button 
          className={`deck-filter-toggle ${showAll ? 'active' : ''}`}
          onClick={() => setShowAll(!showAll)}
        >
          <Filter size={12} />
          {showAll ? "SHOW: ALL" : "SHOW: TOP 5"}
          </button>
      </div>

      <div className="feed-board">
        {/* Column 1: THE QUERY */}
        <div className="feed-column">
          <div className="feed-column-header">
            <div className="feed-column-title">QUERY STREAM</div>
            <div className="feed-column-line accent-query"></div>
              </div>
          <div className="feed-column-content">
            {filteredColumns.query.map(node => (
              <IntelligenceRibbon 
                    key={node.id} 
                    node={node} 
                onClick={() => onNodeClick(node)}
                isHighlighted={activeIds.has(node.id)}
                isDimmed={isDimmingActive && !activeIds.has(node.id)}
                    onHover={setHoveredNodeId}
                  />
                ))}
              </div>
        </div>

        {/* Connector */}
        <div className="feed-connector">
          <ArrowRight size={20} color="#333" />
        </div>

        {/* Column 2: LOGIC FEED */}
        <div className="feed-column">
          <div className="feed-column-header">
            <div className="feed-column-title">LOGIC FEED</div>
            <div className="feed-column-line accent-logic"></div>
              </div>
          <div className="feed-column-content">
            {filteredColumns.logic.map(node => (
              <IntelligenceRibbon 
                    key={node.id} 
                    node={node} 
                onClick={() => onNodeClick(node)}
                isHighlighted={activeIds.has(node.id)}
                isDimmed={isDimmingActive && !activeIds.has(node.id)}
                    onHover={setHoveredNodeId}
                showArrow={true} // Arrow pointing to evidence
                  />
                ))}
            {!showAll && columns.logic.length > 5 && (
              <div className="feed-more-indicator" onClick={() => setShowAll(true)}>
                + {columns.logic.length - 5} MORE ITEMS...
              </div>
            )}
          </div>
        </div>

        {/* Connector */}
        <div className="feed-connector">
          <ArrowRight size={20} color="#333" />
        </div>

        {/* Column 3: EVIDENCE FEED */}
        <div className="feed-column">
          <div className="feed-column-header">
            <div className="feed-column-title">EVIDENCE FEED</div>
            <div className="feed-column-line accent-evidence"></div>
              </div>
          <div className="feed-column-content">
            {filteredColumns.evidence.map(node => (
              <IntelligenceRibbon 
                    key={node.id} 
                    node={node} 
                onClick={() => onNodeClick(node)}
                isHighlighted={activeIds.has(node.id)}
                isDimmed={isDimmingActive && !activeIds.has(node.id)}
                    onHover={setHoveredNodeId}
                  />
                ))}
             {!showAll && columns.evidence.length > 5 && (
              <div className="feed-more-indicator" onClick={() => setShowAll(true)}>
                + {columns.evidence.length - 5} MORE ITEMS...
    </div>
        )}
      </div>
      </div>
      </div>
    </div>
  );
};

export default KnowledgeDeck;
