import { Node, QuestionNode, AnswerRootNode, AnswerBlockNode, DirectSourceNode, SecondarySourceNode } from '../types'
import './Sidebar.css'

interface SidebarProps {
  node: Node | null
  isExpanded: boolean
  onToggle: () => void
}

export default function Sidebar({ node, isExpanded, onToggle }: SidebarProps) {
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
          </div>
        </>
      )
    } else if (node.type === 'direct_source') {
      const sourceNode = node as DirectSourceNode
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
