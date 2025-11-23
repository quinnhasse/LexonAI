/**
 * LandingPage
 *
 * Google-style minimal landing page for Lexon.
 * Displays the app name in large military-grade typography above
 * the centered search bar.
 *
 * Layout:
 * - Vertically and horizontally centered content
 * - "Lexon" title in clean, bold monospace typography
 * - Search bar (QuestionInput component) below with generous spacing
 * - Responsive design for mobile and desktop
 *
 * Animation:
 * - Starts centered on the page
 * - When question is asked, slides to bottom-right corner off-screen
 * - Smooth transition using Framer Motion
 *
 * Visibility:
 * - Only shown when hasAskedQuestion === false (initial landing state)
 * - Animates out when user submits first question
 */

import { motion } from 'framer-motion'
import QuestionInput from './QuestionInput'
import './LandingPage.css'

interface LandingPageProps {
  onQuestionSubmit: (question: string) => void
  isLoading: boolean
  hasAskedQuestion: boolean
}

export default function LandingPage({
  onQuestionSubmit,
  isLoading,
  hasAskedQuestion,
}: LandingPageProps) {
  return (
    <div className="landing-page">
      <div className="landing-content">
        {/* Main app title - rises up from behind search bar, then fades out when question is asked */}
        <motion.h1
          className="landing-title"
          initial={{ opacity: 0, y: 80 }}
          animate={{
            opacity: hasAskedQuestion ? 0 : 1,
            y: hasAskedQuestion ? 0 : 0
          }}
          transition={{
            duration: 1.2,
            ease: [0.4, 0, 0.2, 1],
            type: "spring",
            damping: 20,
            stiffness: 100,
          }}
        >
          Lexon
        </motion.h1>

        {/* Search bar component - moves up via its own animation in QuestionInput */}
        <div className="landing-search">
          <QuestionInput
            onSubmit={onQuestionSubmit}
            isLoading={isLoading}
            hasAskedQuestion={false}
            isDimmed={false}
            onActivate={() => {}}
          />
        </div>
      </div>
    </div>
  )
}
