import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, TrendingUp, TrendingDown, Gift, CheckCircle, XCircle, Crown, Zap, Trophy, Star, Target, Award, Flame, Calendar, Plus, Minus, Bell, Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  type: 'streak_claim' | 'prediction_win' | 'prediction_loss' | 'avatar_unlock' | 'tier_bonus' | 'milestone' | 'balance_update' | 'streak_bonus';
  title: string;
  message: string;
  timestamp: number;
  points?: number;
  prediction?: {
    type: 'bull' | 'bear';
    amount: number;
    leverage: number;
    startPrice: number;
    endPrice: number;
  };
  avatarTier?: string;
  milestone?: {
    type: string;
    value: number;
  };
  autoDismiss?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

interface NotificationsProps {
  onBack: () => void;
  notifications: Notification[];
  onClearNotification: (id: string) => void;
  onClearAll: () => void;
  onLogout?: () => void;
}

// Enhanced notification styling system
const getNotificationStyle = (type: string, priority: string = 'medium') => {
  const styles = {
    'streak_claim': {
      icon: <Flame className="w-5 h-5" />,
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-400',
      titleColor: 'text-orange-300',
      accent: '#fb923c'
    },
    'prediction_win': {
      icon: <Trophy className="w-5 h-5" />,
      bgColor: 'bg-[#0bda43]/10',
      borderColor: 'border-[#0bda43]/30',
      iconBg: 'bg-[#0bda43]/20',
      iconColor: 'text-[#0bda43]',
      titleColor: 'text-[#0bda43]',
      accent: '#0bda43'
    },
    'prediction_loss': {
      icon: <Target className="w-5 h-5" />,
      bgColor: 'bg-[#f16f6f]/10',
      borderColor: 'border-[#f16f6f]/30',
      iconBg: 'bg-[#f16f6f]/20',
      iconColor: 'text-[#f16f6f]',
      titleColor: 'text-[#f16f6f]',
      accent: '#f16f6f'
    },
    'avatar_unlock': {
      icon: <Crown className="w-5 h-5" />,
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
      titleColor: 'text-purple-300',
      accent: '#a855f7'
    },
    'tier_bonus': {
      icon: <Star className="w-5 h-5" />,
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      iconBg: 'bg-indigo-500/20',
      iconColor: 'text-indigo-400',
      titleColor: 'text-indigo-300',
      accent: '#6366f1'
    },
    'milestone': {
      icon: <Award className="w-5 h-5" />,
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400',
      titleColor: 'text-yellow-300',
      accent: '#facc15'
    },
    'balance_update': {
      icon: <Plus className="w-5 h-5" />,
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-300',
      accent: '#3b82f6'
    },
    'streak_bonus': {
      icon: <Calendar className="w-5 h-5" />,
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400',
      titleColor: 'text-green-300',
      accent: '#22c55e'
    }
  };
  
  const baseStyle = styles[type] || {
    icon: <CheckCircle className="w-5 h-5" />,
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    iconBg: 'bg-gray-500/20',
    iconColor: 'text-gray-400',
    titleColor: 'text-gray-300',
    accent: '#6b7280'
  };

  // Add priority styling
  if (priority === 'high') {
    return {
      ...baseStyle,
      borderColor: baseStyle.borderColor.replace('/30', '/50'),
      bgColor: baseStyle.bgColor.replace('/10', '/15')
    };
  }

  return baseStyle;
};

// Format relative time with more precision
const getRelativeTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  if (seconds > 30) return `${seconds}s ago`;
  return 'Just now';
};

// Group notifications by time period
const groupNotificationsByTime = (notifications: Notification[]) => {
  const now = Date.now();
  const today = [];
  const yesterday = [];
  const older = [];
  
  notifications.forEach(notification => {
    const diff = now - notification.timestamp;
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) {
      today.push(notification);
    } else if (hours < 48) {
      yesterday.push(notification);
    } else {
      older.push(notification);
    }
  });
  
  return { today, yesterday, older };
};

