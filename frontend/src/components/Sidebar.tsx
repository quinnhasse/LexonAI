import { useEffect, useRef, useState } from 'react'
import { API_BASE_URL } from '../services/api'
import { Node, QuestionNode, AnswerRootNode, AnswerBlockNode, DirectSourceNode, SecondarySourceNode, Edge } from '../types'
import { v4 as uuidv4 } from 'uuid'
import './Sidebar.css'

interface SidebarProps {
  node: Node | null
  isExpanded: boolean
  onToggle: () => void
  onAddNodesAndEdges: (newNodes: Node[], newEdges: Edge[]) => void
  edges: Edge[]
}

type ExpandApiResponse = {
  title: string
  expandedReasoning: string
  meta?: {
    model?: string
    latency_ms?: number
  }
}

type ExpandSourceApiResponse = {
  concepts: {
    title: string
    text: string
    short_label: string
    importance: number
  }[]
  meta: {
    latencyMs: number
    densityLevel: string
    sourceTitle: string
    sourceUrl: string
  }
}

export default function Sidebar({ node, isExpanded, onToggle, onAddNodesAndEdges, edges }: SidebarProps) {
  const [expandedReasoning, setExpandedReasoning] = useState<string | null>(null)
  const [isExpanding, setIsExpanding] = useState(false)
  const [expandError, setExpandError] = useState<string | null>(null)
  const [expandMeta, setExpandMeta] = useState<string | null>(null)
  const [isExpandingSource, setIsExpandingSource] = useState(false)
  const [sourceExpandError, setSourceExpandError] = useState<string | null>(null)
  const [hasExpandedSource, setHasExpandedSource] = useState(false)
  const latestNodeIdRef = useRef<string | null>(null)

  useEffect(() => {
    latestNodeIdRef.current = node?.id ?? null
    setExpandedReasoning(null)
    setIsExpanding(false)
    setExpandError(null)
    setExpandMeta(null)
    setIsExpandingSource(false)
    setSourceExpandError(null)
    setHasExpandedSource(false)
  }, [node?.id])

  const renderContent = () => {
    if (!node) return null

    if (node.type === 'question') {
      const questionNode = node as QuestionNode
      return (
        <>
          <div className="content-section">
            <h4>Question</h4>
            <p>{questionNode.metadata.fullText}</p>
          </div>
        </>
      )
    } else if (node.type === 'answer_root') {
      const answerNode = node as AnswerRootNode
      return (
        <>
          <div className="content-section">
            <h4>Full Answer</h4>
            <p>{answerNode.metadata.fullText}</p>
          </div>
        </>
      )
    } else if (node.type === 'answer_block') {
      const blockNode = node as AnswerBlockNode
      const reasoningText = blockNode.metadata.fullText || ''
      const blockTitle = (blockNode.displayHeading || blockNode.label || 'Answer Block').trim() || 'Answer Block'
      const trimmedReasoning = reasoningText.trim()

      const blockRequestId = blockNode.id
      const isActiveRequest = () => latestNodeIdRef.current === blockRequestId

      const handleExpandReasoning = async () => {
        if (isExpanding) return
        if (!trimmedReasoning) {
          setExpandError('Reasoning is empty and cannot be expanded.')
          return
        }

        setIsExpanding(true)
        setExpandError(null)

        try {
          const response = await fetch(`${API_BASE_URL}/expand`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: blockTitle,
              reasoning: reasoningText,
            }),
          })

          if (!isActiveRequest()) return

          if (!response.ok) {
            const errorPayload = await response.json().catch(() => null)
            if (!isActiveRequest()) return
            const message = errorPayload?.error || 'Unable to expand reasoning right now.'
            setExpandError(message)
            return
          }

          const data = (await response.json()) as ExpandApiResponse
          if (!isActiveRequest()) return

          if (!data?.expandedReasoning) {
            setExpandError('Expanded reasoning is missing from the response.')
            return
          }

          if (!isActiveRequest()) return
          setExpandedReasoning(data.expandedReasoning)
          const metaPieces: string[] = []
          if (data.meta) {
            if (data.meta.model) metaPieces.push(data.meta.model)
            if (data.meta.latency_ms !== undefined) metaPieces.push(`${data.meta.latency_ms} ms`)
          }
          setExpandMeta(metaPieces.join(' · ') || null)
        } catch (err) {
          if (!isActiveRequest()) return
          setExpandError('Unable to reach the expand service.')
        } finally {
          setIsExpanding(false)
        }
      }

      return (
        <>
          {blockNode.metadata.blockType && (
            <div className="content-section">
              <h4>Block Type</h4>
              <p className="source-text">{blockNode.metadata.blockType}</p>
            </div>
          )}
          <div className="content-section">
            <h4>Reasoning</h4>
            <p>{blockNode.metadata.fullText}</p>
            <div className="expand-control">
              {!expandedReasoning ? (
                <button
                  type="button"
                  className="expand-button"
                  onClick={handleExpandReasoning}
                  disabled={isExpanding || !trimmedReasoning}
                >
                  {isExpanding ? 'Expanding…' : 'Expand'}
                </button>
              ) : (
                <div style={{width: '110%', marginLeft: '-5%' }} className="expanded-reasoning-block">
                  <p className="expanded-reasoning">{expandedReasoning}</p>
                  {expandMeta && <><br/><p className="expanded-reasoning-meta">{expandMeta}</p></>}
                </div>
              )}
              {expandError && <p className="expand-error">{expandError}</p>}
            </div>
          </div>
        </>
      )
    } else if (node.type === 'direct_source') {
      const sourceNode = node as DirectSourceNode
      const sourceRequestId = sourceNode.id
      const isActiveRequest = () => latestNodeIdRef.current === sourceRequestId

      const handleExpandSource = async () => {
        if (isExpandingSource || hasExpandedSource) return

        const url = sourceNode.metadata.url
        const title = sourceNode.label || 'Unknown Source'
        const content = sourceNode.metadata.full_text

        if (!url || !content) {
          setSourceExpandError('Source is missing URL or content and cannot be expanded.')
          return
        }

        setIsExpandingSource(true)
        setSourceExpandError(null)

        try {
          const response = await fetch(`${API_BASE_URL}/api/expand/source`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title,
              url,
              content,
              densityLevel: 'medium',
            }),
          })

          if (!isActiveRequest()) return

          if (!response.ok) {
            const errorPayload = await response.json().catch(() => null)
            if (!isActiveRequest()) return
            const message = errorPayload?.error || 'Unable to expand source right now.'
            setSourceExpandError(message)
            return
          }

          const data = (await response.json()) as ExpandSourceApiResponse
          if (!isActiveRequest()) return

          if (!data?.concepts || data.concepts.length === 0) {
            setSourceExpandError('No concepts were extracted from the source.')
            return
          }

          // Find answer_block nodes that this source supports
          const answerBlockIds = edges
            .filter(edge => edge.to === sourceNode.id && edge.relation === 'supports')
            .map(edge => edge.from)

          // Create new secondary_source nodes for each concept
          const newNodes: Node[] = data.concepts.map(concept => {
            const nodeId = `secondary_${uuidv4()}`
            return {
              id: nodeId,
              type: 'secondary_source' as const,
              label: concept.title,
              shortLabel: concept.short_label,
              displayHeading: concept.short_label,
              metadata: {
                layer: 3,
                fullText: concept.text,
                importance: concept.importance,
                parentSourceId: sourceNode.id,
                relatedBlockIds: answerBlockIds,
              },
            }
          })

          // Create edges from this source to the new secondary sources
          const newEdges: Edge[] = newNodes.map(newNode => ({
            from: sourceNode.id,
            to: newNode.id,
            source: sourceNode.id,
            target: newNode.id,
            relation: 'underpins' as const,
            weight: 1.0,
          }))

          // Add the new nodes and edges to the graph
          onAddNodesAndEdges(newNodes, newEdges)
          setHasExpandedSource(true)
        } catch (err) {
          if (!isActiveRequest()) return
          setSourceExpandError('Unable to reach the expand service.')
        } finally {
          setIsExpandingSource(false)
        }
      }
      return (
        <>
          <div className="content-section">
            <h4>Title</h4>
            <p>{node.label}</p>
          </div>
          {sourceNode.metadata.snippet && (
            <div className="content-section">
              <h4>Snippet</h4>
              <p>{sourceNode.metadata.snippet}</p>
            </div>
          )}
          {sourceNode.metadata.url && (
            <div className="content-section">
              <h4>URL</h4>
              <a
                href={sourceNode.metadata.url}
                target="_blank"
                rel="noopener noreferrer"
                className="source-link"
              >
                {sourceNode.metadata.url}
              </a>
            </div>
          )}
          {sourceNode.metadata.score !== undefined && (
            <div className="content-section">
              <h4>Score</h4>
              <p className="source-text">{sourceNode.metadata.score.toFixed(2)}</p>
            </div>
          )}
          {sourceNode.metadata.author && (
            <div className="content-section">
              <h4>Author</h4>
              <p className="source-text">{sourceNode.metadata.author}</p>
            </div>
          )}
          {sourceNode.metadata.publishedDate && (
            <div className="content-section">
              <h4>Published</h4>
              <p className="source-text">{sourceNode.metadata.publishedDate}</p>
            </div>
          )}
          <div className="content-section">
            <h4>Expand Source</h4>
            <p className="source-text" style={{ fontSize: '11px', marginBottom: '12px', color: '#999' }}>
              Extract concepts from this source and add them to the graph
            </p>
            <div className="expand-control">
              {!hasExpandedSource ? (
                <button
                  type="button"
                  className="expand-button"
                  onClick={handleExpandSource}
                  disabled={isExpandingSource || !sourceNode.metadata.url || !sourceNode.metadata.full_text}
                >
                  {isExpandingSource ? 'Expanding…' : 'Expand'}
                </button>
              ) : (
                <div style={{width: '110%', marginLeft: '-5%' }} className="expanded-reasoning-block">
                  <p className="expanded-reasoning" style={{ textAlign: 'center' }}>
                    ✓ Concepts added to graph
                  </p>
                </div>
              )}
              {sourceExpandError && <p className="expand-error">{sourceExpandError}</p>}
            </div>
          </div>
        </>
      )
    } else if (node.type === 'secondary_source') {
      const secondaryNode = node as SecondarySourceNode
      return (
        <>
          <div className="content-section">
            <h4>Concept</h4>
            <p>{node.label}</p>
          </div>
          {secondaryNode.metadata.fullText && (
            <div className="content-section">
              <h4>Description</h4>
              <p>{secondaryNode.metadata.fullText}</p>
            </div>
          )}
          {secondaryNode.metadata.importance !== undefined && (
            <div className="content-section">
              <h4>Importance</h4>
              <p className="source-text">{secondaryNode.metadata.importance.toFixed(2)}</p>
            </div>
          )}
        </>
      )
    }
  }

  if (!node) return null

  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        <button className="toggle-button" onClick={onToggle} title={isExpanded ? 'Collapse' : 'Expand'}>
          {isExpanded ? (
            // Chevron right icon (collapse)
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          ) : (
            // Chevron left icon (expand)
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          )}
        </button>
        {isExpanded && (
          <div className="header-content">
            <span className="role-badge" data-role={node.type}>
              {node.type.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="sidebar-content">
          {renderContent()}
        </div>
      )}
    </div>
  )
}
