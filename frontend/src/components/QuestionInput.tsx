import { useState, FormEvent, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
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
  const [lastSubmittedQuestion, setLastSubmittedQuestion] = useState('')
  const [questionBeforeFocus, setQuestionBeforeFocus] = useState('')
  const buttonControls = useAnimation()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (question.trim() && !isLoading) {
      // Trigger button press animation
      await buttonControls.start({
        scale: [1, 0.9, 1],
        transition: { duration: 0.2, ease: 'easeInOut' }
      })

      onSubmit(question)
      setLastSubmittedQuestion(question)
      // Keep the question visible in the input after submission
    }
  }

  const handleFocus = () => {
    // Store the current question before clearing
    setQuestionBeforeFocus(question)

    // Clear the input when user clicks to enter a new question
    if (hasAskedQuestion && question === lastSubmittedQuestion) {
      setQuestion('')
    }
    onActivate()
  }

  const handleBlur = () => {
    // If user didn't type anything (input is empty), restore the previous question
    if (question.trim() === '' && questionBeforeFocus) {
      setQuestion(questionBeforeFocus)
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
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="ENTER QUERY..."
          className="question-input"
          disabled={isLoading}
        />
        <motion.button
          type="submit"
          className="submit-button"
          disabled={isLoading || !question.trim()}
          animate={buttonControls}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
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
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              {/* Arrow right icon - military/tactical */}
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          )}
        </motion.button>
      </form>
    </motion.div>
  )
}


