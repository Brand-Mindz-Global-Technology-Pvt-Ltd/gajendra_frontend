/**
 * Session Manager for Admin Panel
 * Handles localStorage with 7-day expiry and session persistence
 */
class SessionManager {
    constructor() {
        this.SESSION_KEY = 'admin_session';
        this.SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        this.USER_DATA_KEY = 'admin_user_data';
        this.LAST_ACTIVITY_KEY = 'admin_last_activity';
    }

    /**
     * Save admin session data with expiry
     */
    saveSession(userData) {
        const sessionData = {
            user: userData,
            timestamp: Date.now(),
            expires: Date.now() + this.SESSION_DURATION
        };

        try {
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
            localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
            localStorage.setItem(this.LAST_ACTIVITY_KEY, Date.now().toString());
            
            // Also set individual keys for compatibility
            localStorage.setItem('admin', JSON.stringify(userData));
            localStorage.setItem('user_id', userData.id);
            localStorage.setItem('shop_id', userData.shop_id);
            localStorage.setItem('user_role', userData.role);
            
            console.log('✅ Admin session saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to save session:', error);
            return false;
        }
    }

    /**
     * Check if admin session is valid and not expired
     */
    isSessionValid() {
        try {
            const sessionData = localStorage.getItem(this.SESSION_KEY);
            if (!sessionData) {
                return false;
            }

            const session = JSON.parse(sessionData);
            const now = Date.now();

            // Check if session is expired
            if (now > session.expires) {
                this.clearSession();
                return false;
            }

            // Check if user has been inactive for more than 7 days
            const lastActivity = localStorage.getItem(this.LAST_ACTIVITY_KEY);
            if (lastActivity && (now - parseInt(lastActivity)) > this.SESSION_DURATION) {
                this.clearSession();
                return false;
            }

            return true;
        } catch (error) {
            console.error('❌ Session validation error:', error);
            this.clearSession();
            return false;
        }
    }

    /**
     * Get current admin user data
     */
    getCurrentUser() {
        if (!this.isSessionValid()) {
            return null;
        }

        try {
            const userData = localStorage.getItem(this.USER_DATA_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('❌ Failed to get user data:', error);
            return null;
        }
    }

    /**
     * Update last activity timestamp
     */
    updateActivity() {
        try {
            localStorage.setItem(this.LAST_ACTIVITY_KEY, Date.now().toString());
        } catch (error) {
            console.error('❌ Failed to update activity:', error);
        }
    }

    /**
     * Clear all session data
     */
    clearSession() {
        try {
            localStorage.removeItem(this.SESSION_KEY);
            localStorage.removeItem(this.USER_DATA_KEY);
            localStorage.removeItem(this.LAST_ACTIVITY_KEY);
            localStorage.removeItem('admin');
            localStorage.removeItem('user_id');
            localStorage.removeItem('shop_id');
            localStorage.removeItem('user_role');
            console.log('✅ Admin session cleared');
        } catch (error) {
            console.error('❌ Failed to clear session:', error);
        }
    }

    /**
     * Check if admin is logged in and redirect if not
     */
    requireAuth() {
        if (!this.isSessionValid()) {
            console.log('❌ Admin session expired or invalid');
            this.clearSession();
            window.location.href = 'login.html';
            return false;
        }
        
        this.updateActivity();
        return true;
    }

    /**
     * Initialize session management
     */
    init() {
        // Update activity on page load
        this.updateActivity();
        
        // Update activity on user interaction
        const events = ['click', 'keypress', 'scroll', 'mousemove'];
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.updateActivity();
            }, { passive: true });
        });

        // Check session validity every 5 minutes
        setInterval(() => {
            if (!this.isSessionValid()) {
                console.log('🔄 Session expired, redirecting to login');
                this.clearSession();
                window.location.href = 'login.html';
            }
        }, 5 * 60 * 1000); // 5 minutes
    }
}

// Create global instance
window.sessionManager = new SessionManager();
