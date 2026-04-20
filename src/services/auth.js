import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc, getDoc, setDoc, serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

// ── In-memory OTP store (tab session only) ──
const otpStore = {};

// ── Generate 6-digit OTP ──
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── Derive a stable Firebase password from email ──
// This is deterministic so the same patient always has same password
function derivePassword(email) {
  // Simple deterministic hash: base64 of reversed email + salt
  const reversed = email.split("").reverse().join("");
  return btoa(`nirmaxis_${reversed}_patient`).slice(0, 28) + "Nx!";
}

// ── Send OTP via EmailJS ──
export async function sendEmailOTP(email) {
  if (!email || !email.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }

  const otp    = generateOTP();
  const expiry = Date.now() + 10 * 60 * 1000; // 10 min expiry

  // Store OTP in memory
  otpStore[email.toLowerCase()] = { otp, expiry, email };

  // Send via EmailJS
  if (typeof window.emailjs === "undefined") {
    throw new Error("Email service not loaded. Please refresh and try again.");
  }

  await window.emailjs.send(
    "service_839zf7p",   // Your EmailJS service ID
    "template_otp",      // We'll create this template
    {
      to_email:   email,
      to_name:    email.split("@")[0],
      otp_code:   otp,
      clinic_name:"NIRMAXIS Neuro & Ortho Rehabilitation",
      expiry_min: "10",
    }
  );

  return true;
}

// ── Verify OTP ──
export function verifyEmailOTP(email, enteredOTP) {
  const key    = email.toLowerCase();
  const stored = otpStore[key];

  if (!stored) throw new Error("No OTP found. Please request a new one.");
  if (Date.now() > stored.expiry) {
    delete otpStore[key];
    throw new Error("OTP expired. Please request a new one.");
  }
  if (stored.otp !== enteredOTP.trim()) {
    throw new Error("Invalid OTP. Please check and try again.");
  }

  // Clear used OTP
  delete otpStore[key];
  return true;
}

// ── Patient: Login or Register via Email OTP ──
export async function patientLoginWithEmail(email) {
  const password = derivePassword(email);

  // Try login first
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (loginErr) {
    // If user doesn't exist → create account
    if (
      loginErr.code === "auth/user-not-found" ||
      loginErr.code === "auth/invalid-credential" ||
      loginErr.code === "auth/invalid-email"
    ) {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user   = result.user;

      // Create Firestore user doc
      await setDoc(doc(db, "users", user.uid), {
        uid:       user.uid,
        email:     email,
        phone:     "",
        name:      "",
        role:      "patient",
        address:   "",
        area:      "",
        createdAt: serverTimestamp(),
      });

      return user;
    }
    throw loginErr;
  }
}

// ── Admin: Email + Password login ──
export async function adminLogin(email, password) {
  const result   = await signInWithEmailAndPassword(auth, email, password);
  const user     = result.user;
  const userSnap = await getDoc(doc(db, "users", user.uid));

  if (!userSnap.exists() || userSnap.data().role !== "admin") {
    await signOut(auth);
    throw new Error("Access denied. Not an admin account.");
  }

  return user;
}

// ── Admin: Forgot password ──
export function adminForgotPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

// ── Logout ──
export function logout() {
  return signOut(auth);
}

// ── Get user role ──
export async function getUserRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().role : null;
}

// ── Auth state listener ──
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}