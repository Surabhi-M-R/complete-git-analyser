// Authentication UI Component
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.createAuthUI();
        this.attachEventListeners();
        this.checkAuthState();
    }

    createAuthUI() {
        // Create authentication modal
        const authModal = document.createElement('div');
        authModal.id = 'authModal';
        authModal.className = 'auth-modal';
        authModal.innerHTML = `
            <div class="auth-modal-content">
                <div class="auth-header">
                    <h2>Repository Analyzer Pro</h2>
                    <span class="auth-close" id="authClose">&times;</span>
                </div>
                
                <div class="auth-tabs">
                    <button class="auth-tab active" data-tab="signin">Sign In</button>
                    <button class="auth-tab" data-tab="signup">Sign Up</button>
                </div>
                
                <div class="auth-content">
                    <!-- Sign In Form -->
                    <form id="signinForm" class="auth-form active">
                        <div class="form-group">
                            <label for="signinEmail">Email:</label>
                            <input type="email" id="signinEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="signinPassword">Password:</label>
                            <input type="password" id="signinPassword" required>
                        </div>
                        <button type="submit" class="auth-btn">Sign In</button>
                        <button type="button" class="auth-link" id="forgotPassword">Forgot Password?</button>
                    </form>
                    
                    <!-- Sign Up Form -->
                    <form id="signupForm" class="auth-form">
                        <div class="form-group">
                            <label for="signupName">Display Name:</label>
                            <input type="text" id="signupName">
                        </div>
                        <div class="form-group">
                            <label for="signupEmail">Email:</label>
                            <input type="email" id="signupEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="signupPassword">Password:</label>
                            <input type="password" id="signupPassword" required>
                        </div>
                        <button type="submit" class="auth-btn">Sign Up</button>
                    </form>
                </div>
            </div>
        `;

        // Create user profile dropdown
        const userProfile = document.createElement('div');
        userProfile.id = 'userProfile';
        userProfile.className = 'user-profile hidden';
        userProfile.innerHTML = `
            <div class="user-info">
                <span class="user-name" id="userName">User</span>
                <button class="user-menu-btn" id="userMenuBtn">▼</button>
            </div>
            <div class="user-menu" id="userMenu">
                <a href="#" id="profileLink">Profile</a>
                <a href="#" id="historyLink">Analysis History</a>
                <a href="#" id="signoutLink">Sign Out</a>
            </div>
        `;

        document.body.appendChild(authModal);
        document.body.appendChild(userProfile);
    }

    attachEventListeners() {
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Close modal
        document.getElementById('authClose').addEventListener('click', () => {
            this.hideAuthModal();
        });

        // Form submissions
        document.getElementById('signinForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.signIn();
        });

        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.signUp();
        });

        // Forgot password
        document.getElementById('forgotPassword').addEventListener('click', () => {
            this.resetPassword();
        });

        // User menu
        document.getElementById('userMenuBtn').addEventListener('click', () => {
            this.toggleUserMenu();
        });

        // Sign out
        document.getElementById('signoutLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.signOut();
        });

        // Close modal when clicking outside
        document.getElementById('authModal').addEventListener('click', (e) => {
            if (e.target.id === 'authModal') {
                this.hideAuthModal();
            }
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tabName}Form`).classList.add('active');
    }

    async signIn() {
        const email = document.getElementById('signinEmail').value;
        const password = document.getElementById('signinPassword').value;

        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success) {
                this.currentUser = result.user;
                this.isAuthenticated = true;
                this.updateUI();
                this.hideAuthModal();
                this.showMessage('Signed in successfully!', 'success');
            } else {
                this.showMessage(result.error, 'error');
            }
        } catch (error) {
            this.showMessage('Sign in failed: ' + error.message, 'error');
        }
    }

    async signUp() {
        const displayName = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, displayName })
            });

            const result = await response.json();

            if (result.success) {
                this.currentUser = result.user;
                this.isAuthenticated = true;
                this.updateUI();
                this.hideAuthModal();
                this.showMessage('Account created successfully!', 'success');
            } else {
                this.showMessage(result.error, 'error');
            }
        } catch (error) {
            this.showMessage('Sign up failed: ' + error.message, 'error');
        }
    }

    async signOut() {
        try {
            const response = await fetch('/api/auth/signout', {
                method: 'POST'
            });

            const result = await response.json();

            if (result.success) {
                this.currentUser = null;
                this.isAuthenticated = false;
                this.updateUI();
                this.showMessage('Signed out successfully!', 'success');
            } else {
                this.showMessage(result.error, 'error');
            }
        } catch (error) {
            this.showMessage('Sign out failed: ' + error.message, 'error');
        }
    }

    async resetPassword() {
        const email = document.getElementById('signinEmail').value;
        
        if (!email) {
            this.showMessage('Please enter your email address first', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage('Password reset email sent!', 'success');
            } else {
                this.showMessage(result.error, 'error');
            }
        } catch (error) {
            this.showMessage('Password reset failed: ' + error.message, 'error');
        }
    }

    checkAuthState() {
        // Check if user is already authenticated
        fetch('/api/auth/current-user')
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    this.currentUser = result.user;
                    this.isAuthenticated = true;
                    this.updateUI();
                } else {
                    this.showAuthModal();
                }
            })
            .catch(() => {
                this.showAuthModal();
            });
    }

    updateUI() {
        const authModal = document.getElementById('authModal');
        const userProfile = document.getElementById('userProfile');

        if (this.isAuthenticated) {
            authModal.style.display = 'none';
            userProfile.classList.remove('hidden');
            document.getElementById('userName').textContent = this.currentUser.displayName || this.currentUser.email;
        } else {
            authModal.style.display = 'flex';
            userProfile.classList.add('hidden');
        }
    }

    showAuthModal() {
        document.getElementById('authModal').style.display = 'flex';
    }

    hideAuthModal() {
        document.getElementById('authModal').style.display = 'none';
    }

    toggleUserMenu() {
        const userMenu = document.getElementById('userMenu');
        userMenu.classList.toggle('show');
    }

    showMessage(message, type) {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `auth-message ${type}`;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});
