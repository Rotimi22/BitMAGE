import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase with service role key for server operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
);

// Utility function to get authenticated user
const getAuthenticatedUser = async (request: Request) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('No access token provided');
  }

  const accessToken = authHeader.split(' ')[1];
  if (!accessToken) {
    throw new Error('No access token provided');
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error) {
      console.error('Supabase auth error:', error);
      throw new Error('Invalid or expired token: ' + error.message);
    }
    
    if (!user) {
      throw new Error('Invalid or expired token');
    }

    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

// Health check endpoint
app.get("/make-server-c0e3567c/health", (c) => {
  // Check if required environment variables are present
  const hasUrl = !!Deno.env.get('SUPABASE_URL');
  const hasAnonKey = !!Deno.env.get('SUPABASE_ANON_KEY');
  const hasServiceKey = !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  return c.json({ 
    status: "ok",
    env_check: {
      supabase_url: hasUrl,
      anon_key: hasAnonKey,
      service_key: hasServiceKey
    }
  });
});

// Admin endpoint to remove specific user
app.post("/make-server-c0e3567c/admin/remove-user", async (c) => {
  try {
    const { username } = await c.req.json();
    
    if (!username) {
      return c.json({ error: 'Username required' }, 400);
    }
    
    console.log(`Starting removal process for user: ${username}`);
    
    // Find user ID from username
    const userId = await kv.get(`username:${username}`);
    
    if (!userId) {
      console.log(`Username ${username} not found in username mapping`);
      return c.json({ message: 'Username not found' }, 404);
    }
    
    console.log(`Found user ID: ${userId} for username: ${username}`);
    
    // Remove user data and username mapping
    await Promise.all([
      kv.del(`user:${userId}`),
      kv.del(`username:${username}`)
    ]);
    
    console.log(`Successfully removed user ${username} (ID: ${userId}) from database`);
    
    return c.json({ 
      message: `User ${username} successfully removed from database`,
      removedUserId: userId
    });
    
  } catch (error) {
    console.error('Remove user error:', error);
    return c.json({ error: 'Failed to remove user' }, 500);
  }
});

// Admin endpoint to cleanup leaderboard
app.post("/make-server-c0e3567c/admin/cleanup-leaderboard", async (c) => {
  try {
    console.log('Starting comprehensive leaderboard cleanup...');
    
    // Get all users from KV store
    const allUsers = await kv.getByPrefix('user:');
    const allUsernames = await kv.getByPrefix('username:');
    
    let removedUsers = 0;
    let removedUsernames = 0;
    const blacklistedUsers = ['Tim', 'Lundun22#'];
    
    // Remove blacklisted users
    for (const userData of allUsers) {
      if (userData && userData.username && blacklistedUsers.includes(userData.username)) {
        console.log(`Removing blacklisted user: ${userData.username} (${userData.id})`);
        await kv.del(`user:${userData.id}`);
        removedUsers++;
      }
    }
    
    // Remove blacklisted username mappings
    for (const username of blacklistedUsers) {
      const userId = await kv.get(`username:${username}`);
      if (userId) {
        console.log(`Removing blacklisted username mapping: ${username}`);
        await kv.del(`username:${username}`);
        removedUsernames++;
      }
    }
    
    // Remove orphaned username mappings
    for (const [key, userId] of Object.entries(allUsernames)) {
      if (typeof userId === 'string') {
        const userData = await kv.get(`user:${userId}`);
        if (!userData) {
          console.log(`Removing orphaned username mapping: ${key.replace('username:', '')}`);
          await kv.del(key);
          removedUsernames++;
        }
      }
    }
    
    console.log(`Cleanup completed: ${removedUsers} users, ${removedUsernames} username mappings removed`);
    
    return c.json({ 
      message: 'Leaderboard cleanup completed',
      removedUsers,
      removedUsernames,
      cleanedBlacklisted: blacklistedUsers
    });
    
  } catch (error) {
    console.error('Cleanup leaderboard error:', error);
    return c.json({ error: 'Failed to cleanup leaderboard' }, 500);
  }
});



