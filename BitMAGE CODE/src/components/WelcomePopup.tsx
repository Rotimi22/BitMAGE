import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Star, TrendingUp, Gift } from 'lucide-react';

interface WelcomePopupProps {
  currentUser: any;
  onComplete: () => void;
}

export default function WelcomePopup({ currentUser, onComplete }: WelcomePopupProps) {
  const [countdown, setCountdown] = useState(10);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Show details after initial animation
    const detailsTimer = setTimeout(() => {
      setShowDetails(true);
    }, 1000);

    // Countdown timer
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(detailsTimer);
      clearInterval(countdownTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    onComplete();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-[#111813] flex items-center justify-center z-50 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="max-w-sm w-full text-center"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Welcome Icon */}
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#0bda43] to-[#0bc93d] rounded-full mb-6"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          <CheckCircle className="w-10 h-10 text-[#111813]" />
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h1 className="text-white text-3xl font-bold mb-2">
            Welcome back!
          </h1>
          <p className="text-[#0bda43] text-lg font-semibold mb-4">
            {currentUser?.username || 'Trader'}
          </p>
        </motion.div>

        {/* Welcome Details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              className="space-y-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Feature Highlights */}
              <div className="bg-[#1c271f]/50 rounded-lg p-4 space-y-3">
                <motion.div
                  className="flex items-center gap-3 text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-8 h-8 bg-[#0bda43]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-[#0bda43]" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Start Trading</p>
                    <p className="text-[rgba(246,246,246,0.5)] text-xs">Make BTC predictions and earn points</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="w-8 h-8 bg-[#0bda43]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Gift className="w-4 h-4 text-[#0bda43]" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Daily Rewards</p>
                    <p className="text-[rgba(246,246,246,0.5)] text-xs">Claim 500 points every day</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="w-8 h-8 bg-[#0bda43]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-[#0bda43]" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Unlock Avatars</p>
                    <p className="text-[rgba(246,246,246,0.5)] text-xs">Progress through mage tiers</p>
                  </div>
                </motion.div>
              </div>

              {/* Current Balance */}
              {currentUser?.balance !== undefined && (
                <motion.div
                  className="bg-gradient-to-br from-[#0bda43]/10 to-[#0bc93d]/10 rounded-lg p-4 border border-[#0bda43]/30"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <p className="text-[rgba(246,246,246,0.7)] text-sm mb-1">Your Balance</p>
                  <p className="text-[#0bda43] text-2xl font-bold">
                    {currentUser.balance.toLocaleString()} points
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto Continue & Skip */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {/* Auto Continue Indicator */}
          <div className="flex items-center justify-center gap-2 text-[rgba(246,246,246,0.5)] text-sm">
            <div className="w-2 h-2 bg-[#0bda43] rounded-full animate-pulse"></div>
            <span>Auto-entering in {countdown}s</span>
          </div>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="text-[#0bda43] text-sm font-semibold hover:text-[#0bc93d] transition-colors underline decoration-transparent hover:decoration-current"
          >
            Skip and enter now
          </button>
        </motion.div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#0bda43]/30 rounded-full"
              style={{
                left: `${20 + (i * 10)}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2 + (i * 0.3),
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}