export default function Notifications({ onBack, notifications, onClearNotification, onClearAll, onLogout }: NotificationsProps) {
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());
  const [animatingOut, setAnimatingOut] = useState<Set<string>>(new Set());

  // Auto-dismiss notifications after 10 minutes if marked for auto-dismiss
  useEffect(() => {
    const autoDismissNotifications = notifications.filter(n => 
      n.autoDismiss && Date.now() - n.timestamp > 10 * 60 * 1000
    );
    
    autoDismissNotifications.forEach(notification => {
      onClearNotification(notification.id);
    });
  }, [notifications, onClearNotification]);

  const handleClearNotification = (id: string) => {
    setAnimatingOut(prev => new Set(prev).add(id));
    setTimeout(() => {
      onClearNotification(id);
      setAnimatingOut(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 300);
  };

  const toggleExpanded = (id: string) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
    // Sort by priority first, then by timestamp
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority || 'medium'];
    const bPriority = priorityOrder[b.priority || 'medium'];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    return b.timestamp - a.timestamp;
  });

  const { today, yesterday, older } = groupNotificationsByTime(sortedNotifications);

  const renderNotificationGroup = (groupNotifications: Notification[], title: string, delay: number = 0) => {
    if (groupNotifications.length === 0) return null;

    return (
      <div className="mb-6">
        <motion.h3 
          className="text-[rgba(246,246,246,0.7)] text-sm font-medium mb-3 px-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay * 0.1 }}
        >
          {title} ({groupNotifications.length})
        </motion.h3>
        <div className="space-y-3">
          {groupNotifications.map((notification, index) => {
            const style = getNotificationStyle(notification.type, notification.priority);
            const isExpanded = expandedNotifications.has(notification.id);
            const isAnimatingOut = animatingOut.has(notification.id);

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ 
                  opacity: isAnimatingOut ? 0 : 1, 
                  y: isAnimatingOut ? -20 : 0, 
                  scale: isAnimatingOut ? 0.95 : 1,
                  x: 0
                }}
                transition={{ 
                  duration: 0.3, 
                  delay: (delay + index) * 0.05,
                  ease: 'easeOut'
                }}
                className={`relative overflow-hidden rounded-lg border ${style.borderColor} ${style.bgColor} backdrop-blur-sm`}
              >
                {/* Notification priority indicator */}
                {notification.priority === 'high' && (
                  <div 
                    className="absolute top-0 left-0 w-1 h-full"
                    style={{ backgroundColor: style.accent }}
                  />
                )}

                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Enhanced Icon with background */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${style.iconBg} flex items-center justify-center`}>
                      <div className={style.iconColor}>
                        {style.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className={`${style.titleColor} font-semibold text-sm`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          {/* Priority indicator */}
                          {notification.priority === 'high' && (
                            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                          )}
                          {/* Clear button */}
                          <button
                            onClick={() => handleClearNotification(notification.id)}
                            className="flex-shrink-0 p-1 hover:bg-[#334237] rounded transition-colors opacity-60 hover:opacity-100"
                          >
                            <XCircle className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-[rgba(246,246,246,0.8)] text-sm mb-3">
                        {notification.message}
                      </p>

                      {/* Enhanced Points Display */}
                      {notification.points !== undefined && notification.points !== 0 && (
                        <motion.div 
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-3 ${
                            notification.points > 0 
                              ? 'bg-[#0bda43]/20 text-[#0bda43] border border-[#0bda43]/30' 
                              : 'bg-[#f16f6f]/20 text-[#f16f6f] border border-[#f16f6f]/30'
                          }`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {notification.points > 0 ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                          {notification.points > 0 ? '+' : ''}{notification.points.toLocaleString()} points
                        </motion.div>
                      )}

                      {/* Avatar Tier Display */}
                      {notification.avatarTier && (
                        <div className="bg-[#334237]/50 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-purple-400" />
                            <span className="text-purple-300 text-sm font-medium">
                              {notification.avatarTier} Tier Unlocked!
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Milestone Display */}
                      {notification.milestone && (
                        <div className="bg-[#334237]/50 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-300 text-sm font-medium">
                              {notification.milestone.type}: {notification.milestone.value}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Enhanced Prediction Details */}
                      {notification.prediction && (
                        <motion.div 
                          className="bg-[#334237]/50 rounded-lg p-3 mb-3"
                          initial={{ height: isExpanded ? 'auto' : '0' }}
                          animate={{ height: isExpanded ? 'auto' : 'auto' }}
                        >
                          <button
                            onClick={() => toggleExpanded(notification.id)}
                            className="w-full text-left"
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                {notification.prediction.type === 'bull' ? (
                                  <TrendingUp className="w-4 h-4 text-[#0bda43]" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-[#f16f6f]" />
                                )}
                                <span className="text-white text-sm font-medium">
                                  {notification.prediction.type === 'bull' ? 'Bullish' : 'Bearish'} 
                                  {' '}{notification.prediction.leverage}X
                                </span>
                              </div>
                            </div>
                          </button>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-[rgba(246,246,246,0.5)]">Bet Amount</span>
                              <p className="text-white font-medium">{notification.prediction.amount.toLocaleString()} pts</p>
                            </div>
                            <div>
                              <span className="text-[rgba(246,246,246,0.5)]">Price Movement</span>
                              <p className={`font-medium ${
                                notification.prediction.endPrice > notification.prediction.startPrice 
                                  ? 'text-[#0bda43]' 
                                  : 'text-[#f16f6f]'
                              }`}>
                                ${notification.prediction.startPrice.toLocaleString()} → ${notification.prediction.endPrice.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Timestamp and category */}
                      <div className="flex items-center justify-between">
                        <span className="text-[rgba(246,246,246,0.5)] text-xs">
                          {getRelativeTime(notification.timestamp)}
                        </span>
                        
                        {/* Category badge */}
                        <div className="flex items-center gap-2">
                          {notification.autoDismiss && (
                            <div className="text-[rgba(246,246,246,0.4)] text-xs">Auto-dismiss</div>
                          )}
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: style.accent }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

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
      {/* Enhanced Header */}
      <div className="fixed top-0 left-1/2 transform -translate-x-1/2 max-w-md lg:max-w-2xl xl:max-w-4xl w-full z-50 bg-[#111813]/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3 pt-10 border-b border-[#1c271f]/50">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-[#0bda43] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </button>
          
          <div className="text-center">
            {notifications.length > 0 && (
              <h1 className="text-white text-lg font-bold text-center mx-auto">
                Notifications
              </h1>
            )}
            {notifications.length > 0 && (
              <p className="text-[rgba(246,246,246,0.5)] text-xs">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          {/* Clear All Button */}
          {notifications.length > 0 && (
            <button 
              onClick={onClearAll}
              className="flex items-center gap-1 text-[#f16f6f] hover:text-[#e55a5a] transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-28 px-4 pb-6">
        {sortedNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <motion.div 
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#1c271f] flex items-center justify-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Bell className="w-10 h-10 text-[rgba(246,246,246,0.3)]" />
            </motion.div>
            <h2 className="text-white text-xl font-bold mb-3">Stay Updated!</h2>
            <p className="text-[rgba(246,246,246,0.5)] text-sm max-w-xs mx-auto leading-relaxed">
              Your activity notifications will appear here. Start trading, claiming streaks, and unlocking achievements to see them in action!
            </p>
          </motion.div>
        ) : (
          <div>
            {renderNotificationGroup(today, 'Today', 0)}
            {renderNotificationGroup(yesterday, 'Yesterday', today.length)}
            {renderNotificationGroup(older, 'Earlier', today.length + yesterday.length)}
          </div>
        )}
      </div>
    </motion.div>
  );
}