import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Gift, Crown, CheckCircle, Clock, Flame, Star, Trophy } from 'lucide-react';
import { Button } from "./ui/button";
import { authService } from '../utils/auth';

interface DailyStreakProps {
  onBack: () => void;
  balance: number;
  onBalanceUpdate: (newBalance: number) => void;
  onNotification?: (notification: any) => void;
}

export default function DailyStreak({ onBack, balance, onBalanceUpdate, onNotification }: DailyStreakProps) {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [canClaim, setCanClaim] = useState(false);
  const [lastClaimTime, setLastClaimTime] = useState(null);
  const [claimCountdown, setClaimCountdown] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [streakHistory, setStreakHistory] = useState([]);

  // Load streak data on component mount
  useEffect(() => {
    const loadStreakData = async () => {
      try {
        // Try to get streak data from auth service
        const streakData = await authService.getStreakData();
        if (streakData) {
          setCurrentStreak(streakData.currentStreak || 0);
          setCanClaim(streakData.canClaim || false);
          setLastClaimTime(streakData.lastClaimTime);
          setStreakHistory(streakData.history || []);
        }
      } catch (error) {
        console.error('Failed to load streak data:', error);
        // Fallback to localStorage
        const savedStreak = localStorage.getItem('daily_streak');
        const savedHistory = localStorage.getItem('streak_history');
        const savedLastClaim = localStorage.getItem('last_streak_claim');
        
        if (savedStreak) {
          setCurrentStreak(parseInt(savedStreak));
        }
        if (savedHistory) {
          setStreakHistory(JSON.parse(savedHistory));
        }
        if (savedLastClaim) {
          setLastClaimTime(parseInt(savedLastClaim));
        }
        
        // Check if can claim based on last claim time
        if (savedLastClaim) {
          const now = Date.now();
          const timeDiff = now - parseInt(savedLastClaim);
          const twentyFourHours = 24 * 60 * 60 * 1000;
          setCanClaim(timeDiff >= twentyFourHours);
        } else {
          setCanClaim(true); // First time user
        }
      }
      setIsLoading(false);
    };

    loadStreakData();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!canClaim && lastClaimTime) {
      const updateCountdown = () => {
        const now = Date.now();
        const timeDiff = now - lastClaimTime;
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const remainingTime = twentyFourHours - timeDiff;
        
        if (remainingTime <= 0) {
          setCanClaim(true);
          setClaimCountdown('');
          return;
        }
        
        const hours = Math.floor(remainingTime / (60 * 60 * 1000));
        const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
        
        setClaimCountdown(`${hours}h ${minutes}m ${seconds}s`);
      };
      
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [canClaim, lastClaimTime]);

  const handleClaimStreak = async () => {
    if (!canClaim) return;
    
    try {
      setIsLoading(true);
      
      // Calculate next streak day
      const nextStreak = currentStreak >= 6 ? 1 : currentStreak + 1; // Reset to 1 after completing 7-day cycle
      const isSeventhDay = currentStreak === 6; // Day 7 (index 6)
      const pointsToAdd = isSeventhDay ? 1500 : 500;
      
      // Try to claim through auth service
      const result = await authService.claimStreakDay(nextStreak, pointsToAdd);
      
      if (result.success) {
        setCurrentStreak(nextStreak);
        setCanClaim(false);
        setLastClaimTime(result.lastClaimTime || Date.now());
        
        // Update balance in parent component
        if (result.balance !== undefined) {
          onBalanceUpdate(result.balance);
        }
        
        // Update streak history
        const newStreakEntry = {
          day: nextStreak,
          date: new Date().toISOString(),
          points: pointsToAdd,
          claimed: true
        };
        
        const updatedHistory = [...streakHistory, newStreakEntry];
        setStreakHistory(updatedHistory);
        
        // Save to localStorage as backup
        localStorage.setItem('daily_streak', nextStreak.toString());
        localStorage.setItem('streak_history', JSON.stringify(updatedHistory));
        localStorage.setItem('last_streak_claim', (result.lastClaimTime || Date.now()).toString());
        
        // Add notification for streak claim
        if (onNotification) {
          onNotification({
            type: isSeventhDay ? 'streak_bonus' : 'streak_claim',
            title: isSeventhDay ? 'Weekly Streak Complete! 👑' : `Day ${nextStreak} Streak Claimed! 🔥`,
            message: isSeventhDay 
              ? `Incredible! You've completed a full 7-day streak and earned a bonus ${pointsToAdd} points!`
              : `Great job! You've claimed day ${nextStreak} of your streak and earned ${pointsToAdd} points.`,
            points: pointsToAdd,
            priority: isSeventhDay ? 'high' : 'medium',
            milestone: isSeventhDay ? {
              type: 'Weekly Streak',
              value: 7
            } : undefined
          });
        }
      }
    } catch (error) {
      console.error('Failed to claim streak:', error);
      
      // Fallback to local handling
      const nextStreak = currentStreak >= 6 ? 1 : currentStreak + 1;
      const isSeventhDay = currentStreak === 6;
      const pointsToAdd = isSeventhDay ? 1500 : 500;
      const now = Date.now();
      
      setCurrentStreak(nextStreak);
      setCanClaim(false);
      setLastClaimTime(now);
      
      // Update balance in parent component (fallback)
      const newBalance = balance + pointsToAdd;
      onBalanceUpdate(newBalance);
      
      // Update streak history
      const newStreakEntry = {
        day: nextStreak,
        date: new Date().toISOString(),
        points: pointsToAdd,
        claimed: true
      };
      
      const updatedHistory = [...streakHistory, newStreakEntry];
      setStreakHistory(updatedHistory);
      
      // Save to localStorage
      localStorage.setItem('daily_streak', nextStreak.toString());
      localStorage.setItem('streak_history', JSON.stringify(updatedHistory));
      localStorage.setItem('last_streak_claim', now.toString());
      
      // Add notification for streak claim (fallback)
      if (onNotification) {
        onNotification({
          type: isSeventhDay ? 'streak_bonus' : 'streak_claim',
          title: isSeventhDay ? 'Weekly Streak Complete! 👑' : `Day ${nextStreak} Streak Claimed! 🔥`,
          message: isSeventhDay 
            ? `Incredible! You've completed a full 7-day streak and earned a bonus ${pointsToAdd} points!`
            : `Great job! You've claimed day ${nextStreak} of your streak and earned ${pointsToAdd} points.`,
          points: pointsToAdd,
          priority: isSeventhDay ? 'high' : 'medium',
          milestone: isSeventhDay ? {
            type: 'Weekly Streak',
            value: 7
          } : undefined
        });
      }
      
      console.warn('Using offline streak claim fallback');
    } finally {
      setIsLoading(false);
    }
  };

  const getStreakDayIcon = (day: number, isCompleted: boolean, isCurrent: boolean) => {
    if (day === 7) {
      return isCompleted ? 
        <Crown className="w-6 h-6 text-[#FFD700]" /> : 
        <Crown className="w-6 h-6 text-[rgba(255,215,0,0.5)]" />;
    }
    
    if (isCompleted) {
      return <CheckCircle className="w-5 h-5 text-[#0bda43]" />;
    }
    
    if (isCurrent) {
      return <Flame className="w-5 h-5 text-[#ff6b35]" />;
    }
    
    return <div className="w-5 h-5 rounded-full border-2 border-[rgba(255,255,255,0.3)]"></div>;
  };

  const getStreakDayReward = (day: number) => {
    return day === 7 ? 1500 : 500;
  };

  const getDayStatus = (day: number) => {
    if (day <= currentStreak) return 'completed';
    if (day === currentStreak + 1 && canClaim) return 'current';
    return 'locked';
  };

  const renderStreakProgress = () => {
    const days = [1, 2, 3, 4, 5, 6, 7];
    
    return (
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="relative">
          <div className="bg-[#334237] h-3 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#0bda43] to-[#0bc93d] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStreak / 7) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="absolute -top-2 right-0 bg-[#0bda43] text-[#111813] text-xs font-bold px-2 py-1 rounded-full">
            {currentStreak}/7
          </div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const status = getDayStatus(day);
            const isCompleted = status === 'completed';
            const isCurrent = status === 'current';
            const isLocked = status === 'locked';
            const reward = getStreakDayReward(day);
            
            return (
              <motion.div
                key={day}
                className={`relative p-3 rounded-xl border-2 text-center transition-all ${
                  isCompleted 
                    ? day === 7 
                      ? 'bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 border-[#FFD700] shadow-lg shadow-[#FFD700]/20' 
                      : 'bg-[#0bda43]/20 border-[#0bda43] shadow-lg shadow-[#0bda43]/20'
                    : isCurrent 
                      ? 'bg-[#ff6b35]/20 border-[#ff6b35] shadow-lg shadow-[#ff6b35]/20 scale-105' 
                      : 'bg-[#1c271f] border-[#334237]'
                }`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: day * 0.1, duration: 0.3 }}
                whileHover={isCurrent ? { scale: 1.1 } : { scale: 1.02 }}
              >
                {/* Day Icon */}
                <div className="flex justify-center mb-2">
                  {getStreakDayIcon(day, isCompleted, isCurrent)}
                </div>
                
                {/* Day Number */}
                <div className={`text-sm sm:text-base font-bold mb-1 ${
                  isCompleted ? 'text-white' : 
                  isCurrent ? 'text-[#ff6b35]' : 
                  'text-[rgba(255,255,255,0.5)]'
                }`}>
                  {day}
                </div>
                

                
                {/* Special Day 7 Crown Badge */}
                {day === 7 && (
                  <div className="absolute -top-2 -right-2 bg-[#FFD700] rounded-full p-1">
                    <Star className="w-3 h-3 text-[#111813]" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <motion.div 
        className="max-w-md mx-auto bg-[#111813] min-h-screen lg:max-w-2xl xl:max-w-4xl flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0bda43] mx-auto mb-4"></div>
          <p className="text-white">Loading streak data...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="max-w-md mx-auto bg-[#111813] min-h-screen lg:max-w-2xl xl:max-w-4xl overflow-y-auto overscroll-y-contain"
      style={{ 
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        height: '100vh'
      }}
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {/* Header */}
      <div className="fixed top-0 left-1/2 transform -translate-x-1/2 max-w-md lg:max-w-2xl xl:max-w-4xl w-full z-50 bg-[#111813]/95 backdrop-blur-md flex items-center justify-between px-4 py-3 pt-10 border-b border-[#1c271f]/50">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 p-2 hover:bg-[#1c271f] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
          <span className="text-white font-medium">Back</span>
        </button>
        
        <h1 className="text-white text-lg font-bold">Daily Streak</h1>
        
        <div className="flex items-center gap-1 text-[#0bda43] text-sm font-semibold">
          <Gift className="w-4 h-4" />
          {balance}
        </div>
      </div>

      {/* Content Area with Header Padding */}
      <div className="pt-28 px-4 pb-6">
        {/* Current Streak Display */}
        <motion.div
          className="bg-gradient-to-br from-[#1c271f] to-[#334237] rounded-xl p-6 mb-6 border border-[#0bda43]/20 shadow-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center mb-4">
            <div
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0bda43] to-[#0bc93d] rounded-full mb-3"
            >
              {currentStreak === 7 ? (
                <Crown className="w-8 h-8 text-[#111813]" />
              ) : (
                <Flame className="w-8 h-8 text-[#111813]" />
              )}
            </div>
            
            <h2 className="text-white text-2xl font-bold mb-1">
              {currentStreak === 7 ? 'Streak Master!' : currentStreak === 0 ? 'Start Your Streak!' : `Day ${currentStreak} Complete!`}
            </h2>
            
            <p className="text-[rgba(255,255,255,0.7)] text-sm">
              {currentStreak === 7 
                ? 'You completed the full 7-day cycle! Start a new streak tomorrow.'
                : currentStreak === 0 
                  ? 'Begin your daily streak journey and earn amazing rewards!'
                  : `Keep going! ${7 - currentStreak} more day${7 - currentStreak !== 1 ? 's' : ''} until the big bonus.`
              }
            </p>
          </div>

          {/* Next Reward Info */}
          {currentStreak < 7 && (
            <div className="bg-[#334237]/50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">Next Reward</p>
                  <p className="text-[rgba(255,255,255,0.7)] text-sm">
                    Day {currentStreak + 1} - {getStreakDayReward(currentStreak + 1)} points
                  </p>
                </div>
                <div className="text-right">
                  {currentStreak + 1 === 7 && (
                    <div className="flex items-center gap-1 text-[#FFD700] text-sm font-bold">
                      <Crown className="w-4 h-4" />
                      BONUS DAY!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Claim Button */}
          <Button
            onClick={handleClaimStreak}
            disabled={!canClaim || isLoading}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              canClaim && !isLoading
                ? currentStreak + 1 === 7
                  ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#111813] hover:from-[#FFC700] hover:to-[#FF9500] shadow-lg shadow-[#FFD700]/30'
                  : 'bg-gradient-to-r from-[#0bda43] to-[#0bc93d] text-[#111813] hover:from-[#0bc93d] hover:to-[#0bb83a] shadow-lg shadow-[#0bda43]/30'
                : 'bg-[#334237] text-[rgba(255,255,255,0.5)] cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Processing...
              </div>
            ) : canClaim ? (
              <div className="flex items-center justify-center gap-2">
                <Gift className="w-5 h-5" />
                Claim Day {currentStreak + 1} Reward
                {currentStreak + 1 === 7 && (
                  <Crown className="w-5 h-5" />
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                {claimCountdown || 'Come back tomorrow'}
              </div>
            )}
          </Button>
        </motion.div>

        {/* Streak Progress */}
        <motion.div
          className="bg-[#1c271f] rounded-xl p-6 mb-6 border border-[#334237]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-[#0bda43]" />
            <h3 className="text-white text-lg font-bold">Streak Progress</h3>
          </div>
          
          {renderStreakProgress()}
        </motion.div>

        {/* Rewards Info */}
        <motion.div
          className="bg-[#1c271f] rounded-xl p-6 border border-[#334237]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-white text-lg font-bold mb-4">Reward Structure</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#334237]/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#0bda43]/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-[#0bda43]" />
                </div>
                <span className="text-white">Days 1-6</span>
              </div>
              <span className="text-[#0bda43] font-semibold">+500 points each</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 rounded-lg border border-[#FFD700]/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FFD700]/20 rounded-full flex items-center justify-center">
                  <Crown className="w-4 h-4 text-[#FFD700]" />
                </div>
                <span className="text-white font-semibold">Day 7 Bonus</span>
              </div>
              <span className="text-[#FFD700] font-bold">+1500 points!</span>
            </div>
          </div>
          

        </motion.div>
      </div>
    </motion.div>
  );
}