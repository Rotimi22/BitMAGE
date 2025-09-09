import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { imgIconGem, imgIconGearAi } from "./imports/svg-qg27s";
import { imgNotification02 } from "./imports/svg-qa6i1";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import DailyStreak from './components/DailyStreak';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import SplashScreen from './components/SplashScreen';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import WelcomePopup from './components/WelcomePopup';
import Frame44 from './imports/Frame44-13-74';
import Leaderboard from './components/Leaderboard';
import { authService } from './utils/auth';
import { adminService } from './utils/admin';

export default function App() {
  const [balance, setBalance] = useState(0);
  const [canClaim, setCanClaim] = useState(true);
  const [lastClaimTime, setLastClaimTime] = useState(null);
  const [claimCountdown, setClaimCountdown] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('1D');
  const [betAmount, setBetAmount] = useState('');
  const [selectedPrediction, setSelectedPrediction] = useState('');
  const [selectedLeverage, setSelectedLeverage] = useState(2);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [priceChange, setPriceChange] = useState(0);
  const [currentPage, setCurrentPage] = useState(() => {
    // Check for saved page on initialization
    const savedPage = localStorage.getItem('crypto_current_page');
    return savedPage || 'splash';
  }); // 'splash', 'prediction', 'dailyStreak', 'notifications', 'leaderboard', 'profile', 'signUp', 'signIn', or 'welcome'
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  
  // Notification system state
  const [notifications, setNotifications] = useState([]);

  // Enhanced notification management functions
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      priority: 'medium',
      autoDismiss: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Store in localStorage for persistence
    const storedNotifications = JSON.parse(localStorage.getItem('crypto_notifications') || '[]');
    const updatedNotifications = [newNotification, ...storedNotifications].slice(0, 100); // Keep last 100 notifications
    localStorage.setItem('crypto_notifications', JSON.stringify(updatedNotifications));
    
    // Trigger visual feedback for high priority notifications
    if (notification.priority === 'high') {
      // Add screen flash effect or other visual indicators
      document.body.style.animation = 'flash 0.3s ease-in-out';
      setTimeout(() => {
        document.body.style.animation = '';
      }, 300);
    }
  };

  // Add milestone checking function
  const checkMilestones = (newBalance, oldBalance) => {
    const milestones = [1000, 5000, 10000, 25000, 50000, 100000];
    
    milestones.forEach(milestone => {
      if (oldBalance < milestone && newBalance >= milestone) {
        addNotification({
          type: 'milestone',
          title: `${milestone.toLocaleString()} Points Milestone! 🎯`,
          message: `Congratulations! You've reached ${milestone.toLocaleString()} total points. Keep trading to unlock more rewards!`,
          priority: 'high',
          milestone: {
            type: 'Points Earned',
            value: milestone
          },
          autoDismiss: true
        });
      }
    });
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // Update localStorage
    const storedNotifications = JSON.parse(localStorage.getItem('crypto_notifications') || '[]');
    const updatedNotifications = storedNotifications.filter(n => n.id !== id);
    localStorage.setItem('crypto_notifications', JSON.stringify(updatedNotifications));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('crypto_notifications');
  };
  
  // Timer and prediction states
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [activePrediction, setActivePrediction] = useState(null);
  const [result, setResult] = useState(null); // 'win' or 'lose'
  const [showResult, setShowResult] = useState(false);

  const handleClaim = async () => {
    if (canClaim) {
      const oldBalance = balance;
      
      try {
        const result = await authService.claimDailyPoints();
        
        if (result.canClaim) {
          setBalance(result.balance);
          setLastClaimTime(result.lastClaimTime);
          setCanClaim(false);
          
          // Enhanced notification for successful claim
          addNotification({
            type: 'streak_claim',
            title: 'Daily Streak Claimed! 🔥',
            message: 'You\'ve successfully claimed your daily 500 points. Keep the streak alive!',
            points: 500,
            priority: 'medium',
            autoDismiss: true
          });
          
          // Check for milestones
          checkMilestones(result.balance, oldBalance);
        } else {
          // Handle case where claim is not available
          setCanClaim(false);
          if (result.timeUntilNextClaim) {
            // Calculate when user can claim next
            const nextClaimTime = Date.now() + result.timeUntilNextClaim;
            setLastClaimTime(Date.now() - (24 * 60 * 60 * 1000 - result.timeUntilNextClaim));
          }
        }
      } catch (error) {
        console.error('Failed to claim daily points:', error);
        // Fallback to local handling if server is unavailable
        const now = Date.now();
        const newBalance = oldBalance + 500;
        setBalance(newBalance);
        setLastClaimTime(now);
        setCanClaim(false);
        
        // Add notification for successful claim (fallback)
        addNotification({
          type: 'streak_claim',
          title: 'Daily Streak Claimed! 🔥',
          message: 'You\'ve successfully claimed your daily 500 points. Keep the streak alive!',
          points: 500,
          priority: 'medium',
          autoDismiss: true
        });
        
        // Check for milestones
        checkMilestones(newBalance, oldBalance);
        
        console.warn('Using offline claim fallback');
      }
    }
  };

  const handlePredictionSelect = (prediction) => {
    setSelectedPrediction(prediction);
    setError('');
  };

  const handleBetAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setBetAmount(value);
      setError('');
    }
  };

  const handleConfirmPrediction = async () => {
    const bet = parseInt(betAmount);
    const leveragedRisk = bet * selectedLeverage;
    
    if (!selectedPrediction) {
      setError('Please select Bullish or Bearish');
      return;
    }
    
    if (!selectedLeverage) {
      setError('Please select leverage');
      return;
    }
    
    if (!betAmount || bet <= 0) {
      setError('Please enter a valid bet amount');
      return;
    }
    
    if (leveragedRisk > balance) {
      setError(`Insufficient points for ${selectedLeverage}X leverage. Need ${leveragedRisk} points.`);
      return;
    }
    
    // Deduct leveraged amount from balance using auth service
    try {
      const newBalance = await authService.updateBalance(undefined, 'subtract', leveragedRisk);
      setBalance(newBalance);
    } catch (error) {
      console.error('Failed to update balance:', error);
      // Fallback to local balance update if server is unavailable
      setBalance(prev => {
        const newBalance = prev - leveragedRisk;
        console.warn('Using offline balance update fallback');
        return newBalance;
      });
    }
    
    // Start the prediction timer
    setActivePrediction({
      type: selectedPrediction,
      amount: bet,
      leverage: selectedLeverage,
      leveragedAmount: leveragedRisk,
      startPrice: currentPrice,
      startTime: Date.now()
    });
    setIsActive(true);
    setCountdown(15);
    
    // Reset form
    setBetAmount('');
    setSelectedPrediction('');
    setSelectedLeverage(2);
    setError('');
  };

  // Generate sophisticated historical chart data
  const generateHistoricalChartData = async (period) => {
    try {
      // Simulate loading delay for realism
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
      
      const currentPriceResponse = await fetchBTCPrice();
      const currentPrice = currentPriceResponse ? currentPriceResponse.price : 111095;
      
      const dataPoints = {
        '1D': 24,
        '1W': 7,
        '1M': 30,
        '3M': 90,
        '1Y': 365
      };

      const points = dataPoints[period] || 24;
      const data = [];
      
      // Get or generate session-specific chart data
      const chartKey = `btc_chart_${period}_${new Date().toDateString()}`;
      let savedChartData = localStorage.getItem(chartKey);
      
      if (savedChartData) {
        const parsedData = JSON.parse(savedChartData);
        // Update the last data point with current price
        parsedData[parsedData.length - 1].price = currentPrice;
        return parsedData;
      }
      
      // Generate realistic historical price movement
      const volatilityMap = {
        '1D': 0.02,   // 2% max intraday movement
        '1W': 0.08,   // 8% max weekly movement  
        '1M': 0.15,   // 15% max monthly movement
        '3M': 0.25,   // 25% max quarterly movement
        '1Y': 0.40    // 40% max yearly movement
      };
      
      const maxVariation = volatilityMap[period] || 0.02;
      let price = currentPrice;
      
      // Work backwards from current price to create historical data
      for (let i = points - 1; i >= 0; i--) {
        const progress = i / (points - 1);
        
        if (i === points - 1) {
          // Last point is current price
          price = currentPrice;
        } else {
          // Generate realistic price movements with proper correlation
          const trendComponent = Math.sin(progress * Math.PI * 2) * 0.1;
          const randomComponent = (Math.random() - 0.5) * 2;
          const volatilityFactor = maxVariation * (0.3 + 0.7 * Math.random());
          
          const priceChange = (trendComponent + randomComponent) * volatilityFactor * 0.1;
          price = price * (1 + priceChange);
        }
        
        // Generate time labels
        let timeLabel = '';
        const now = new Date();
        let timePoint;
        
        if (period === '1D') {
          timePoint = new Date(now.getTime() - (points - 1 - i) * 60 * 60 * 1000);
          timeLabel = timePoint.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
        } else if (period === '1W') {
          timePoint = new Date(now.getTime() - (points - 1 - i) * 24 * 60 * 60 * 1000);
          timeLabel = timePoint.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
          const daysBack = (points - 1 - i) * (period === '1M' ? 1 : period === '3M' ? 3 : 365/points);
          timePoint = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
          timeLabel = timePoint.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
        }

        data.unshift({
          time: timeLabel,
          price: Math.round(price * 100) / 100,
          timestamp: timePoint.getTime()
        });
      }
      
      // Cache the generated data for the session
      localStorage.setItem(chartKey, JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error('Error generating chart data:', error);
      // Fallback with current market price
      const fallbackData = generateMockBTCData(period);
      return fallbackData.chartData;
    }
  };

  // Main data fetching function
  const fetchBTCData = async (period) => {
    setLoading(true);
    try {
      // Fetch current price and historical chart data
      const [currentPriceResponse, historicalData] = await Promise.all([
        fetchBTCPrice(),
        generateHistoricalChartData(period)
      ]);
      
      if (currentPriceResponse) {
        setCurrentPrice(currentPriceResponse.price);
        setPriceChange(currentPriceResponse.percentChange24h);
      }
      
      if (historicalData && historicalData.length > 0) {
        setChartData(historicalData);
      } else {
        // Ultimate fallback
        const mockData = generateMockBTCData(period);
        setChartData(mockData.chartData);
        if (!currentPriceResponse) {
          setCurrentPrice(mockData.currentPrice);
          setPriceChange(mockData.priceChange);
        }
      }
    } catch (error) {
      console.error('Error fetching BTC data:', error);
      // Complete fallback to mock data
      const mockData = generateMockBTCData(period);
      setChartData(mockData.chartData);
      setCurrentPrice(mockData.currentPrice);
      setPriceChange(mockData.priceChange);
    } finally {
      setLoading(false);
    }
  };



  // Generate chart data based on current real price
  const generateChartDataFromPrice = (currentPrice, period) => {
    const dataPoints = {
      '1D': 24,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '1Y': 365
    };

    const points = dataPoints[period] || 24;
    const data = [];
    
    // Create realistic price variations around current price
    const maxVariation = period === '1D' ? 0.02 : period === '1W' ? 0.05 : 0.1; // 2%, 5%, 10%
    
    for (let i = 0; i < points; i++) {
      // Generate price with realistic variations
      const variation = (Math.random() - 0.5) * 2 * maxVariation;
      const historicalMultiplier = 1 + variation * (1 - i / points); // Less variation closer to current time
      const price = currentPrice * historicalMultiplier;
      
      let timeLabel = '';
      if (period === '1D') {
        timeLabel = `${String(i).padStart(2, '0')}:00`;
      } else if (period === '1W') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        timeLabel = days[i % 7];
      } else {
        timeLabel = `${i + 1}`;
      }

      data.push({
        time: timeLabel,
        price: Math.round(price * 100) / 100,
        timestamp: Date.now() - (points - i) * (period === '1D' ? 3600000 : 86400000)
      });
    }

    // Ensure the last point is the current price
    data[data.length - 1].price = currentPrice;

    return data;
  };

  // Generate realistic mock BTC data
  const generateMockBTCData = (period) => {
    const basePrice = parseFloat(localStorage.getItem('btc_last_price')) || 111095;
    const dataPoints = {
      '1D': 24,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '1Y': 365
    };

    const points = dataPoints[period] || 24;
    const data = [];
    let price = basePrice;
    const maxChange = period === '1D' ? 500 : period === '1W' ? 2000 : 5000;

    for (let i = 0; i < points; i++) {
      const change = (Math.random() - 0.5) * maxChange * 0.1;
      price += change;
      
      let timeLabel = '';
      if (period === '1D') {
        timeLabel = `${i}:00`;
      } else if (period === '1W') {
        timeLabel = `Day ${i + 1}`;
      } else {
        timeLabel = `${i + 1}`;
      }

      data.push({
        time: timeLabel,
        price: Math.round(price * 100) / 100,
        timestamp: Date.now() - (points - i) * (period === '1D' ? 3600000 : 86400000)
      });
    }

    const currentPrice = data[data.length - 1].price;
    const priceChange = ((currentPrice - basePrice) / basePrice) * 100;

    return {
      chartData: data,
      currentPrice,
      priceChange: Math.round(priceChange * 100) / 100
    };
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    fetchBTCData(period);
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1c271f] border border-[#0bda43] rounded p-2">
          <p className="text-white text-sm">{`Time: ${label}`}</p>
          <p className="text-[#0bda43] text-sm">
            {`Price: ${payload[0].value.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Advanced Bitcoin Price Simulation Engine
  const initializeBTCPrice = () => {
    const now = Date.now();
    const today = new Date().toDateString();
    const lastSessionDate = localStorage.getItem('btc_session_date');
    
    // Reset session if it's a new day
    if (lastSessionDate !== today) {
      const basePrice = 108000 + Math.random() * 8000; // Range: $108k-$116k (realistic around current $111k)
      localStorage.setItem('btc_session_start', basePrice.toString());
      localStorage.setItem('btc_last_price', basePrice.toString());
      localStorage.setItem('btc_session_date', today);
      localStorage.setItem('btc_last_update', now.toString());
      return basePrice;
    }
    
    return parseFloat(localStorage.getItem('btc_last_price')) || 111095;
  };

  // Realistic Bitcoin price simulation with market dynamics
  const fetchBTCPrice = async () => {
    try {
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));
      
      const now = Date.now();
      const lastUpdate = localStorage.getItem('btc_last_update');
      const lastPrice = parseFloat(localStorage.getItem('btc_last_price')) || initializeBTCPrice();
      const sessionStart = parseFloat(localStorage.getItem('btc_session_start')) || lastPrice;
      
      let newPrice = lastPrice;
      
      // Update price every 3-5 seconds with realistic market movement
      if (!lastUpdate || now - parseInt(lastUpdate) > 3000) {
        // Sophisticated price movement algorithm
        const timeElapsed = lastUpdate ? (now - parseInt(lastUpdate)) / 1000 : 5;
        const volatilityFactor = 0.0015; // 0.15% max change per update
        
        // Market sentiment simulation (changes throughout the day)
        const hourOfDay = new Date().getHours();
        const marketSentiment = Math.sin((hourOfDay / 24) * 2 * Math.PI) * 0.0005;
        
        // Random walk with mean reversion
        const randomComponent = (Math.random() - 0.5) * volatilityFactor;
        const meanReversion = (sessionStart - newPrice) / sessionStart * 0.0001;
        
        // Momentum factor (trending behavior)
        const recentChanges = JSON.parse(localStorage.getItem('btc_recent_changes') || '[]');
        const momentum = recentChanges.length > 0 ? 
          recentChanges.reduce((sum, change) => sum + change, 0) / recentChanges.length * 0.3 : 0;
        
        const totalChange = marketSentiment + randomComponent + meanReversion + momentum;
        newPrice = lastPrice * (1 + totalChange * timeElapsed);
        
        // Keep price within realistic daily bounds (±8% from session start)
        const maxPrice = sessionStart * 1.08;
        const minPrice = sessionStart * 0.92;
        newPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));
        
        // Track recent changes for momentum calculation
        const priceChangePercent = (newPrice - lastPrice) / lastPrice;
        recentChanges.push(priceChangePercent);
        if (recentChanges.length > 10) recentChanges.shift(); // Keep last 10 changes
        
        // Store updated values
        localStorage.setItem('btc_last_price', newPrice.toString());
        localStorage.setItem('btc_last_update', now.toString());
        localStorage.setItem('btc_recent_changes', JSON.stringify(recentChanges));
      }
      
      // Calculate 24h percentage change
      const percentChange24h = ((newPrice - sessionStart) / sessionStart) * 100;
      
      return {
        price: Math.round(newPrice * 100) / 100,
        percentChange24h: Math.round(percentChange24h * 100) / 100
      };
    } catch (error) {
      console.error('Price simulation error:', error);
      // Fallback to current market price
      return {
        price: 111095,
        percentChange24h: 0
      };
    }
  };

  // Load notifications from localStorage on app start
  useEffect(() => {
    const loadNotifications = () => {
      try {
        const storedNotifications = JSON.parse(localStorage.getItem('crypto_notifications') || '[]');
        setNotifications(storedNotifications);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };
    
    loadNotifications();
  }, []);

  // Initialize app data from Supabase auth
  useEffect(() => {
    const initializeAuth = async () => {
      // One-time comprehensive cleanup of invalid/orphaned users
      const cleanupKey = 'comprehensive_cleanup_v2_done';
      if (!localStorage.getItem(cleanupKey)) {
        try {
          console.log('Performing comprehensive leaderboard cleanup...');
          await adminService.cleanupLeaderboard();
          localStorage.setItem(cleanupKey, 'true');
          console.log('Successfully completed comprehensive cleanup');
        } catch (error) {
          console.log('Cleanup attempt completed (server may be unavailable):', error.message);
          localStorage.setItem(cleanupKey, 'true'); // Mark as done even if cleanup fails
        }
      }
      
      const savedPage = localStorage.getItem('crypto_current_page');
      const hasValidSession = authService.isAuthenticated();
      
      // Check if user is already authenticated
      if (hasValidSession) {
        try {
          const user = authService.getCurrentUser();
          if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
            setBalance(user.balance || 0);
            
            // Try to get fresh user profile from server
            try {
              const profile = await authService.getProfile();
              setCurrentUser(profile);
              setBalance(profile.balance);
              
              // Check daily claim status
              if (profile.lastClaimTime) {
                setLastClaimTime(profile.lastClaimTime);
                
                const now = Date.now();
                const timeDiff = now - profile.lastClaimTime;
                const twentyFourHours = 24 * 60 * 60 * 1000;
                
                setCanClaim(timeDiff >= twentyFourHours);
              } else {
                setCanClaim(true); // First time user, can claim immediately
              }
            } catch (profileError) {
              console.warn('Failed to fetch profile from server:', profileError.message);
              
              // Handle specific auth errors
              if (profileError.message.includes('Authentication expired') || 
                  profileError.message.includes('Invalid or expired token')) {
                console.log('Session expired, redirecting to sign in');
                authService.signOut();
                localStorage.removeItem('crypto_current_page');
                saveCurrentPage('signIn');
                return;
              }
              
              // For other errors, continue with cached user data
              console.log('Continuing with cached user data');
              setCanClaim(true);
            }
            
            // If user is authenticated and there's a saved page, restore it
            if (savedPage && ['prediction', 'dailyStreak', 'notifications', 'leaderboard', 'profile'].includes(savedPage)) {
              setCurrentPage(savedPage);
            } else {
              // Default to prediction page for authenticated users
              saveCurrentPage('prediction');
            }
          } else {
            // Invalid session, clear saved page and show sign up
            localStorage.removeItem('crypto_current_page');
            saveCurrentPage('signUp');
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          // If there's an error, clear auth and saved page, show signin
          authService.signOut();
          localStorage.removeItem('crypto_current_page');
          saveCurrentPage('signIn');
        }
      } else {
        // No user logged in
        // Clear any saved authenticated pages
        if (savedPage && ['prediction', 'dailyStreak', 'notifications', 'leaderboard', 'profile'].includes(savedPage)) {
          localStorage.removeItem('crypto_current_page');
        }
        
        // If there's a saved auth page, restore it, otherwise show splash
        if (savedPage && ['signIn', 'signUp'].includes(savedPage)) {
          setCurrentPage(savedPage);
        } else {
          saveCurrentPage('splash');
        }
      }
    };

    initializeAuth();
  }, []);

  // Real-time claim countdown timer
  useEffect(() => {
    if (!canClaim && lastClaimTime) {
      const updateCountdown = () => {
        const now = Date.now();
        const timeDiff = now - lastClaimTime;
        const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const remainingTime = twentyFourHours - timeDiff;
        
        if (remainingTime <= 0) {
          setCanClaim(true);
          setClaimCountdown('');
          return;
        }
        
        // Convert remaining time to hours, minutes, seconds
        const hours = Math.floor(remainingTime / (60 * 60 * 1000));
        const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
        
        setClaimCountdown(`${hours}h ${minutes}m ${seconds}s`);
      };
      
      // Update immediately
      updateCountdown();
      
      // Update every second
      const interval = setInterval(updateCountdown, 1000);
      
      return () => clearInterval(interval);
    }
  }, [canClaim, lastClaimTime]);

  // Fetch initial data
  useEffect(() => {
    fetchBTCData(selectedPeriod);
    
    // Set up real-time updates every 10 seconds for demo purposes
    const interval = setInterval(() => {
      fetchBTCData(selectedPeriod);
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedPeriod]);

  // Separate effect for frequent price updates - every 5 seconds
  useEffect(() => {
    const quickInterval = setInterval(() => {
      // Quick price update without full chart refresh
      fetchBTCPrice().then(data => {
        if (data) {
          setCurrentPrice(data.price);
          setPriceChange(data.percentChange24h);
          
          // Update the last data point in chart for smooth movement
          if (chartData.length > 0) {
            setChartData(prev => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              updated[lastIndex] = {
                ...updated[lastIndex],
                price: data.price
              };
              return updated;
            });
          }
        }
      }).catch(error => {
        console.error('Price update failed:', error);
      });
    }, 5000); // Update every 5 seconds for smooth price movement

    return () => clearInterval(quickInterval);
  }, [chartData]);

  // Timer countdown effect
  useEffect(() => {
    let timer;
    if (isActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (isActive && countdown === 0) {
      // Timer finished, determine result
      const handlePredictionResult = async () => {
        const priceChange = currentPrice - activePrediction.startPrice;
        const isWin = (activePrediction.type === 'Bullish' && priceChange > 0) || 
                      (activePrediction.type === 'Bearish' && priceChange < 0);
        
        setResult(isWin ? 'win' : 'lose');
        
        // Record the prediction result and update balance
        const pointsChange = isWin 
          ? activePrediction.amount * activePrediction.leverage * 2  // Win: get winnings
          : 0; // Loss: balance was already deducted, no additional change
        
        try {
          const result = await authService.recordPrediction(
            activePrediction.amount,
            activePrediction.leverage,
            activePrediction.type === 'Bullish' ? 'bull' : 'bear',
            isWin ? 'win' : 'lose',
            pointsChange
          );
          
          setBalance(result.balance);
        } catch (error) {
          console.error('Failed to record prediction:', error);
          // Fallback to local update if server fails
          if (isWin) {
            const winnings = activePrediction.amount * activePrediction.leverage * 2;
            setBalance(prev => prev + winnings);
          }
        }
        
        // Enhanced notification for prediction result
        const predictionNotification = {
          type: isWin ? 'prediction_win' : 'prediction_loss',
          title: isWin ? 'Prediction Won! 🎉' : 'Prediction Lost 😔',
          message: isWin 
            ? `Excellent prediction! Your ${activePrediction.type.toLowerCase()} call with ${activePrediction.leverage}X leverage paid off!`
            : `Better luck next time! Your ${activePrediction.type.toLowerCase()} prediction with ${activePrediction.leverage}X leverage didn't pan out.`,
          points: isWin ? pointsChange : -activePrediction.leveragedAmount,
          priority: isWin ? 'high' : 'medium',
          prediction: {
            type: activePrediction.type === 'Bullish' ? 'bull' : 'bear',
            amount: activePrediction.amount,
            leverage: activePrediction.leverage,
            startPrice: activePrediction.startPrice,
            endPrice: currentPrice
          },
          autoDismiss: !isWin // Auto-dismiss losses, keep wins visible
        };
        
        addNotification(predictionNotification);
        
        // Add additional celebration for big wins
        if (isWin && pointsChange >= 5000) {
          setTimeout(() => {
            addNotification({
              type: 'milestone',
              title: 'Big Win Bonus! 🚀',
              message: `Incredible! You just won ${pointsChange.toLocaleString()} points in a single trade!`,
              priority: 'high',
              milestone: {
                type: 'Single Trade Win',
                value: pointsChange
              }
            });
          }, 2000);
        }
        
        setShowResult(true);
        setIsActive(false);
        
        // Hide result after 4 seconds
        setTimeout(() => {
          setShowResult(false);
          setResult(null);
          setActivePrediction(null);
        }, 4000);
      };

      handlePredictionResult();
    }

    return () => clearInterval(timer);
  }, [isActive, countdown, currentPrice, activePrediction]);

  const periods = ['1D', '1W', '1M', '3M', '1Y'];

  // Save current page to localStorage whenever it changes
  const saveCurrentPage = (page) => {
    localStorage.setItem('crypto_current_page', page);
    setCurrentPage(page);
  };

  // Navigation functions
  const navigateToDailyStreak = () => {
    saveCurrentPage('dailyStreak');
  };

  const handleBalanceUpdate = (newBalance) => {
    const oldBalance = balance;
    setBalance(newBalance);
    
    // Check for milestones when balance is updated
    checkMilestones(newBalance, oldBalance);
    
    // Add notification for significant balance changes
    const difference = newBalance - oldBalance;
    if (Math.abs(difference) >= 1000) {
      addNotification({
        type: 'balance_update',
        title: difference > 0 ? 'Points Gained! 💰' : 'Points Spent',
        message: difference > 0 
          ? `You gained ${difference.toLocaleString()} points!`
          : `You spent ${Math.abs(difference).toLocaleString()} points.`,
        points: difference,
        priority: difference > 0 ? 'medium' : 'low',
        autoDismiss: true
      });
    }
  };

  const navigateBackToPrediction = () => {
    saveCurrentPage('prediction');
  };

  const navigateToNotifications = () => {
    saveCurrentPage('notifications');
  };

  const navigateToLeaderboard = () => {
    saveCurrentPage('leaderboard');
  };

  const navigateToProfile = () => {
    saveCurrentPage('profile');
  };

  const handleSignUpSuccess = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setBalance(userData.balance);
    saveCurrentPage('prediction');
  };

  const handleShowSignIn = () => {
    saveCurrentPage('signIn');
  };

  const handleShowSignUp = () => {
    saveCurrentPage('signUp');
  };

  const handleSignInSuccess = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setBalance(userData.balance);
    setShowWelcomePopup(true);
    saveCurrentPage('welcome');
  };

  const handleLogout = () => {
    authService.signOut();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setBalance(0);
    setCanClaim(true);
    setLastClaimTime(null);
    setNotifications([]);
    localStorage.removeItem('crypto_notifications');
    localStorage.removeItem('crypto_current_page'); // Clear saved page on logout
    saveCurrentPage('signIn');
  };

  const handleSplashComplete = () => {
    saveCurrentPage('signUp');
  };

  const handleWelcomeComplete = () => {
    setShowWelcomePopup(false);
    saveCurrentPage('prediction');
  };

  // Render the prediction page content
  const renderPredictionPage = () => (
    <motion.div 
      className="w-full h-screen bg-[#111813] overflow-hidden"
      initial={{ x: 0, opacity: 1 }}
      animate={{ x: currentPage === 'prediction' ? 0 : '-100%', opacity: currentPage === 'prediction' ? 1 : 0 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94] // cubic-bezier for smooth, mature transition
      }}
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
        <div className="sticky top-0 w-full z-50 bg-[#111813]/98 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 pt-8 sm:pt-10 border-b border-[#1c271f]/50 lg:py-4 lg:pt-6">
          <button 
            onClick={navigateToDailyStreak}
            className="flex items-center gap-1 transition-transform hover:scale-105 cursor-pointer"
          >
            <div className="size-6">
              <img className="block max-w-none size-full" src={imgIconGem} alt="Gems" />
            </div>
            <span className="text-white text-sm font-semibold">{balance}</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-white text-lg sm:text-xl md:text-2xl font-bold">BTC</h1>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-white text-sm sm:text-base md:text-lg">${currentPrice.toLocaleString()}</span>
              <span className={`text-xs sm:text-sm ${priceChange >= 0 ? 'text-[#0bda43]' : 'text-[#f16f6f]'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange}%
              </span>
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={navigateToNotifications}
              className="p-2 hover:bg-[#1c271f] rounded-lg transition-colors relative"
              title="Notifications"
            >
              <div className="size-6">
                <img className="block max-w-none size-full brightness-0 invert" src={imgNotification02} alt="Notifications" />
              </div>
              {notifications.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#0bda43] rounded-full flex items-center justify-center">
                  <span className="text-[#111813] text-xs font-bold">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
        {/* Chart Area */}
        <div className="mx-4 sm:mx-6 md:mx-8 mb-6 mt-4 lg:mx-8 lg:mb-8 lg:mt-6">
          <div className="bg-[#1c271f] rounded-lg h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 2xl:h-96 mb-4 p-4 sm:p-6 md:p-8">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-[#0bda43] text-sm">Loading BTC data...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#f6f6f6', fontSize: window.innerWidth > 768 ? 12 : 10 }}
                    interval="preserveStartEnd"
                    height={window.innerWidth > 768 ? 30 : 25}
                  />
                  <YAxis 
                    domain={['dataMin - 100', 'dataMax + 100']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#f6f6f6', fontSize: window.innerWidth > 768 ? 12 : 10 }}
                    tickFormatter={(value) => `${Math.round(value).toLocaleString()}`}
                    width={window.innerWidth > 768 ? 60 : 50}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#0bda43" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#0bda43' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          
          {/* Time Period Selector */}
          <div className="bg-[#1c271f] rounded-[20px] p-2 sm:p-3 flex gap-2 sm:gap-3 justify-center">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition-colors ${
                  selectedPeriod === period 
                    ? 'bg-[#0bda43] text-[#111813]' 
                    : 'text-[#f6f6f6] hover:bg-gray-700'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>



        {/* Prediction Section */}
        <div className="mx-4 sm:mx-6 md:mx-8 mb-6 relative lg:mx-8 lg:mb-8">
          <div className="bg-[#1c271f] rounded-lg p-4 sm:p-6 md:p-8">
            <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">
              {isActive ? `Time Remaining: ${countdown}s` : 'Predict in 15 seconds'}
            </h2>
            <p className="text-[rgba(246,246,246,0.5)] text-sm sm:text-base mb-4 sm:mb-6">
              {isActive 
                ? `${activePrediction.type} prediction active! Started at ${activePrediction.startPrice.toLocaleString()}`
                : 'What\'s your prediction for the BTC price in the next 15 seconds?'
              }
            </p>
            
            {/* Timer Progress Bar */}
            {isActive && (
              <div className="mb-4">
                <div className="bg-gray-700 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#0bda43] rounded-full"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(countdown / 15) * 100}%` }}
                    transition={{ duration: 1, ease: 'linear' }}
                  />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <button 
                onClick={() => handlePredictionSelect('Bullish')}
                disabled={isActive}
                className={`border rounded-lg h-16 sm:h-18 md:h-20 transition-colors ${
                  isActive ? 'opacity-50 cursor-not-allowed' :
                  selectedPrediction === 'Bullish'
                    ? 'bg-[#0bda43] border-[#0bda43]'
                    : 'bg-[rgba(11,218,67,0.15)] border-[#0bda43] hover:bg-[rgba(11,218,67,0.25)]'
                }`}
              >
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <TrendingUp className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    selectedPrediction === 'Bullish' ? 'text-[#111813]' : 'text-[#0bda43]'
                  }`} />
                  <span className={`font-semibold text-sm sm:text-base md:text-lg ${
                    selectedPrediction === 'Bullish' ? 'text-[#111813]' : 'text-[#0bda43]'
                  }`}>Bullish</span>
                </div>
              </button>
              <button 
                onClick={() => handlePredictionSelect('Bearish')}
                disabled={isActive}
                className={`border rounded-lg h-16 sm:h-18 md:h-20 transition-colors ${
                  isActive ? 'opacity-50 cursor-not-allowed' :
                  selectedPrediction === 'Bearish'
                    ? 'bg-[#f16f6f] border-[#f16f6f]'
                    : 'bg-[rgba(241,111,111,0.15)] border-[#f16f6f] hover:bg-[rgba(241,111,111,0.25)]'
                }`}
              >
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <TrendingDown className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    selectedPrediction === 'Bearish' ? 'text-white' : 'text-[#f16f6f]'
                  }`} />
                  <span className={`font-semibold text-sm sm:text-base md:text-lg ${
                    selectedPrediction === 'Bearish' ? 'text-white' : 'text-[#f16f6f]'
                  }`}>Bearish</span>
                </div>
              </button>
            </div>

            {/* Betting Input */}
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3">
                <label className="text-white text-sm sm:text-base font-semibold">Bet Amount (Points)</label>
                <Input
                  type="text"
                  value={betAmount}
                  onChange={handleBetAmountChange}
                  placeholder="Enter points to bet"
                  disabled={isActive}
                  className={`w-full bg-[#334237] border-[#4a5c4f] text-white placeholder:text-gray-400 focus:border-[#0bda43] text-sm sm:text-base h-10 sm:h-12 ${
                    isActive ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
                {error && (
                  <p className="text-[#f16f6f] text-xs">{error}</p>
                )}
                <p className="text-[rgba(246,246,246,0.5)] text-xs sm:text-sm">
                  Available balance: {balance} points
                </p>
              </div>

              {/* Leverage Selection */}
              <div className="space-y-2 sm:space-y-3">
                <label className="text-white text-sm sm:text-base font-semibold">Leverage</label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                  <button 
                    onClick={() => setSelectedLeverage(2)}
                    disabled={isActive}
                    className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-semibold transition-colors ${
                      isActive ? 'opacity-50 cursor-not-allowed' :
                      selectedLeverage === 2
                        ? 'bg-[#0bda43] text-[#111813]'
                        : 'bg-[#334237] text-white border border-[#4a5c4f] hover:bg-[#3d4d41]'
                    }`}
                  >
                    2X
                  </button>
                  <button 
                    onClick={() => setSelectedLeverage(5)}
                    disabled={isActive}
                    className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-semibold transition-colors ${
                      isActive ? 'opacity-50 cursor-not-allowed' :
                      selectedLeverage === 5
                        ? 'bg-[#0bda43] text-[#111813]'
                        : 'bg-[#334237] text-white border border-[#4a5c4f] hover:bg-[#3d4d41]'
                    }`}
                  >
                    5X
                  </button>
                  <button 
                    onClick={() => setSelectedLeverage(10)}
                    disabled={isActive}
                    className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-semibold transition-colors ${
                      isActive ? 'opacity-50 cursor-not-allowed' :
                      selectedLeverage === 10
                        ? 'bg-[#0bda43] text-[#111813]'
                        : 'bg-[#334237] text-white border border-[#4a5c4f] hover:bg-[#3d4d41]'
                    }`}
                  >
                    10X
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
                  <span className="text-[rgba(246,246,246,0.5)]">
                    Potential Win: +{betAmount && selectedLeverage ? (parseInt(betAmount || '0') * selectedLeverage * 2).toLocaleString() : '0'} pts
                  </span>
                  <span className="text-[#f16f6f]">
                    Max Loss: -{betAmount && selectedLeverage ? (parseInt(betAmount || '0') * selectedLeverage).toLocaleString() : '0'} pts
                  </span>
                </div>
              </div>
              
              <button 
                onClick={handleConfirmPrediction}
                disabled={!betAmount || !selectedPrediction || !selectedLeverage || isActive}
                className={`w-full py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base transition-colors flex items-center justify-center ${
                  betAmount && selectedPrediction && selectedLeverage && !isActive
                    ? 'bg-[#0bda43] text-[#111813] hover:bg-[#0bc93d]'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isActive ? 'Prediction Active...' : 'Confirm Prediction'}
              </button>
            </div>
          </div>
          
          {/* Result Overlay */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                className="absolute inset-0 bg-black/80 rounded-lg flex items-center justify-center z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="text-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                    ...(result === 'win' ? {
                      y: [0, -20, 0, -10, 0]
                    } : {
                      x: [-10, 10, -10, 10, 0]
                    })
                  }}
                  transition={{ 
                    duration: result === 'win' ? 1.2 : 0.6,
                    ease: result === 'win' ? 'easeOut' : 'easeInOut'
                  }}
                >
                  {result === 'win' ? (
                    <>
                      <motion.div
                        className="text-6xl mb-4"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      >
                        🎉
                      </motion.div>
                      <h3 className="text-[#0bda43] text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">YOU WIN!</h3>
                      <p className="text-white text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3">+{activePrediction?.amount * activePrediction?.leverage * 2} points</p>
                      <p className="text-[rgba(246,246,246,0.7)] text-sm sm:text-base px-4">
                        Your {activePrediction?.type.toLowerCase()} prediction with {activePrediction?.leverage}X leverage was correct!
                      </p>
                      
                      {/* Confetti Effect */}
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-[#0bda43] rounded-full"
                          style={{
                            left: '50%',
                            top: '50%',
                          }}
                          animate={{
                            x: [0, (Math.random() - 0.5) * 400],
                            y: [0, (Math.random() - 0.5) * 400],
                            opacity: [1, 0],
                            scale: [1, 0]
                          }}
                          transition={{
                            duration: 2,
                            delay: Math.random() * 0.5,
                            ease: 'easeOut'
                          }}
                        />
                      ))}
                    </>
                  ) : (
                    <>
                      <motion.div
                        className="text-6xl mb-4"
                        animate={{ 
                          rotate: [0, -10, 10, -10, 10, 0]
                        }}
                        transition={{ 
                          duration: 0.6,
                          ease: 'easeInOut'
                        }}
                      >
                        😔
                      </motion.div>
                      <h3 className="text-[#f16f6f] text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">YOU LOSE!</h3>
                      <p className="text-white text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3">-{activePrediction?.leveragedAmount} points</p>
                      <p className="text-[rgba(246,246,246,0.7)] text-sm sm:text-base px-4">
                        Your {activePrediction?.type.toLowerCase()} prediction with {activePrediction?.leverage}X leverage was incorrect.
                      </p>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.div 
          className="text-center py-6 mt-8 mx-4 sm:mx-6 md:mx-8 lg:mx-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-[rgba(246,246,246,0.4)] text-sm">
            Bitmage V.1.0
          </p>
        </motion.div>

        {/* Bottom padding for sticky menu */}
        <div className="h-20 sm:h-24 md:h-28 lg:h-32"></div>
        </div>

        {/* Sticky Floating Menu */}
        <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="w-[180px] sm:w-[212px] h-[60px] sm:h-[74px] md:w-[240px] md:h-[80px]">
            <Frame44 onLeaderboardClick={navigateToLeaderboard} onProfileClick={navigateToProfile} />
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="h-screen w-screen bg-[#111813] text-white relative overflow-hidden"
      style={{ backgroundColor: '#111813' }}>
      <AnimatePresence mode="wait">
        {currentPage === 'splash' && (
          <motion.div key="splash" className="absolute inset-0">
            <SplashScreen onComplete={handleSplashComplete} />
          </motion.div>
        )}
        {currentPage === 'signUp' && (
          <motion.div key="signUp" className="absolute inset-0">
            <SignUp 
              onSignUpSuccess={handleSignUpSuccess}
              onShowSignIn={handleShowSignIn}
            />
          </motion.div>
        )}
        {currentPage === 'signIn' && (
          <motion.div key="signIn" className="absolute inset-0">
            <SignIn 
              onSignInSuccess={handleSignInSuccess}
              onShowSignUp={handleShowSignUp}
            />
          </motion.div>
        )}
        {currentPage === 'prediction' && isAuthenticated && (
          <motion.div key="prediction" className="absolute inset-0">
            {renderPredictionPage()}
          </motion.div>
        )}
        {currentPage === 'dailyStreak' && isAuthenticated && (
          <motion.div key="dailyStreak" className="absolute inset-0">
            <DailyStreak 
              onBack={navigateBackToPrediction} 
              balance={balance} 
              onBalanceUpdate={handleBalanceUpdate}
              onNotification={addNotification}
            />
          </motion.div>
        )}
        {currentPage === 'notifications' && isAuthenticated && (
          <motion.div key="notifications" className="absolute inset-0">
            <Notifications 
              onBack={navigateBackToPrediction} 
              notifications={notifications}
              onClearNotification={clearNotification}
              onClearAll={clearAllNotifications}
              onLogout={handleLogout}
            />
          </motion.div>
        )}
        {currentPage === 'leaderboard' && isAuthenticated && (
          <motion.div key="leaderboard" className="absolute inset-0">
            <Leaderboard 
              onBack={navigateBackToPrediction} 
              currentUser={currentUser}
              balance={balance}
            />
          </motion.div>
        )}
        {currentPage === 'profile' && isAuthenticated && (
          <motion.div key="profile" className="absolute inset-0">
            <Profile 
              onBack={navigateBackToPrediction} 
              currentUser={currentUser}
              balance={balance}
              onLogout={handleLogout}
              onBalanceUpdate={handleBalanceUpdate}
              onNotification={addNotification}
            />
          </motion.div>
        )}
        {currentPage === 'welcome' && isAuthenticated && showWelcomePopup && (
          <motion.div key="welcome" className="absolute inset-0">
            <WelcomePopup 
              currentUser={currentUser}
              onComplete={handleWelcomeComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}