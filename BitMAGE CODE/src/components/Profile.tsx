import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Crown, Trophy, Medal, Star, Zap, Shield, LogOut, Trash2, Check, Lock, Gift } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { authService } from '../utils/auth';

interface ProfileProps {
  onBack: () => void;
  currentUser: any;
  balance: number;
  onLogout: () => void;
  onBalanceUpdate: (newBalance: number) => void;
  onNotification?: (notification: any) => void;
}

interface AvatarTier {
  id: string;
  name: string;
  icon: React.ReactNode;
  requiredWins: number;
  pointsBonus: number;
  color: string;
  bgColor: string;
  description: string;
  unlocked: boolean;
  isSelected: boolean;
}

export default function Profile({ onBack, currentUser, balance, onLogout, onBalanceUpdate, onNotification }: ProfileProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string>('apprentice');
  const [userStats, setUserStats] = useState({
    totalPredictions: 0,
    correctPredictions: 0,
    winRate: 0,
    totalPointsEarned: 0
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showClaimSuccess, setShowClaimSuccess] = useState<{tier: string, points: number} | null>(null);
  
  // Avatar tier definitions
  const avatarTiers: AvatarTier[] = [
    {
      id: 'apprentice',
      name: 'APPRENTICE',
      icon: <Star className="w-6 h-6" />,
      requiredWins: 0,
      pointsBonus: 0,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20 border-gray-500/30',
      description: 'Every mage starts their journey here',
      unlocked: true,
      isSelected: selectedAvatar === 'apprentice'
    },
    {
      id: 'seeker',
      name: 'SEEKER',
      icon: <Zap className="w-6 h-6" />,
      requiredWins: 10,
      pointsBonus: 5000,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      description: 'One who seeks knowledge and fortune',
      unlocked: userStats.correctPredictions >= 10,
      isSelected: selectedAvatar === 'seeker'
    },
    {
      id: 'acolyte',
      name: 'ACOLYTE',
      icon: <Shield className="w-6 h-6" />,
      requiredWins: 25,
      pointsBonus: 15000,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20 border-purple-500/30',
      description: 'A devoted student of market mysteries',
      unlocked: userStats.correctPredictions >= 25,
      isSelected: selectedAvatar === 'acolyte'
    },
    {
      id: 'master',
      name: 'MASTER',
      icon: <Trophy className="w-6 h-6" />,
      requiredWins: 40,
      pointsBonus: 30000,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20 border-yellow-500/30',
      description: 'A master of prediction and strategy',
      unlocked: userStats.correctPredictions >= 40,
      isSelected: selectedAvatar === 'master'
    },
    {
      id: 'wizard',
      name: 'WIZARD',
      icon: <Crown className="w-6 h-6" />,
      requiredWins: 70,
      pointsBonus: 50000,
      color: 'text-[#0bda43]',
      bgColor: 'bg-[#0bda43]/20 border-[#0bda43]/30',
      description: 'The ultimate crypto fortune teller',
      unlocked: userStats.correctPredictions >= 70,
      isSelected: selectedAvatar === 'wizard'
    }
  ];

  // Load user stats and avatar preference
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const stats = await authService.getUserPredictionStats();
        setUserStats(stats);
        
        // Cache the successfully retrieved stats
        localStorage.setItem(`user_stats_${currentUser?.id}`, JSON.stringify(stats));
        
        // Load saved avatar preference
        const savedAvatar = localStorage.getItem(`avatar_${currentUser?.id}`) || 'apprentice';
        setSelectedAvatar(savedAvatar);
      } catch (error) {
        console.warn('Unable to load user stats from server, using fallback data:', error.message);
        
        // Try to get cached stats from localStorage as fallback
        const cachedStats = localStorage.getItem(`user_stats_${currentUser?.id}`);
        if (cachedStats) {
          try {
            setUserStats(JSON.parse(cachedStats));
          } catch {
            // If cached data is invalid, use default values
            setUserStats({
              totalPredictions: 0,
              correctPredictions: 0,
              winRate: 0,
              totalPointsEarned: 0
            });
          }
        } else {
          // Fallback to default values for new users
          setUserStats({
            totalPredictions: 0,
            correctPredictions: 0,
            winRate: 0,
            totalPointsEarned: 0
          });
        }
        
        // Load saved avatar preference
        const savedAvatar = localStorage.getItem(`avatar_${currentUser?.id}`) || 'apprentice';
        setSelectedAvatar(savedAvatar);
      }
    };

    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const handleAvatarSelect = async (tier: AvatarTier) => {
    if (!tier.unlocked) return;
    
    // Check if this is a newly unlocked tier that hasn't been claimed
    const claimedTiers = JSON.parse(localStorage.getItem(`claimed_tiers_${currentUser?.id}`) || '[]');
    const isNewUnlock = !claimedTiers.includes(tier.id) && tier.pointsBonus > 0;
    
    if (isNewUnlock) {
      // Claim the tier bonus
      try {
        const newBalance = await authService.updateBalance(undefined, 'add', tier.pointsBonus);
        onBalanceUpdate(newBalance);
        
        // Mark tier as claimed
        const updatedClaimedTiers = [...claimedTiers, tier.id];
        localStorage.setItem(`claimed_tiers_${currentUser?.id}`, JSON.stringify(updatedClaimedTiers));
        
        // Show claim success notification
        setShowClaimSuccess({ tier: tier.name, points: tier.pointsBonus });
        setTimeout(() => setShowClaimSuccess(null), 3000);
        
        // Add notification for tier unlock
        if (onNotification) {
          onNotification({
            type: 'avatar_unlock',
            title: `${tier.name} Tier Unlocked! 👑`,
            message: `Congratulations! You've unlocked the ${tier.name} avatar tier with ${tier.requiredWins} correct predictions!`,
            points: tier.pointsBonus,
            priority: 'high',
            avatarTier: tier.name
          });
        }
      } catch (error) {
        console.error('Failed to claim tier bonus:', error);
        // Fallback to local update
        onBalanceUpdate(balance + tier.pointsBonus);
        const updatedClaimedTiers = [...claimedTiers, tier.id];
        localStorage.setItem(`claimed_tiers_${currentUser?.id}`, JSON.stringify(updatedClaimedTiers));
        setShowClaimSuccess({ tier: tier.name, points: tier.pointsBonus });
        setTimeout(() => setShowClaimSuccess(null), 3000);
        
        // Add notification for tier unlock (fallback)
        if (onNotification) {
          onNotification({
            type: 'avatar_unlock',
            title: `${tier.name} Tier Unlocked! 👑`,
            message: `Congratulations! You've unlocked the ${tier.name} avatar tier with ${tier.requiredWins} correct predictions!`,
            points: tier.pointsBonus,
            priority: 'high',
            avatarTier: tier.name
          });
        }
      }
    }
    
    setSelectedAvatar(tier.id);
    localStorage.setItem(`avatar_${currentUser?.id}`, tier.id);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await authService.deleteAccount();
      // Clear all local data
      localStorage.clear();
      onLogout();
    } catch (error) {
      console.error('Failed to delete account:', error);
      // Force logout even if server deletion fails
      onLogout();
    }
    setIsDeleting(false);
  };

  const getAvatarDisplay = (tier: AvatarTier) => {
    const claimedTiers = JSON.parse(localStorage.getItem(`claimed_tiers_${currentUser?.id}`) || '[]');
    const isClaimed = claimedTiers.includes(tier.id) || tier.pointsBonus === 0;
    const canClaim = tier.unlocked && !isClaimed && tier.pointsBonus > 0;
    
    return { isClaimed, canClaim };
  };

  return (
    <motion.div 
      className="w-full h-screen bg-[#111813] overflow-hidden"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Desktop/Mobile Responsive Container */}
      <div className="h-full w-full max-w-sm mx-auto sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl 2xl:max-w-5xl overflow-y-auto overflow-x-hidden bg-[#111813] smooth-scroll"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          scrollbarColor: '#0bda43 #1c271f',
          backgroundColor: '#111813'
        }}
      >
      {/* Header */}
      <div className="sticky top-0 w-full z-50 bg-[#111813]/98 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3 pt-10 border-b border-[#1c271f]/50">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-[#0bda43] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-white text-lg lg:text-xl font-bold">Profile</h1>
            <p className="text-[rgba(246,246,246,0.5)] text-xs lg:text-sm">Mage Avatar & Stats</p>
          </div>
          
          <div className="w-[60px]"></div> {/* Spacer for centered header */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 lg:px-6 pb-6 pt-6 space-y-6">
        {/* Claim Success Notification */}
        <AnimatePresence>
          {showClaimSuccess && (
            <motion.div
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
            >
              <Alert className="bg-[#0bda43]/10 border-[#0bda43]/30 text-[#0bda43]">
                <Gift className="h-4 w-4" />
                <AlertDescription>
                  <strong>{showClaimSuccess.tier}</strong> tier unlocked! +{showClaimSuccess.points.toLocaleString()} points claimed!
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Info Card */}
        <motion.div 
          className="bg-[#1c271f] rounded-lg p-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-4 mb-4">
            {/* Current Avatar Display */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              avatarTiers.find(t => t.id === selectedAvatar)?.bgColor || 'bg-gray-500/20'
            } border-2`}>
              <div className={avatarTiers.find(t => t.id === selectedAvatar)?.color || 'text-gray-400'}>
                {avatarTiers.find(t => t.id === selectedAvatar)?.icon}
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-white text-xl font-bold">Hello {currentUser?.username || 'Trader'}</h2>
              <p className="text-[#0bda43] font-semibold">
                {avatarTiers.find(t => t.id === selectedAvatar)?.name || 'APPRENTICE'}
              </p>
              <p className="text-[rgba(246,246,246,0.5)] text-sm">
                {avatarTiers.find(t => t.id === selectedAvatar)?.description}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#334237]/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{balance.toLocaleString()}</p>
              <p className="text-[rgba(246,246,246,0.5)] text-sm">Current Points</p>
            </div>
            <div className="bg-[#334237]/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-[#0bda43]">{userStats.winRate}%</p>
              <p className="text-[rgba(246,246,246,0.5)] text-sm">Win Rate</p>
            </div>
            <div className="bg-[#334237]/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{userStats.correctPredictions}</p>
              <p className="text-[rgba(246,246,246,0.5)] text-sm">Correct Predictions</p>
            </div>
            <div className="bg-[#334237]/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{userStats.totalPredictions}</p>
              <p className="text-[rgba(246,246,246,0.5)] text-sm">Total Trades</p>
            </div>
          </div>
        </motion.div>

        {/* Avatar Tiers Section */}
        <motion.div 
          className="bg-[#1c271f] rounded-lg p-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#0bda43]" />
            Mage Avatar Tiers
          </h3>
          <p className="text-[rgba(246,246,246,0.5)] text-sm mb-6">
            Unlock new avatars and claim bonuses by making correct predictions
          </p>

          <div className="space-y-3">
            {avatarTiers.map((tier, index) => {
              const { isClaimed, canClaim } = getAvatarDisplay(tier);
              
              return (
                <motion.div
                  key={tier.id}
                  className={`border rounded-lg p-4 transition-all cursor-pointer hover:bg-[#233028] ${
                    tier.isSelected ? 'border-[#0bda43] bg-[#0bda43]/5' : 
                    tier.unlocked ? 'border-[#334237] hover:border-[#0bda43]/50' : 
                    'border-[#334237]/50 opacity-60'
                  }`}
                  onClick={() => handleAvatarSelect(tier)}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={tier.unlocked ? { scale: 1.02 } : {}}
                  whileTap={tier.unlocked ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tier.bgColor} border-2 relative`}>
                      <div className={tier.color}>
                        {tier.icon}
                      </div>
                      {tier.isSelected && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0bda43] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-black" />
                        </div>
                      )}
                      {!tier.unlocked && (
                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                          <Lock className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Tier Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-bold ${tier.unlocked ? 'text-white' : 'text-gray-400'}`}>
                          {tier.name}
                        </h4>
                        {canClaim && (
                          <div className="bg-[#0bda43]/20 text-[#0bda43] text-xs px-2 py-1 rounded-full font-semibold">
                            NEW!
                          </div>
                        )}
                        {tier.isSelected && (
                          <div className="bg-[#0bda43] text-black text-xs px-2 py-1 rounded-full font-semibold">
                            ACTIVE
                          </div>
                        )}
                      </div>
                      <p className={`text-sm ${tier.unlocked ? 'text-[rgba(246,246,246,0.7)]' : 'text-gray-500'}`}>
                        {tier.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${tier.unlocked ? 'text-[rgba(246,246,246,0.5)]' : 'text-gray-500'}`}>
                          Requires: {tier.requiredWins} correct predictions
                        </span>
                        {tier.pointsBonus > 0 && (
                          <span className={`text-xs font-semibold ${
                            canClaim ? 'text-[#0bda43]' : 
                            isClaimed ? 'text-gray-400' : 
                            tier.unlocked ? 'text-yellow-400' : 'text-gray-500'
                          }`}>
                            {canClaim ? `+${tier.pointsBonus.toLocaleString()} pts` :
                             isClaimed ? 'Claimed' :
                             `+${tier.pointsBonus.toLocaleString()} pts`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar for locked tiers */}
                  {!tier.unlocked && tier.requiredWins > 0 && (
                    <div className="mt-3">
                      <div className="bg-[#334237] h-2 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-[#0bda43] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((userStats.correctPredictions / tier.requiredWins) * 100, 100)}%` }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        />
                      </div>
                      <p className="text-xs text-[rgba(246,246,246,0.5)] mt-1">
                        {userStats.correctPredictions}/{tier.requiredWins} correct predictions
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Account Management */}
        <motion.div 
          className="bg-[#1c271f] rounded-lg p-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-white font-bold text-lg mb-4">Account Management</h3>
          
          <div className="space-y-3">
            <Button
              onClick={onLogout}
              className="w-full bg-[#334237] hover:bg-[#3d4d41] text-white border border-[#4a5c4f] transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
            
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="destructive"
              className="w-full bg-[#f16f6f]/10 hover:bg-[#f16f6f]/20 text-[#f16f6f] border border-[#f16f6f]/30"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center py-6 mt-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-[rgba(246,246,246,0.5)] text-sm">
            Built with <span className="text-red-500">❤️</span> by{' '}
            <button
              onClick={() => window.open('https://x.com/lundunbear', '_blank')}
              className="text-[#0bda43] hover:text-[#0bc93d] transition-colors font-semibold underline decoration-transparent hover:decoration-current"
            >
              LUNDUN
            </button>
          </p>
        </motion.div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#1c271f] rounded-lg p-6 max-w-sm w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-white font-bold text-lg mb-4">Delete Account</h3>
              <p className="text-[rgba(246,246,246,0.7)] text-sm mb-6">
                Are you sure you want to delete your account? This action cannot be undone. 
                You will lose all your progress, points, and prediction history.
              </p>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-[#334237] hover:bg-[#3d4d41] text-white"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  variant="destructive"
                  className="flex-1 bg-[#f16f6f] hover:bg-[#e55a5a] text-white"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.div>
  );
}