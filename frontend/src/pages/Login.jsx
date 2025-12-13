// src/components/Login.js
import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/Login.css";
import { loginUser, registerUser } from "../services/api";
import { AuthContext } from "../contexts/AuthContext";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
    const [signupName, setSignupName] = useState("");
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!email && !password) {
            setError("Please enter your email and password.");
            return;
        } else if (!email) {
            setError("Please enter your email.");
            return;
        } else if (!password) {
            setError("Please enter your password.");
            return;
        }

        setLoading(true);
        try {
            // Call the actual API
            const user = await loginUser({ email, password });
            
            // Store user data in localStorage and context
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', user.id); // Using user ID as token for now
            if (setUser) setUser(user);
            
            // Clear form
            setEmail("");
            setPassword("");
            setError("");
            
            // Navigate to the intended page (if provided) or home
            alert(`Welcome back, ${user.name || user.email}!`);
            const explicit = location?.state?.redirectTo;
            const isManager = (user?.role || '').toUpperCase() === 'THEATER_MANAGER' || (user?.role || '').toUpperCase() === 'THEATRE_MANAGER' || (user?.role || '').toUpperCase() === 'MANAGER';
            const fallback = isManager ? '/theater-manager-dashboard' : '/';
            navigate(explicit || fallback);
            
        } catch (err) {
            setError(err.message || "Login failed. Please check your credentials.");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
            setError("Please fill in all fields.");
            return;
        } else if (signupPassword !== signupConfirmPassword) {
            setError("Passwords do not match.");
            return;
        } else if (signupPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);
        try {
            // Prepare user data for registration
            const userData = {
                name: signupName,
                email: signupEmail,
                password: signupPassword,
                role: "CUSTOMER" // Default role for new registrations
            };

            // Call the actual API
            const registeredUser = await registerUser(userData);
            
            // Clear form
            setSignupEmail("");
            setSignupPassword("");
            setSignupConfirmPassword("");
            setSignupName("");
            setError("");
            
            // Close modal and show success message
            setShowSignupModal(false);
            alert("Account created successfully! Please login with your credentials.");
            
        } catch (err) {
            setError(err.message || "Registration failed. Please try again.");
            console.error("Registration error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        if (!forgotEmail) {
            setError('Please enter your email.');
            return;
        }

        setLoading(true);
        try {
            // Note: You'll need to implement this endpoint in your backend
            // await forgotPassword({ email: forgotEmail });
            
            // For now, we'll show a success message
            alert(`If an account with ${forgotEmail} exists, a password reset link has been sent.`);
            setShowForgotModal(false);
            setForgotEmail("");
            setError("");
        } catch (err) {
            setError(err.message || "Failed to send reset link. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Close modals and clear errors
    const closeModals = () => {
        setShowSignupModal(false);
        setShowForgotModal(false);
        setError("");
    };

    return (
        <div className="login-page">
            <h2>Sign In</h2>
            
            {/* Error Display */}
            {error && (
                <div className="error-message" style={{ 
                    color: 'red', 
                    textAlign: 'center', 
                    marginBottom: '15px',
                    padding: '10px',
                    backgroundColor: '#ffe6e6',
                    borderRadius: '5px'
                }}>
                    {error}
                </div>
            )}
            
            <form className="login-form" onSubmit={handleLogin}>
                <div className="login-input-row">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoComplete="username"
                        disabled={loading}
                    />
                </div>
                <div className="login-input-row">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete="current-password"
                        disabled={loading}
                    />
                </div>
                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </div>
                <div className="forgot-link" style={{ textAlign: 'center', marginTop: '8px' }}>
                    <button 
                        type="button" 
                        className="signup-link-btn" 
                        onClick={() => setShowForgotModal(true)}
                        disabled={loading}
                    >
                        Forgot password?
                    </button>
                </div>
                <div className="signup-link">
                    Don't have an account? 
                    <button 
                        type="button" 
                        onClick={() => setShowSignupModal(true)} 
                        className="signup-link-btn"
                        disabled={loading}
                    >
                        Sign Up
                    </button>
                </div>
            </form>

            {/* Signup Modal */}
            {showSignupModal && (
                <div className="modal-overlay" onClick={closeModals}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create Account</h3>
                            <button 
                                type="button" 
                                className="modal-close" 
                                onClick={closeModals}
                                disabled={loading}
                            >
                                ✕
                            </button>
                        </div>
                        
                        {/* Error in modal */}
                        {error && (
                            <div className="error-message" style={{ 
                                color: 'red', 
                                textAlign: 'center', 
                                margin: '10px 0',
                                padding: '8px',
                                backgroundColor: '#ffe6e6',
                                borderRadius: '5px',
                                fontSize: '14px'
                            }}>
                                {error}
                            </div>
                        )}
                        
                        <form className="signup-form" onSubmit={handleSignup}>
                            <div className="login-input-row">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={signupName}
                                    onChange={(e) => setSignupName(e.target.value)}
                                    autoComplete="name"
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <div className="login-input-row">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={signupEmail}
                                    onChange={(e) => setSignupEmail(e.target.value)}
                                    autoComplete="email"
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <div className="login-input-row">
                                <input
                                    type="password"
                                    placeholder="Password (min. 6 characters)"
                                    value={signupPassword}
                                    onChange={(e) => setSignupPassword(e.target.value)}
                                    autoComplete="new-password"
                                    disabled={loading}
                                    minLength="6"
                                    required
                                />
                            </div>
                            <div className="login-input-row">
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={signupConfirmPassword}
                                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    disabled={loading}
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button 
                                    type="submit" 
                                    className="login-btn"
                                    disabled={loading}
                                >
                                    {loading ? "Creating Account..." : "Sign Up"}
                                </button>
                                <button 
                                    type="button" 
                                    className="signup-btn" 
                                    onClick={closeModals}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="modal-overlay" onClick={closeModals}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Reset Password</h3>
                            <button 
                                type="button" 
                                className="modal-close" 
                                onClick={closeModals}
                                disabled={loading}
                            >
                                ✕
                            </button>
                        </div>
                        
                        {/* Error in modal */}
                        {error && (
                            <div className="error-message" style={{ 
                                color: 'red', 
                                textAlign: 'center', 
                                margin: '10px 0',
                                padding: '8px',
                                backgroundColor: '#ffe6e6',
                                borderRadius: '5px',
                                fontSize: '14px'
                            }}>
                                {error}
                            </div>
                        )}
                        
                            <div className="form-actions">
                                <button 
                                    type="submit" 
                                    className="login-btn"
                                    disabled={loading}
                                >
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </button>
                               
                            </div>
                        
                    </div>
                </div>
            )}
        </div>
    );
}

export default Login;