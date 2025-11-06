import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, CircleCheck as CheckCircle } from 'lucide-react';

interface ApplicationConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  applicationData?: {
    firstName: string;
    lastName: string;
    email: string;
    appliedRoles: string[];
  }; 
}

const ORANGE = '#FF5722';
const GOLD = '#FFD700';

type Stage = 'orbit' | 'message';

const ApplicationConfirmationPopup: React.FC<ApplicationConfirmationPopupProps> = ({
  isOpen,
  onClose,
  applicationData
}) => {
  const [stage, setStage] = useState<Stage>('orbit');
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const firstName =
    (applicationData?.firstName || '').trim().split(/\s+/)[0] || 'there';

  useEffect(() => {
    if (!isOpen) return;
    setStage(prefersReducedMotion ? 'message' : 'orbit');
  }, [isOpen, prefersReducedMotion]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => closeBtnRef.current?.focus(), 30);
    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <motion.div
          className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        <motion.div
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10"
          initial={{ opacity: 0, scale: 0.92, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 18 }}
          transition={{ type: 'spring', duration: 0.48, bounce: 0.28 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmation-title"
          aria-describedby="confirmation-description"
        >
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="absolute right-3.5 top-3.5 z-20 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#FF5722] focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:ring-offset-2"
            aria-label="Close confirmation"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative h-44 flex items-center justify-center">
            {stage === 'orbit' && !prefersReducedMotion && (
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.4, ease: 'easeInOut' }}
                onAnimationComplete={() => setStage('message')}
                className="relative h-28 w-28"
              >
                <svg viewBox="0 0 100 100" className="h-full w-full absolute">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="rgba(0,0,0,0.08)"
                    strokeWidth="1.5"
                  />
                </svg>

                <svg viewBox="0 0 100 100" className="h-full w-full absolute">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke={ORANGE}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="60 300"
                    strokeDashoffset="0"
                  />
                </svg>

                <div
                  className="absolute inset-0"
                  style={{ transform: 'rotate(180deg)' }}
                >
                  <svg viewBox="0 0 100 100" className="h-full w-full absolute">
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      fill="none"
                      stroke={GOLD}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="60 300"
                      strokeDashoffset="0"
                    />
                  </svg>
                </div>
              </motion.div>
            )}

            {stage === 'message' && (
              <div className="absolute inset-0 flex items-center justify-center">
                {!prefersReducedMotion && (
                  <motion.div
                    initial={{ scale: 0.75, opacity: 0.25 }}
                    animate={{ scale: 1.15, opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                      width: '160px',
                      height: '160px',
                      borderRadius: '9999px',
                      border: `2px solid ${ORANGE}66`,
                      position: 'absolute'
                    }}
                  />
                )}
                <motion.div
                  className="grid h-14 w-14 place-items-center rounded-full"
                  style={{ background: `${ORANGE}14` }}
                  initial={{ scale: 0.86, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.5, bounce: 0.34 }}
                >
                  <CheckCircle className="h-8 w-8" style={{ color: ORANGE }} />
                </motion.div>
              </div>
            )}
          </div>

          <div className="px-6 pb-6 pt-2 text-center">
            <motion.h2
              id="confirmation-title"
              className="text-xl font-semibold text-gray-900"
              initial={{ opacity: 0, y: 6 }}
              animate={stage === 'message' ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              transition={{ duration: 0.42, ease: 'easeOut' }}
            >
              {`Thanks, ${firstName}!`}
            </motion.h2>
            <motion.p
              id="confirmation-description"
              className="mx-auto mt-2 max-w-sm text-sm text-gray-600"
              initial={{ opacity: 0, y: 6 }}
              animate={stage === 'message' ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              transition={{ duration: 0.48, ease: 'easeOut', delay: 0.03 }}
            >
              Your application has been received successfully. Our team is reviewing your
              details, and you'll hear from us very soon.
            </motion.p>

            <motion.button
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : { y: -1, boxShadow: `0 10px 26px ${ORANGE}33` }
              }
              onClick={onClose}
              ref={closeBtnRef}
              className="mt-6 w-full rounded-lg px-4 py-3 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:ring-offset-2"
              style={{ background: ORANGE }}
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ApplicationConfirmationPopup;