// Auth endpoints
app.post("/make-server-c0e3567c/auth/signup", async (c) => {
  try {
    const { email, username, password } = await c.req.json();
    
    if (!email || !username || !password) {
      return c.json({ error: 'Email, username, and password are required' }, 400);
    }

    // Check if username is already taken with cleanup of orphaned entries
    const existingUsernameId = await kv.get(`username:${username}`);
    if (existingUsernameId) {
      // Verify that the user actually exists
      const existingUserData = await kv.get(`user:${existingUsernameId}`);
      if (existingUserData) {
        // Username is genuinely taken
        return c.json({ error: 'Username is already taken' }, 400);
      } else {
        // Orphaned username entry - clean it up
        console.log('Cleaning up orphaned username entry for:', username);
        await kv.del(`username:${username}`);
      }
    }

    // Check if email is already registered by trying to list users (optional check)
    try {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const emailExists = existingUsers?.users?.some(user => user.email === email);
      if (emailExists) {
        return c.json({ error: 'Email is already registered' }, 400);
      }
    } catch (listError) {
      console.warn('Could not check existing users:', listError);
    }

    // Create user with Supabase Auth
    console.log('Creating user with email:', email, 'username:', username);
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username },
      email_confirm: true // Auto-confirm for development
    });

    if (error) {
      console.error('Supabase signup error:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      return c.json({ error: error.message }, 400);
    }

    if (!data.user) {
      console.error('No user data returned from Supabase signup');
      return c.json({ error: 'User creation failed - no user data' }, 400);
    }

    console.log('User successfully created with ID:', data.user.id);

    // Store user data in KV store with proper error handling
    const userData = {
      id: data.user.id,
      email: data.user.email,
      username,
      balance: 0,
      createdAt: new Date().toISOString(),
      lastClaimTime: null,
      stats: {
        totalPredictions: 0,
        wins: 0,
        losses: 0,
        totalWinnings: 0,
        totalLosses: 0
      }
    };

    try {
      await Promise.all([
        kv.set(`user:${data.user.id}`, userData),
        kv.set(`username:${username}`, data.user.id)
      ]);
      console.log('User data successfully stored for:', data.user.id);
    } catch (kvError) {
      console.error('Failed to store user data in KV store:', kvError);
      
      // Cleanup: try to delete the created user from Supabase if KV storage failed
      try {
        await supabase.auth.admin.deleteUser(data.user.id);
        console.log('Cleaned up Supabase user after KV failure');
      } catch (cleanupError) {
        console.error('Failed to cleanup Supabase user:', cleanupError);
      }
      
      return c.json({ error: 'Failed to create user profile' }, 500);
    }

    return c.json({ 
      user: {
        id: data.user.id,
        email: data.user.email,
        username,
        balance: 0
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

app.post("/make-server-c0e3567c/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Create a separate client instance for authentication (not using service key)
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_ANON_KEY')  // Use anon key for auth operations
    );

    // Sign in with Supabase
    console.log('Attempting sign in for email:', email);
    console.log('Using Supabase URL:', Deno.env.get('SUPABASE_URL') ? 'SET' : 'NOT SET');
    console.log('Using Anon Key:', Deno.env.get('SUPABASE_ANON_KEY') ? 'SET' : 'NOT SET');
    
    const { data, error } = await authClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase signin error:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      
      // Provide more specific error messages
      if (error.message.includes('Invalid login credentials')) {
        return c.json({ error: 'Invalid email or password' }, 401);
      } else if (error.message.includes('Email not confirmed')) {
        return c.json({ error: 'Please verify your email address' }, 401);
      } else if (error.message.includes('Too many requests')) {
        return c.json({ error: 'Too many login attempts. Please try again later.' }, 429);
      }
      
      return c.json({ error: `Authentication failed: ${error.message}` }, 401);
    }

    if (!data.user || !data.session) {
      console.error('No user or session data returned from Supabase');
      return c.json({ error: 'Authentication failed - no user data' }, 401);
    }

    console.log('Supabase auth successful for user:', data.user.id);

    // Get user data from KV store using service role client
    let userData = await kv.get(`user:${data.user.id}`);
    
    if (!userData) {
      console.warn('User data not found for user ID:', data.user.id, 'attempting to create profile from auth data');
      
      // Try to get username from user metadata
      const username = data.user.user_metadata?.username || `user_${data.user.id.slice(0, 8)}`;
      
      // Create user profile if it doesn't exist (this can happen with admin-created users)
      userData = {
        id: data.user.id,
        email: data.user.email,
        username,
        balance: 0,
        createdAt: new Date().toISOString(),
        lastClaimTime: null,
        stats: {
          totalPredictions: 0,
          wins: 0,
          losses: 0,
          totalWinnings: 0,
          totalLosses: 0
        }
      };
      
      try {
        await Promise.all([
          kv.set(`user:${data.user.id}`, userData),
          kv.set(`username:${username}`, data.user.id)
        ]);
        console.log('Created missing user profile for:', data.user.id);
      } catch (kvError) {
        console.error('Failed to create user profile:', kvError);
        return c.json({ error: 'Failed to create user profile' }, 500);
      }
    }

    return c.json({
      access_token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        username: userData.username,
        balance: userData.balance
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    return c.json({ error: 'Internal server error during signin' }, 500);
  }
});

app.get("/make-server-c0e3567c/auth/profile", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    console.log('Profile request for user:', user.id);
    
    const userData = await kv.get(`user:${user.id}`);
    
    if (!userData) {
      console.error('User data not found in KV store for user:', user.id);
      return c.json({ error: 'User data not found' }, 404);
    }

    // Ensure stats exist
    if (!userData.stats) {
      userData.stats = {
        totalPredictions: 0,
        wins: 0,
        losses: 0,
        totalWinnings: 0,
        totalLosses: 0
      };
      await kv.set(`user:${user.id}`, userData);
    }

    const profileData = {
      id: user.id,
      email: user.email,
      username: userData.username,
      balance: userData.balance,
      stats: userData.stats,
      lastClaimTime: userData.lastClaimTime
    };

    console.log('Profile data returned for user:', user.id, 'balance:', userData.balance);

    return c.json({ user: profileData });

  } catch (error) {
    console.error('Get profile error:', error);
    
    // Provide more specific error information
    if (error.message.includes('No access token')) {
      return c.json({ error: 'No access token provided' }, 401);
    } else if (error.message.includes('Invalid or expired token')) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }
    
    return c.json({ error: 'Failed to get profile: ' + error.message }, 500);
  }
});

