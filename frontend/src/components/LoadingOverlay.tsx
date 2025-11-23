/**
 * LoadingOverlay Component
 *
 * Cinematic loading overlay inspired by "Tunnel" aesthetic:
 * - Full-screen black background
 * - Minimalist white/grey typography
 * - Segmented horizontal progress bar
 * - Center-aligned content block
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingOverlayProps {
  visible: boolean;
  progress: number;  // 0-100
  status?: string;   // Status message (e.g., "Searching neural networks")
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  progress,
  status = 'Thinking...'
}) => {
  const SEGMENT_COUNT = 30;
  const filledSegments = Math.round((SEGMENT_COUNT * progress) / 100);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#000',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '24px',
              maxWidth: '500px',
              width: '100%',
              padding: '0 20px'
            }}
          >
            {/* Subtitle */}
            <div
              style={{
                fontSize: '11px',
                fontWeight: 300,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: '#666',
                marginBottom: '-8px'
              }}
            >
              The Correct Way To Launch
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: '32px',
                fontWeight: 300,
                color: '#fff',
                letterSpacing: '1px'
              }}
            >
              Lexon
            </div>

            {/* Status text */}
            <div
              style={{
                fontSize: '13px',
                fontWeight: 300,
                color: '#999',
                marginTop: '8px',
                marginBottom: '4px'
              }}
            >
              {status}
            </div>

            {/* Progress percentage and label */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px'
              }}
            >
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 700,
                  color: '#fff',
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {Math.round(progress)}%
              </div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 300,
                  color: '#666'
                }}
              >
                …since you last checked
              </div>
            </div>

            {/* Segmented progress bar */}
            <div
              style={{
                display: 'flex',
                gap: '4px',
                width: '100%',
                marginTop: '8px'
              }}
            >
              {Array.from({ length: SEGMENT_COUNT }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    height: '3px',
                    backgroundColor: index < filledSegments ? '#fff' : '#333',
                    transition: 'background-color 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
