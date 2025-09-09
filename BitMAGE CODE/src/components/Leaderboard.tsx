import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Crown, Trophy, Medal, RefreshCw, Users, TrendingUp, Award } from 'lucide-react';
import { authService } from '../utils/auth';

interface LeaderboardProps {
  onBack: () => void;
  currentUser: any;
  balance: number;
}

interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  rank: number;
  isCurrentUser?: boolean;
  predictions?: {
    total: number;
    wins: number;
    winRate: number;
  };
}

export default function Leaderboard({ onBack, currentUser, balance }: LeaderboardProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadLeaderboard = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const data = await authService.getLeaderboard();
      
      if (data && data.length > 0) {
        // Process and filter real user data with aggressive validation
        const processedData = data
          .filter(user => {
            // Strict validation for real-time sync
            if (!user.id || !user.name || typeof user.points !== 'number') {
              console.log('Filtered out invalid user:', user);
              return false;
            }
            
            // Filter out specific users that should be removed
            const blacklistedUsers = ['Tim', 'Lundun22#'];
            if (blacklistedUsers.includes(user.name)) {
              console.log('Filtered out blacklisted user:', user.name);
              return false;
            }
            
            // Filter out users with default/placeholder names that might indicate orphaned data
            if (user.name.startsWith('User ') && user.points === 0 && (!user.predictions || user.predictions.total === 0)) {
              console.log('Filtered out potential orphaned user:', user.name);
              return false;
            }
            
            // Filter out users with suspicious data patterns (potential orphaned accounts)
            if (!user.predictions && user.points === 0 && user.name.length < 3) {
              console.log('Filtered out suspicious user account:', user.name);
              return false;
            }
            
            return true;
          })
          .map((user) => ({
            ...user,
            isCurrentUser: user.id === currentUser?.id,
            points: user.id === currentUser?.id ? balance : user.points // Use current balance for active user
          }))
          .sort((a, b) => b.points - a.points) // Sort by points descending
          .slice(0, 20) // Top 20 only
          .map((user, index) => ({
            ...user,
            rank: index + 1
          }));
        
        // Log sync information for debugging
        if (processedData.length !== data.length) {
          console.log(`Real-time sync: Filtered ${data.length - processedData.length} invalid/orphaned users`);
        }
        
        setLeaderboardData(processedData);
      } else {
        // No users in database yet - show current user as solo leader
        if (currentUser) {
          const soloLeaderboard = [{
            id: currentUser.id,
            name: currentUser.username || 'You',
            points: balance,
            rank: 1,
            isCurrentUser: true,
            predictions: {
              total: 0,
              wins: 0,
              winRate: 0
            }
          }];
          setLeaderboardData(soloLeaderboard);
        } else {
          setLeaderboardData([]);
        }
      }
      
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      
      // Check if this is a network/server error
      if (error.message.includes('fetch') || error.message.includes('Unable to connect') || error.message.includes('timeout')) {
        // Server unavailable - show current user as offline leader
        if (currentUser) {
          const offlineLeaderboard = [{
            id: currentUser.id,
            name: currentUser.username || 'You',
            points: balance,
            rank: 1,
            isCurrentUser: true,
            predictions: {
              total: 0,
              wins: 0,
              winRate: 0
            }
          }];
          
          setLeaderboardData(offlineLeaderboard);
          setError('Offline mode - Showing your position only');
        } else {
          setLeaderboardData([]);
          setError('Unable to connect to leaderboard');
        }
      } else {
        setError('Failed to load leaderboard data');
        setLeaderboardData([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Auto-refresh leaderboard every 2 seconds for real-time synchronization
  useEffect(() => {
    // Force immediate load
    loadLeaderboard();
    
    // Force another refresh after 500ms to catch any immediate changes
    const immediateRefresh = setTimeout(() => {
      loadLeaderboard(true);
    }, 500);
    
    // Set up aggressive auto-refresh for real-time user synchronization
    intervalRef.current = setInterval(() => {
      loadLeaderboard(true);
    }, 2000); // Refresh every 2 seconds for immediate user sync
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearTimeout(immediateRefresh);
    };
  }, [currentUser?.id]);

  // Refresh when balance changes (for real-time updates)
  useEffect(() => {
    if (leaderboardData.length > 0) {
      loadLeaderboard(true);
    }
  }, [balance]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-400" />;
    if (rank === 2) return <Trophy className="w-4 h-4 text-gray-300" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
    return null;
  };



  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-black';
    if (rank === 3) return 'bg-gradient-to-br from-amber-500 to-amber-700 text-white';
    if (rank <= 10) return 'bg-gradient-to-br from-[#0bda43] to-green-600 text-black';
    return 'bg-[#334237] text-white';
  };

  const handleManualRefresh = () => {
    loadLeaderboard(true);
  };



  return (
    <motion.div 
      className="max-w-md mx-auto bg-[#111813] min-h-screen lg:max-w-2xl xl:max-w-4xl overflow-y-auto"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Header */}
      <div className="fixed top-0 left-1/2 transform -translate-x-1/2 max-w-md lg:max-w-2xl xl:max-w-4xl w-full z-50 bg-[#111813]/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3 pt-10 border-b border-[#1c271f]/50">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-[#0bda43] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-white text-lg lg:text-xl font-bold">Leaderboard</h1>
            <p className="text-[rgba(246,246,246,0.5)] text-xs lg:text-sm">Top 20 Traders</p>
          </div>
          
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-[#1c271f] rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-24 px-4 lg:px-6 pb-6 space-y-6">
        {/* Error State */}
        {error && (
          <motion.div 
            className={`border rounded-lg p-4 mb-6 ${
              error.includes('Offline') 
                ? 'bg-yellow-500/10 border-yellow-500/30' 
                : 'bg-[#f16f6f]/10 border-[#f16f6f]/30'
            }`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                error.includes('Offline')
                  ? 'bg-yellow-500/20'
                  : 'bg-[#f16f6f]/20'
              }`}>
                <span className={`text-lg ${
                  error.includes('Offline')
                    ? 'text-yellow-500'
                    : 'text-[#f16f6f]'
                }`}>
                  {error.includes('Offline') ? '⚡' : '⚠️'}
                </span>
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${
                  error.includes('Offline')
                    ? 'text-yellow-500'
                    : 'text-[#f16f6f]'
                }`}>
                  {error.includes('Offline') ? 'Offline Mode' : 'Connection Error'}
                </p>
                <p className="text-[rgba(246,246,246,0.7)] text-sm">{error}</p>
                {error.includes('Offline') && (
                  <button 
                    onClick={handleManualRefresh}
                    className="mt-2 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 px-2 py-1 rounded transition-colors"
                  >
                    Try Reconnecting
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-[#334237] rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-[#334237] rounded w-20 animate-pulse"></div>
            </div>
            
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-[#1c271f] rounded-lg p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#334237] rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-[#334237] rounded mb-2 w-2/3"></div>
                    <div className="h-3 bg-[#334237] rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-[#334237] rounded w-16 flex-shrink-0"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && leaderboardData.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Users className="w-16 h-16 text-[rgba(246,246,246,0.3)] mx-auto mb-4" />
            <h3 className="text-white text-lg font-bold mb-2">No Traders Yet</h3>
            <p className="text-[rgba(246,246,246,0.5)] text-sm max-w-sm mx-auto px-4">
              Be the first to start trading and claim the top spot on the leaderboard!
            </p>
          </motion.div>
        )}

        {/* Rankings List */}
        {!loading && leaderboardData.length > 0 && (
          <motion.div 
            className="space-y-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#0bda43]" />
                Top Traders
              </h3>
              <div className="text-[rgba(246,246,246,0.5)] text-sm flex items-center gap-2">
                <span>Live Rankings</span>
                {refreshing && (
                  <span className="text-[#0bda43] text-xs">Syncing...</span>
                )}
              </div>
            </div>
            
            <AnimatePresence>
              {leaderboardData.map((user, index) => (
                <motion.div
                  key={user.id}
                  className={`bg-[#1c271f] rounded-lg p-4 transition-all hover:bg-[#233028] ${
                    user.isCurrentUser ? 'border border-[#0bda43] bg-[#0bda43]/5' : ''
                  }`}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  layout
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold relative flex-shrink-0 ${getRankBadgeColor(user.rank)}`}>
                      <span className="text-sm">#{user.rank}</span>
                      {user.rank <= 3 && getRankIcon(user.rank) && (
                        <div className="absolute -top-1 -right-1">
                          {getRankIcon(user.rank)}
                        </div>
                      )}
                      {user.rank > 3 && user.rank <= 10 && (
                        <div className="absolute -top-1 -right-1">
                          <Award className="w-3 h-3 text-[#0bda43]" />
                        </div>
                      )}
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-semibold truncate ${user.isCurrentUser ? 'text-[#0bda43]' : 'text-white'}`}>
                          {user.name}
                          {user.isCurrentUser && <span className="text-xs opacity-70 ml-1">(You)</span>}
                        </p>
                      </div>
                      
                      {user.predictions && user.predictions.total > 0 ? (
                        <div className="flex items-center gap-2 text-xs text-[rgba(246,246,246,0.5)]">
                          <span>{user.predictions.total} trades</span>
                          <span>•</span>
                          <span className={`${
                            user.predictions.winRate >= 60 ? 'text-[#0bda43]' : 
                            user.predictions.winRate >= 50 ? 'text-yellow-400' : 'text-[#f16f6f]'
                          }`}>
                            {user.predictions.winRate}% win rate
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-[rgba(246,246,246,0.3)]">
                          New trader
                        </div>
                      )}
                    </div>
                    
                    {/* Points */}
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-lg ${user.isCurrentUser ? 'text-[#0bda43]' : 'text-white'}`}>
                        {user.points.toLocaleString()}
                      </p>
                      <p className="text-[rgba(246,246,246,0.5)] text-xs">points</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Stats Summary */}
        {!loading && !error && leaderboardData.length > 0 && (
          <motion.div 
            className="bg-[#1c271f] rounded-lg p-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h4 className="text-white font-semibold mb-3 text-center">Competition Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0bda43]/10 rounded-lg p-3 text-center">
                <p className="text-xl lg:text-2xl font-bold text-[#0bda43]">{leaderboardData.length}</p>
                <p className="text-[rgba(246,246,246,0.5)] text-sm">Active Traders</p>
              </div>
              <div className="bg-[#0bda43]/10 rounded-lg p-3 text-center">
                <p className="text-xl lg:text-2xl font-bold text-[#0bda43]">
                  {leaderboardData[0]?.points.toLocaleString() || '0'}
                </p>
                <p className="text-[rgba(246,246,246,0.5)] text-sm">Top Score</p>
              </div>
            </div>
            
            {/* Current User Position */}
            {leaderboardData.find(user => user.isCurrentUser) && (
              <div className="mt-4 pt-4 border-t border-[#334237]">
                <div className="text-center">
                  <p className="text-[rgba(246,246,246,0.5)] text-sm mb-1">Your Position</p>
                  <p className="text-[#0bda43] text-lg font-bold">
                    #{leaderboardData.find(user => user.isCurrentUser)?.rank || 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
        {/* Bottom spacing for mobile navigation */}
        <div className="h-20 lg:h-6"></div>
      </div>
    </motion.div>
  );
}