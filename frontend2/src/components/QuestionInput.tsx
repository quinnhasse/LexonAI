import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import './QuestionInput.css'

interface QuestionInputProps {
  onSubmit: (question: string) => void
  isLoading: boolean
  hasAskedQuestion: boolean
  isDimmed: boolean
  onActivate: () => void
}

export default function QuestionInput({
  onSubmit,
  isLoading,
  hasAskedQuestion,
  isDimmed,
  onActivate,
}: QuestionInputProps) {
  const [question, setQuestion] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (question.trim() && !isLoading) {
      onSubmit(question)
      setQuestion('')
    }
  }

  // Define the animation targets directly
  const animationProps = hasAskedQuestion
    ? {
        // Top state
        top: '20px',
        y: '0%',
        x: '-50%',
        opacity: isDimmed ? 0.6 : 1,
      }
    : {
        // Center state
        top: '50%',
        y: '-50%',
        x: '-50%',
        opacity: 1,
      }

  return (
    <motion.div
      className="question-input-container"
      initial={{ top: '50%', y: '-50%', x: '-50%', opacity: 1 }}
      animate={animationProps}
      transition={{
        duration: 0.8, // Default duration for position
        ease: [0.4, 0, 0.2, 1],
        opacity: { duration: 0.3 }, // Specific duration for opacity
      }}
      onHoverStart={onActivate}
      layout
    >
      <form onSubmit={handleSubmit} className="question-form">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="question-input"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="submit-button"
          disabled={isLoading || !question.trim()}
        >
          {isLoading ? (
            <span className="loader"></span>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </form>
    </motion.div>
  )
}