// User endpoints
app.post("/make-server-c0e3567c/user/update-balance", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    const { balance, operation, amount } = await c.req.json();
    
    const userData = await kv.get(`user:${user.id}`);
    if (!userData) {
      return c.json({ error: 'User data not found' }, 404);
    }

    let newBalance = userData.balance;
    
    if (balance !== undefined) {
      newBalance = balance;
    } else if (operation && amount) {
      if (operation === 'add') {
        newBalance += amount;
      } else if (operation === 'subtract') {
        newBalance -= amount;
      }
    }

    userData.balance = Math.max(0, newBalance); // Ensure balance doesn't go negative
    await kv.set(`user:${user.id}`, userData);

    return c.json({ balance: userData.balance });

  } catch (error) {
    console.error('Update balance error:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }
});

app.post("/make-server-c0e3567c/user/claim-daily", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    const userData = await kv.get(`user:${user.id}`);
    
    if (!userData) {
      return c.json({ error: 'User data not found' }, 404);
    }

    const now = Date.now();
    const lastClaimTime = userData.lastClaimTime;
    
    // Check if 24 hours have passed
    if (lastClaimTime) {
      const timeDiff = now - lastClaimTime;
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (timeDiff < twentyFourHours) {
        const timeUntilNextClaim = twentyFourHours - timeDiff;
        return c.json({ 
          error: 'Daily claim not available yet',
          timeUntilNextClaim 
        }, 429);
      }
    }

    // Award daily points
    const pointsAwarded = 500;
    userData.balance += pointsAwarded;
    userData.lastClaimTime = now;
    
    await kv.set(`user:${user.id}`, userData);

    return c.json({
      balance: userData.balance,
      pointsAwarded,
      lastClaimTime: now
    });

  } catch (error) {
    console.error('Claim daily points error:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }
});

