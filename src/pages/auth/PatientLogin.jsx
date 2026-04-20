import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { sendEmailOTP, verifyEmailOTP, patientLoginWithEmail } from "../../services/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import LoginLogo from "./LoginLogo";

export default function PatientLogin() {
  const navigate      = useNavigate();
  const [searchParams]= useSearchParams();
  const { user, role }= useAuth();

  // "login" | "register" | "otp"
  const [mode, setMode]       = useState(
    searchParams.get("signup") === "true" ? "register" : "login"
  );
  const [email,   setEmail]   = useState("");
  const [name,    setName]    = useState("");
  const [otp,     setOtp]     = useState(["","","","","",""]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [timer,   setTimer]   = useState(0);
  const [otpMode, setOtpMode] = useState("login"); // which flow triggered OTP

  useEffect(() => {
    if (user && role === "patient") navigate("/dashboard");
    if (user && role === "admin")   navigate("/admin");
  }, [user, role, navigate]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // ── Send OTP ──
  async function handleSendOTP(e, forMode = "login") {
    e.preventDefault();
    setError("");

    const trimEmail = email.trim().toLowerCase();
    if (!trimEmail || !trimEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (forMode === "register" && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);
    try {
      await sendEmailOTP(trimEmail);
      setOtpMode(forMode);
      setMode("otp");
      setTimer(60);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Verify OTP + login ──
  async function handleVerifyOTP(e) {
    e.preventDefault();
    setError("");

    const otpVal = otp.join("");
    if (otpVal.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      // Verify OTP in memory
      verifyEmailOTP(email.trim().toLowerCase(), otpVal);

      // Login / register with Firebase
      const firebaseUser = await patientLoginWithEmail(email.trim().toLowerCase());

      // If registering → save name
      if (otpMode === "register" && name.trim()) {
        await updateDoc(doc(db, "users", firebaseUser.uid), {
          name:      name.trim(),
          updatedAt: serverTimestamp(),
        });
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
      setOtp(["","","","","",""]);
      document.getElementById("otp-0")?.focus();
    } finally {
      setLoading(false);
    }
  }

  // ── OTP box handlers ──
  function handleOtpChange(i, val) {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  }
  function handleOtpKey(i, e) {
    if (e.key === "Backspace" && !otp[i] && i > 0)
      document.getElementById(`otp-${i - 1}`)?.focus();
  }

  function resetMode(m) {
    setError("");
    setOtp(["","","","","",""]);
    setMode(m);
  }

  const inp = {
    width:"100%", padding:"11px 14px",
    border:"1.5px solid var(--border)", borderRadius:8,
    fontSize:14, color:"var(--text-dark)", background:"white",
    outline:"none", fontFamily:"inherit", transition:"border-color 0.2s",
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
      <div className="auth-card" style={{ maxWidth:440 }}>
        <LoginLogo subtitle="NEURO & ORTHO REHABILITATION" />

        {/* ── LOGIN ── */}
        {mode === "login" && (
          <>
            <h1 style={{ fontSize:22, fontWeight:700, color:"var(--teal-dark)", marginBottom:4 }}>Welcome back</h1>
            <p style={{ fontSize:14, color:"var(--text-mid)", marginBottom:24 }}>Enter your email to receive a login OTP</p>
            <form onSubmit={e => handleSendOTP(e, "login")}>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:6 }}>Email Address</label>
                <input style={inp} type="email" placeholder="your@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} autoFocus required />
              </div>
              {error && <p style={{ color:"var(--danger)", fontSize:13, marginBottom:12 }}>{error}</p>}
              <button style={btnPrimary} disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP →"}
              </button>
            </form>
            <div style={{ marginTop:20, textAlign:"center", fontSize:13 }}>
              <span style={{ color:"var(--text-light)" }}>New patient? </span>
              <button onClick={() => resetMode("register")}
                style={{ background:"none", border:"none", color:"var(--teal)", fontWeight:600, cursor:"pointer", fontSize:13 }}>
                Create account
              </button>
            </div>
            <div style={{ borderTop:"1px solid var(--border)", marginTop:20, paddingTop:16, textAlign:"center" }}>
              <a href="/admin/login" style={{ fontSize:12, color:"var(--text-light)" }}>🔒 Admin / Staff Login</a>
            </div>
          </>
        )}

        {/* ── REGISTER ── */}
        {mode === "register" && (
          <>
            <h1 style={{ fontSize:22, fontWeight:700, color:"var(--teal-dark)", marginBottom:4 }}>Create Account</h1>
            <p style={{ fontSize:14, color:"var(--text-mid)", marginBottom:24 }}>Join NIRMAXIS to track your recovery</p>
            <form onSubmit={e => handleSendOTP(e, "register")}>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:6 }}>Full Name *</label>
                <input style={inp} type="text" placeholder="Your full name"
                  value={name} onChange={e => setName(e.target.value)} autoFocus required />
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:6 }}>Email Address *</label>
                <input style={inp} type="email" placeholder="your@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              {error && <p style={{ color:"var(--danger)", fontSize:13, marginBottom:12 }}>{error}</p>}
              <button style={btnPrimary} disabled={loading}>
                {loading ? "Sending OTP..." : "Continue →"}
              </button>
            </form>
            <div style={{ marginTop:20, textAlign:"center", fontSize:13 }}>
              <span style={{ color:"var(--text-light)" }}>Already have account? </span>
              <button onClick={() => resetMode("login")}
                style={{ background:"none", border:"none", color:"var(--teal)", fontWeight:600, cursor:"pointer", fontSize:13 }}>
                Login
              </button>
            </div>
          </>
        )}

        {/* ── OTP ── */}
        {mode === "otp" && (
          <>
            <h1 style={{ fontSize:22, fontWeight:700, color:"var(--teal-dark)", marginBottom:4 }}>Check your email</h1>
            <p style={{ fontSize:14, color:"var(--text-mid)", marginBottom:6 }}>
              6-digit OTP sent to
            </p>
            <p style={{ fontSize:15, fontWeight:600, color:"var(--teal-dark)", marginBottom:24 }}>
              {email}
            </p>

            <form onSubmit={handleVerifyOTP}>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:500, marginBottom:10 }}>Enter OTP</label>
                <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKey(i, e)}
                      autoFocus={i === 0}
                      style={{
                        width:48, height:54,
                        textAlign:"center",
                        fontSize:22, fontWeight:700,
                        border:`2px solid ${d ? "var(--teal)" : "var(--border)"}`,
                        borderRadius:10, outline:"none",
                        background: d ? "var(--teal-light)" : "white",
                        color:"var(--teal-dark)", transition:"all 0.15s",
                        fontFamily:"inherit",
                      }}
                    />
                  ))}
                </div>
              </div>

              {error && <p style={{ color:"var(--danger)", fontSize:13, marginBottom:12, textAlign:"center" }}>{error}</p>}

              <button
                style={{ ...btnPrimary, opacity:(loading || otp.join("").length !== 6) ? 0.6 : 1 }}
                disabled={loading || otp.join("").length !== 6}
              >
                {loading ? "Verifying..." : "Verify & Login →"}
              </button>
            </form>

            <div style={{ marginTop:20, textAlign:"center", fontSize:13 }}>
              {timer > 0 ? (
                <p style={{ color:"var(--text-light)" }}>
                  Resend OTP in <strong style={{ color:"var(--teal)" }}>{timer}s</strong>
                </p>
              ) : (
                <button
                  onClick={e => handleSendOTP(e, otpMode)}
                  style={{ background:"none", border:"none", color:"var(--teal)", fontWeight:600, cursor:"pointer", fontSize:13 }}
                >
                  ← Resend OTP
                </button>
              )}
            </div>

            <div style={{ marginTop:12, textAlign:"center" }}>
              <button onClick={() => resetMode(otpMode === "register" ? "register" : "login")}
                style={{ background:"none", border:"none", color:"var(--text-light)", fontSize:12, cursor:"pointer" }}>
                ← Change email
              </button>
            </div>

            <div style={{ marginTop:16, padding:"12px 14px", background:"#e8f4f8", borderRadius:8, fontSize:12, color:"var(--teal-dark)" }}>
              📧 Spam folder bhi check karo agar OTP nahi aaya.
            </div>
          </>
        )}
      </div>
    </div>
  );
}