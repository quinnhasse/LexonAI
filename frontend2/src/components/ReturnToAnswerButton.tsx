interface ReturnToAnswerButtonProps {
  onReturnToAnswer: () => void
}

export default function ReturnToAnswerButton({ onReturnToAnswer }: ReturnToAnswerButtonProps) {
  return (
    <button
      className="return-to-answer-button"
      onClick={onReturnToAnswer}
      title="Return to answer"
      aria-label="Return to answer node"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Reset/restart icon - circular arrow */}
        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
      </svg>
    </button>
  )
}