app.post("/make-server-c0e3567c/user/record-prediction", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    const { wager, leverage, prediction, outcome, pointsChange } = await c.req.json();
    
    const userData = await kv.get(`user:${user.id}`);
    if (!userData) {
      return c.json({ error: 'User data not found' }, 404);
    }

    // Update user stats
    userData.stats.totalPredictions += 1;
    if (outcome === 'win') {
      userData.stats.wins += 1;
      userData.stats.totalWinnings += Math.abs(pointsChange);
    } else {
      userData.stats.losses += 1;
      userData.stats.totalLosses += Math.abs(pointsChange);
    }

    // Update balance
    userData.balance += pointsChange; // pointsChange can be positive (win) or negative (loss)
    userData.balance = Math.max(0, userData.balance);

    await kv.set(`user:${user.id}`, userData);

    return c.json({
      balance: userData.balance,
      stats: userData.stats
    });

  } catch (error) {
    console.error('Record prediction error:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }
});

// Streak endpoints
app.get("/make-server-c0e3567c/user/streak", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    const userData = await kv.get(`user:${user.id}`);
    
    if (!userData) {
      return c.json({ error: 'User data not found' }, 404);
    }

    // Initialize streak data if it doesn't exist
    if (!userData.streak) {
      userData.streak = {
        currentStreak: 0,
        lastStreakClaim: null,
        history: []
      };
      await kv.set(`user:${user.id}`, userData);
    }

    const now = Date.now();
    const lastStreakClaim = userData.streak.lastStreakClaim;
    
    let canClaim = false;
    if (!lastStreakClaim) {
      canClaim = true; // First time user
    } else {
      const timeDiff = now - lastStreakClaim;
      const twentyFourHours = 24 * 60 * 60 * 1000;
      canClaim = timeDiff >= twentyFourHours;
    }

    return c.json({
      currentStreak: userData.streak.currentStreak,
      canClaim,
      lastClaimTime: userData.streak.lastStreakClaim,
      history: userData.streak.history
    });

  } catch (error) {
    console.error('Get streak data error:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }
});

app.post("/make-server-c0e3567c/user/claim-streak", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    const { day, points } = await c.req.json();
    
    const userData = await kv.get(`user:${user.id}`);
    if (!userData) {
      return c.json({ error: 'User data not found' }, 404);
    }

    // Initialize streak data if it doesn't exist
    if (!userData.streak) {
      userData.streak = {
        currentStreak: 0,
        lastStreakClaim: null,
        history: []
      };
    }

    const now = Date.now();
    const lastStreakClaim = userData.streak.lastStreakClaim;
    
    // Check if 24 hours have passed since last claim
    if (lastStreakClaim) {
      const timeDiff = now - lastStreakClaim;
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (timeDiff < twentyFourHours) {
        const timeUntilNextClaim = twentyFourHours - timeDiff;
        return c.json({ 
          error: 'Streak claim not available yet',
          timeUntilNextClaim 
        }, 429);
      }
    }

    // Validate day progression
    const expectedNextDay = userData.streak.currentStreak >= 6 ? 1 : userData.streak.currentStreak + 1;
    if (day !== expectedNextDay) {
      return c.json({ error: 'Invalid streak day progression' }, 400);
    }

    // Award points
    userData.balance += points;
    userData.streak.currentStreak = day;
    userData.streak.lastStreakClaim = now;
    
    // Add to history
    const streakEntry = {
      day,
      date: new Date().toISOString(),
      points,
      claimed: true
    };
    userData.streak.history.push(streakEntry);
    
    // Keep only last 30 streak entries
    if (userData.streak.history.length > 30) {
      userData.streak.history = userData.streak.history.slice(-30);
    }
    
    await kv.set(`user:${user.id}`, userData);

    return c.json({
      currentStreak: userData.streak.currentStreak,
      balance: userData.balance,
      lastClaimTime: now
    });

  } catch (error) {
    console.error('Claim streak day error:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }
});

