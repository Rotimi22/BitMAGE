import { projectId, publicAnonKey } from './supabase/info';

export const adminService = {
  async removeUser(username: string) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c0e3567c/admin/remove-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ username }),
          // Add timeout for network issues
          signal: AbortSignal.timeout(10000)
        }
      );

      if (!response.ok) {
        // Handle different error scenarios
        let errorMessage = 'Failed to remove user';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch (parseError) {
          // If we can't parse the error response, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        if (response.status === 404) {
          // User not found - this is actually success for cleanup purposes
          console.log(`User ${username} not found (already removed)`);
          return { message: `User ${username} not found (already removed)` };
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('User removal result:', result);
      return result;
    } catch (error) {
      console.error('Failed to remove user:', error);
      
      // Provide more specific error messages
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - server may be unavailable');
      } else if (error.message.includes('fetch')) {
        throw new Error('Network error - please check your connection');
      }
      
      throw error;
    }
  },

  async cleanupLeaderboard() {
    try {
      console.log('Initiating comprehensive leaderboard cleanup...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c0e3567c/admin/cleanup-leaderboard`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          signal: AbortSignal.timeout(15000) // Longer timeout for cleanup operations
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to cleanup leaderboard';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch (parseError) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Leaderboard cleanup result:', result);
      return result;
    } catch (error) {
      console.error('Failed to cleanup leaderboard:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Cleanup timeout - server may be busy');
      } else if (error.message.includes('fetch')) {
        throw new Error('Network error during cleanup');
      }
      
      throw error;
    }
  }
};