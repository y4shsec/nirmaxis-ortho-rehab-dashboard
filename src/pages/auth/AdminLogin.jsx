import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin, adminForgotPassword } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";
import LoginLogo from "./LoginLogo";

export default function AdminLogin() {
  const navigate      = useNavigate();
  const { user, role }= useAuth();

  const [mode,    setMode]    = useState("login"); // "login" | "forgot" | "sent"
  const [email,   setEmail]   = useState("");
  const [password,setPassword]= useState("");
  const [showPass,setShowPass]= useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    if (user && role === "admin")   navigate("/admin");
    if (user && role === "patient") navigate("/dashboard");
  }, [user, role, navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await adminLogin(email, password);
      navigate("/admin");
    } catch (err) {
      if (err.message === "Access denied. Not an admin account.") {
        setError("This account does not have admin access.");
      } else if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Invalid email or password.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally { setLoading(false); }
  }

  async function handleForgot(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await adminForgotPassword(resetEmail.trim());
      setMode("sent");
    } catch (err) {
      setError(err.code === "auth/user-not-found"
        ? "No account found with this email."
        : "Failed to send reset email.");
    } finally { setLoading(false); }
  }

  const inp = {
    width:"100%", padding:"11px 14px",
    border:"1.5px solid var(--border)", borderRadius:8,
    fontSize:14, color:"var(--text-dark)", background:"white",
    outline:"none", fontFamily:"inherit",
  };
  const btnPrimary = {
    width:"100%", padding:"12px",
    background:"var(--teal)", color:"white",
    border:"none", borderRadius:8,
    fontSize:15, fontWeight:600,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1, fontFamily:"inherit",
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth:420 }}>
        <LoginLogo subtitle="ADMIN PORTAL" />

        {/* ── LOGIN ── */}
        {mode === "login" && (
          <>
            <h1 style={{ fontSize:22, fontWeight:700, color:"var(--teal-dark)", marginBottom:4 }}>Admin Login</h1>
            <p style={{ fontSize:14, color:"var(--text-mid)", marginBottom:24 }}>Restricted access — clinic staff only</p>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:6 }}>Email Address</label>
                <input style={inp} type="email" placeholder="admin@nirmaxis.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
              </div>
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <label style={{ fontSize:13, fontWeight:500 }}>Password</label>
                  <button type="button" onClick={() => { setMode("forgot"); setResetEmail(email); }}
                    style={{ background:"none", border:"none", color:"var(--teal)", fontSize:12, cursor:"pointer" }}>
                    Forgot password?
                  </button>
                </div>
                <div style={{ position:"relative" }}>
                  <input style={{ ...inp, paddingRight:44 }}
                    type={showPass ? "text" : "password"}
                    placeholder="Enter password"
                    value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", fontSize:16, cursor:"pointer", color:"var(--text-light)" }}>
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ background:"#ffebee", color:"#b71c1c", border:"1px solid #ef9a9a", padding:"10px 14px", borderRadius:8, fontSize:13, marginBottom:16 }}>
                  {error}
                </div>
              )}

              <button style={btnPrimary} disabled={loading}>
                {loading ? "Signing in..." : "Sign In →"}
              </button>
            </form>

            <div style={{ marginTop:20, textAlign:"center" }}>
              <a href="/login" style={{ fontSize:13, color:"var(--text-light)" }}>← Patient Login</a>
            </div>
            <div style={{ marginTop:14, padding:"10px 14px", background:"var(--cream)", borderRadius:8, fontSize:12, color:"var(--text-light)", textAlign:"center", border:"1px solid var(--border)" }}>
              🔒 Authorized personnel only
            </div>
          </>
        )}

        {/* ── FORGOT ── */}
        {mode === "forgot" && (
          <>
            <h1 style={{ fontSize:22, fontWeight:700, color:"var(--teal-dark)", marginBottom:4 }}>Reset Password</h1>
            <p style={{ fontSize:14, color:"var(--text-mid)", marginBottom:24 }}>Enter your admin email — we'll send a reset link</p>

            <form onSubmit={handleForgot}>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:6 }}>Admin Email</label>
                <input style={inp} type="email" placeholder="admin@nirmaxis.com"
                  value={resetEmail} onChange={e => setResetEmail(e.target.value)} required autoFocus />
              </div>
              {error && <p style={{ color:"var(--danger)", fontSize:13, marginBottom:12 }}>{error}</p>}
              <button style={btnPrimary} disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link →"}
              </button>
            </form>

            <div style={{ marginTop:20, textAlign:"center" }}>
              <button onClick={() => setMode("login")}
                style={{ background:"none", border:"none", color:"var(--teal)", fontWeight:600, cursor:"pointer", fontSize:13 }}>
                ← Back to Login
              </button>
            </div>
          </>
        )}

        {/* ── SENT ── */}
        {mode === "sent" && (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:52, marginBottom:16 }}>📧</div>
            <h1 style={{ fontSize:22, fontWeight:700, color:"var(--teal-dark)", marginBottom:8 }}>Reset Link Sent!</h1>
            <p style={{ fontSize:14, color:"var(--text-mid)", marginBottom:6 }}>Check inbox at</p>
            <p style={{ fontSize:15, fontWeight:600, color:"var(--teal)", marginBottom:24 }}>{resetEmail}</p>
            <p style={{ fontSize:13, color:"var(--text-light)", marginBottom:28 }}>
              Click the link to set a new password. Expires in 1 hour.
            </p>
            <button onClick={() => setMode("login")} style={{ ...btnPrimary, width:"auto", padding:"10px 28px" }}>
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}