// Leaderboard endpoint with real-time user synchronization
app.get("/make-server-c0e3567c/leaderboard", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    
    // Get all users from KV store
    const allUsers = await kv.getByPrefix('user:');
    
    if (!allUsers || allUsers.length === 0) {
      return c.json({ leaderboard: [] });
    }
    
    // Real-time synchronization: Validate each user still exists
    const validUsers = [];
    const orphanedUserKeys = [];
    
    for (const userData of allUsers) {
      // Check if user data is valid and complete
      if (!userData || !userData.id || !userData.username) {
        // Mark incomplete user data for cleanup
        const userKey = `user:${userData?.id || 'unknown'}`;
        orphanedUserKeys.push(userKey);
        console.log(`Found orphaned user data: ${userKey}`);
        continue;
      }
      
      // Check if username mapping still exists (ensures user wasn't deleted)
      const usernameMapping = await kv.get(`username:${userData.username}`);
      
      if (!usernameMapping || usernameMapping !== userData.id) {
        // User was deleted but user data wasn't cleaned up properly
        orphanedUserKeys.push(`user:${userData.id}`);
        console.log(`Found orphaned user after deletion: ${userData.username} (${userData.id})`);
        continue;
      }
      
      // User is valid, add to leaderboard
      validUsers.push(userData);
    }
    
    // Clean up orphaned user data in background (non-blocking)
    if (orphanedUserKeys.length > 0) {
      console.log(`Cleaning up ${orphanedUserKeys.length} orphaned user records...`);
      
      // Use Promise.allSettled to ensure cleanup doesn't fail the request
      Promise.allSettled(
        orphanedUserKeys.map(key => kv.del(key))
      ).then((results) => {
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        console.log(`Cleanup completed: ${successful} successful, ${failed} failed`);
      }).catch(error => {
        console.error('Background cleanup error:', error);
      });
    }
    
    // Transform and sort valid users by points
    const leaderboard = validUsers
      .map((userData, index) => ({
        id: userData.id,
        name: userData.username || `User ${index + 1}`,
        points: userData.balance || 0,
        rank: 0,
        isCurrentUser: userData.id === user.id,
        predictions: {
          total: userData.stats?.totalPredictions || 0,
          wins: userData.stats?.wins || 0,
          winRate: userData.stats?.totalPredictions > 0 
            ? Math.round((userData.stats.wins / userData.stats.totalPredictions) * 100 * 10) / 10
            : 0
        }
      }))
      .sort((a, b) => b.points - a.points) // Sort by points descending
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }))
      .slice(0, 20); // Return top 20 only
    
    console.log(`Leaderboard returned with ${leaderboard.length} valid users${orphanedUserKeys.length > 0 ? ` (cleaned up ${orphanedUserKeys.length} orphaned records)` : ''}`);
    
    return c.json({ leaderboard });
    
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }
});

app.get("/make-server-c0e3567c/user/prediction-stats", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    const userData = await kv.get(`user:${user.id}`);
    
    if (!userData) {
      return c.json({ error: 'User data not found' }, 404);
    }

    // Initialize stats if they don't exist or are incomplete
    if (!userData.stats || typeof userData.stats !== 'object') {
      userData.stats = {
        totalPredictions: 0,
        wins: 0,
        losses: 0,
        totalWinnings: 0,
        totalLosses: 0
      };
      await kv.set(`user:${user.id}`, userData);
    } else {
      // Ensure all required fields exist
      const requiredFields = ['totalPredictions', 'wins', 'losses', 'totalWinnings', 'totalLosses'];
      let needsUpdate = false;
      
      for (const field of requiredFields) {
        if (typeof userData.stats[field] !== 'number') {
          userData.stats[field] = 0;
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        await kv.set(`user:${user.id}`, userData);
      }
    }

    const stats = userData.stats;
    const totalPredictions = stats.totalPredictions || 0;
    const correctPredictions = stats.wins || 0;
    const winRate = totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 100 * 10) / 10 : 0;
    const totalPointsEarned = stats.totalWinnings || 0;

    return c.json({
      totalPredictions,
      correctPredictions,
      winRate,
      totalPointsEarned
    });
    
  } catch (error) {
    console.error('Get prediction stats error:', error);
    return c.json({ error: 'Failed to get prediction stats' }, 500);
  }
});

app.delete("/make-server-c0e3567c/user/delete-account", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    
    // Delete user data from KV store
    await kv.del(`user:${user.id}`);
    
    // Delete user from auth system (if needed)
    // Note: This would typically involve calling Supabase auth admin API
    // For now, we'll just clear the user data
    
    return c.json({ message: 'Account deleted successfully' });
    
  } catch (error) {
    console.error('Delete account error:', error);
    return c.json({ error: 'Failed to delete account' }, 500);
  }
});

Deno.serve(app.fetch);