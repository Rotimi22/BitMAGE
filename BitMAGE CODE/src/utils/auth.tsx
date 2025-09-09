import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './supabase/info';

// Create Supabase client for frontend auth operations
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0e3567c`;

class AuthService {
  private accessToken: string | null = null;
  private serverAvailable: boolean = true;

  async signUp(email: string, username: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: Sign up failed`
        };
      }

      const data = await response.json();
      console.log('Signup successful, attempting automatic signin');

      // Wait a moment to ensure user is fully created and available for authentication
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to sign in with retry logic
      let signInAttempts = 0;
      const maxAttempts = 3;
      
      while (signInAttempts < maxAttempts) {
        try {
          console.log(`Signin attempt ${signInAttempts + 1} of ${maxAttempts}`);
          const signInResult = await this.signIn(email, password);
          
          if (signInResult.success) {
            console.log('Automatic signin successful after signup');
            return {
              success: true,
              user: signInResult.user
            };
          }
        } catch (signInError) {
          console.warn(`Signin attempt ${signInAttempts + 1} failed:`, signInError.message);
          signInAttempts++;
          
          if (signInAttempts < maxAttempts) {
            // Wait longer between retries
            await new Promise(resolve => setTimeout(resolve, 1000 * signInAttempts));
          }
        }
      }
      
      // If all signin attempts failed, return success for signup but ask user to signin manually
      return {
        success: false,
        error: 'Account created successfully! Please sign in with your credentials.'
      };

    } catch (error) {
      console.error('Sign up error:', error);
      if (error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Network error. Please check your connection and try again.'
        };
      }
      return {
        success: false,
        error: error.message
      };
    }
  }

  async signIn(email: string, password: string) {
    try {
      console.log('Attempting sign in with email:', email);
      
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Sign in response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        console.log('Sign in error response:', errorData);
        
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('Invalid email or password');
        } else if (response.status === 404) {
          throw new Error('User profile not found. Please sign up first.');
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}: Sign in failed`);
      }

      const data = await response.json();
      console.log('Sign in successful for user:', data.user?.email);

      // Validate response data
      if (!data.access_token || !data.user) {
        throw new Error('Invalid response from server');
      }

      this.accessToken = data.access_token;
      
      // Store session data
      localStorage.setItem('supabase_session', JSON.stringify({
        access_token: data.access_token,
        user: data.user,
        expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }));

      return {
        success: true,
        access_token: data.access_token,
        user: data.user
      };

    } catch (error) {
      console.error('Sign in error:', error);
      if (error.message.includes('fetch') || error.name === 'TypeError') {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  }

  async getProfile() {
    try {
      const token = this.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        // Add timeout to avoid hanging requests
        signal: AbortSignal.timeout(10000)
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Profile API error response:', { status: response.status, data });
        
        // Provide more specific error messages based on status
        if (response.status === 401) {
          throw new Error('Authentication expired. Please sign in again.');
        } else if (response.status === 404) {
          throw new Error('User profile not found.');
        } else if (response.status >= 500) {
          throw new Error('Server error while fetching profile.');
        }
        
        throw new Error(data.error || `Failed to get profile (${response.status})`);
      }

      return data.user;

    } catch (error) {
      console.error('Get profile error:', error);
      
      // Provide more specific error handling
      if (error.name === 'AbortError') {
        throw new Error('Server timeout while fetching profile');
      } else if (error.message.includes('fetch')) {
        throw new Error('Network error while fetching profile');
      }
      
      throw error;
    }
  }

  async updateBalance(balance?: number, operation?: 'add' | 'subtract', amount?: number) {
    try {
      const token = this.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${API_BASE_URL}/user/update-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ balance, operation, amount }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update balance');
      }

      return data.balance;

    } catch (error) {
      console.error('Update balance error:', error);
      throw error;
    }
  }

  async claimDailyPoints() {
    try {
      const token = this.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${API_BASE_URL}/user/claim-daily`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 429) {
          // Daily claim not available yet
          return { 
            canClaim: false, 
            timeUntilNextClaim: data.timeUntilNextClaim,
            error: data.error 
          };
        }
        throw new Error(data.error || 'Failed to claim daily points');
      }

      return {
        canClaim: true,
        balance: data.balance,
        pointsAwarded: data.pointsAwarded,
        lastClaimTime: data.lastClaimTime
      };

    } catch (error) {
      console.error('Claim daily points error:', error);
      throw error;
    }
  }

  async recordPrediction(wager: number, leverage: number, prediction: 'bull' | 'bear', outcome: 'win' | 'lose', pointsChange: number) {
    try {
      const token = this.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${API_BASE_URL}/user/record-prediction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ wager, leverage, prediction, outcome, pointsChange }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to record prediction');
      }

      // Update cached stats if available
      const currentUser = this.getCurrentUser();
      if (currentUser && data.stats) {
        const cachedStats = {
          totalPredictions: data.stats.totalPredictions || 0,
          correctPredictions: data.stats.wins || 0,
          winRate: data.stats.totalPredictions > 0 ? 
            Math.round((data.stats.wins / data.stats.totalPredictions) * 100 * 10) / 10 : 0,
          totalPointsEarned: data.stats.totalWinnings || 0
        };
        localStorage.setItem(`user_stats_${currentUser.id}`, JSON.stringify(cachedStats));
      }

      return {
        balance: data.balance,
        stats: data.stats
      };

    } catch (error) {
      console.error('Record prediction error:', error);
      throw error;
    }
  }

  async getStreakData() {
    try {
      const token = this.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${API_BASE_URL}/user/streak`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get streak data');
      }

      return {
        currentStreak: data.currentStreak || 0,
        canClaim: data.canClaim || false,
        lastClaimTime: data.lastClaimTime,
        history: data.history || []
      };

    } catch (error) {
      console.error('Get streak data error:', error);
      throw error;
    }
  }

  async claimStreakDay(day: number, points: number) {
    try {
      const token = this.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${API_BASE_URL}/user/claim-streak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ day, points }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim streak day');
      }

      return {
        success: true,
        currentStreak: data.currentStreak,
        balance: data.balance,
        lastClaimTime: data.lastClaimTime
      };

    } catch (error) {
      console.error('Claim streak day error:', error);
      throw error;
    }
  }

  async getLeaderboard() {
    try {
      const token = this.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${API_BASE_URL}/leaderboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        // Add timeout to detect server issues faster
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get leaderboard');
      }

      return data.leaderboard || [];

    } catch (error) {
      console.error('Get leaderboard error:', error);
      
      // Provide more specific error messages
      if (error.name === 'AbortError') {
        throw new Error('Server timeout - please try again');
      } else if (error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  getAccessToken(): string | null {
    if (this.accessToken) {
      return this.accessToken;
    }

    // Try to get from localStorage
    const sessionData = localStorage.getItem('supabase_session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        
        // Check if session is still valid
        if (session.expires_at && Date.now() < session.expires_at) {
          this.accessToken = session.access_token;
          return this.accessToken;
        } else {
          // Session expired, clear it
          localStorage.removeItem('supabase_session');
        }
      } catch (error) {
        console.error('Error parsing session data:', error);
        localStorage.removeItem('supabase_session');
      }
    }

    return null;
  }

  getCurrentUser() {
    const sessionData = localStorage.getItem('supabase_session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        if (session.expires_at && Date.now() < session.expires_at) {
          return session.user;
        } else {
          localStorage.removeItem('supabase_session');
        }
      } catch (error) {
        console.error('Error parsing session data:', error);
        localStorage.removeItem('supabase_session');
      }
    }
    return null;
  }

  signOut() {
    this.accessToken = null;
    localStorage.removeItem('supabase_session');
    localStorage.removeItem('userBalance');
    localStorage.removeItem('lastClaimTime');
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      this.serverAvailable = response.ok;
      return this.serverAvailable;
    } catch (error) {
      console.warn('Server health check failed:', error);
      this.serverAvailable = false;
      return false;
    }
  }

  isServerAvailable(): boolean {
    return this.serverAvailable;
  }

  async getUserPredictionStats() {
    try {
      const token = this.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${API_BASE_URL}/user/prediction-stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        // Add timeout to avoid hanging requests
        signal: AbortSignal.timeout(10000)
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Prediction stats API error:', data);
        throw new Error(data.error || 'Failed to get prediction stats');
      }

      return {
        totalPredictions: data.totalPredictions || 0,
        correctPredictions: data.correctPredictions || 0,
        winRate: data.winRate || 0,
        totalPointsEarned: data.totalPointsEarned || 0
      };

    } catch (error) {
      console.error('Get prediction stats error:', error);
      
      // Provide more specific error handling
      if (error.name === 'AbortError') {
        throw new Error('Server timeout while fetching prediction stats');
      } else if (error.message.includes('fetch')) {
        throw new Error('Network error while fetching prediction stats');
      }
      
      throw error;
    }
  }

  async deleteAccount() {
    try {
      const token = this.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${API_BASE_URL}/user/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      // Clear all local data
      this.signOut();
      
      return data;

    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();