"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // Auto-focus first OTP box when step changes
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const sendOtp = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStep(2);
      setResendTimer(30);
    } catch {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard");
      } else {
        setError("Invalid code. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const next = [...otp];
    next[index] = value.slice(-1); // only last char
    setOtp(next);
    setError("");
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      if (index === 5) verifyOtp();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #07080d;
          font-family: 'Instrument Sans', sans-serif;
          color: #eeeef2;
          min-height: 100vh;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(232,249,74,0.3); }
          70%  { box-shadow: 0 0 0 10px rgba(232,249,74,0); }
          100% { box-shadow: 0 0 0 0 rgba(232,249,74,0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-card {
          animation: fadeUp 0.5s ease both;
        }
        .step-content {
          animation: slideLeft 0.35s ease both;
        }

        .email-input {
          width: 100%;
          background: #0f1018;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px 16px;
          font-family: 'Instrument Sans', sans-serif;
          font-size: 15px;
          color: #eeeef2;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          caret-color: #e8f94a;
        }
        .email-input::placeholder { color: #5a5a78; }
        .email-input:focus {
          border-color: rgba(232,249,74,0.5);
          box-shadow: 0 0 0 3px rgba(232,249,74,0.08);
        }

        .otp-box {
          width: 46px;
          height: 54px;
          background: #0f1018;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          text-align: center;
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #eeeef2;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          caret-color: #e8f94a;
        }
        .otp-box:focus {
          border-color: rgba(232,249,74,0.6);
          box-shadow: 0 0 0 3px rgba(232,249,74,0.1);
          background: #13141e;
        }
        .otp-box.filled {
          border-color: rgba(232,249,74,0.35);
          color: #e8f94a;
        }

        .primary-btn {
          width: 100%;
          background: #e8f94a;
          color: #07080d;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .primary-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(232,249,74,0.35);
        }
        .primary-btn:active:not(:disabled) { transform: translateY(0); }
        .primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .back-btn {
          background: none;
          border: none;
          color: #5a5a78;
          font-family: 'Instrument Sans', sans-serif;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0;
          transition: color 0.2s;
        }
        .back-btn:hover { color: #eeeef2; }

        .resend-btn {
          background: none;
          border: none;
          color: #e8f94a;
          font-size: 13px;
          cursor: pointer;
          padding: 0;
          font-family: 'Instrument Sans', sans-serif;
          transition: opacity 0.2s;
        }
        .resend-btn:hover { opacity: 0.7; }
        .resend-btn:disabled { color: #5a5a78; cursor: default; }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(7,8,13,0.3);
          border-top-color: #07080d;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .error-msg {
          color: #ff6b6b;
          font-size: 13px;
          margin-top: 8px;
          animation: fadeIn 0.2s ease;
        }

        .logo-icon {
          width: 40px; height: 40px;
          background: #e8f94a;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          margin: 0 auto 20px;
          animation: pulse-ring 2s ease-out infinite;
        }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 24px 0;
        }

        .step-indicator {
          display: flex;
          gap: 6px;
          justify-content: center;
          margin-bottom: 28px;
        }
        .step-dot {
          height: 3px;
          border-radius: 2px;
          transition: all 0.3s;
        }
      `}</style>

      {/* Background glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse at 50% 0%, rgba(91,79,255,0.12) 0%, transparent 60%)",
      }} />
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: 400, height: 300, borderRadius: "50%",
        background: "rgba(232,249,74,0.04)", filter: "blur(80px)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Page */}
      <div style={{
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px 16px",
        position: "relative", zIndex: 1,
      }}>
        <div className="login-card" style={{
          width: "100%", maxWidth: 400,
          background: "#0b0c14",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 24,
          padding: "36px 32px",
          boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
        }}>

          {/* Logo */}
          <div className="logo-icon">⬛</div>

          {/* Step indicator */}
          <div className="step-indicator">
            {[1, 2].map((s) => (
              <div key={s} className="step-dot" style={{
                width: step >= s ? 24 : 8,
                background: step >= s ? "#e8f94a" : "rgba(255,255,255,0.1)",
              }} />
            ))}
          </div>

          {/* ── STEP 1: Email ── */}
          {step === 1 && (
            <div className="step-content">
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800, fontSize: 26,
                letterSpacing: "-0.5px", marginBottom: 8,
                paddingLeft:"30%",
              }}>Linkup</h1>
              <p style={{ color: "#5a5a78", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
                Enter your email to receive a one-time login code.
              </p>

              <label style={{
                display: "block", fontSize: 12, fontWeight: 500,
                color: "#5a5a78", letterSpacing: "0.08em",
                textTransform: "uppercase", marginBottom: 8,
              }}>Email address</label>

              <input
                className="email-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                autoComplete="email"
              />

              {error && <p className="error-msg">⚠ {error}</p>}

              <div style={{ marginTop: 20 }}>
                <button className="primary-btn" onClick={sendOtp} disabled={loading}>
                  {loading ? <span className="spinner" /> : null}
                  {loading ? "Sending…" : "Send Login Code"}
                  {!loading && <span style={{ fontSize: 16 }}>→</span>}
                </button>
              </div>

              <div className="divider" />

              {/* <p style={{ textAlign: "center", fontSize: 13, color: "#5a5a78" }}>
                New here?{" "}
                <a href="/signup" style={{ color: "#e8f94a", textDecoration: "none", fontWeight: 500 }}>
                  Create an account
                </a>
              </p> */}
            </div>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 2 && (
            <div className="step-content">
              <button className="back-btn" onClick={() => { setStep(1); setOtp(["","","","","",""]); setError(""); }}
                style={{ marginBottom: 20 }}>
                ← Back
              </button>

              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800, fontSize: 26,
                letterSpacing: "-0.5px", marginBottom: 8,
              }}>Check your inbox</h1>
              <p style={{ color: "#5a5a78", fontSize: 14, marginBottom: 8, lineHeight: 1.6 }}>
                We sent a 6-digit code to
              </p>
              <p style={{
                color: "#eeeef2", fontSize: 14, fontWeight: 500,
                marginBottom: 28,
                background: "rgba(232,249,74,0.07)",
                border: "1px solid rgba(232,249,74,0.15)",
                borderRadius: 8, padding: "6px 12px",
                display: "inline-block",
              }}>{email}</p>

              {/* OTP boxes */}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 8 }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    className={`otp-box ${digit ? "filled" : ""}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                  />
                ))}
              </div>

              {error && <p className="error-msg" style={{ textAlign: "center" }}>⚠ {error}</p>}

              <div style={{ marginTop: 20 }}>
                <button className="primary-btn" onClick={verifyOtp} disabled={loading || otp.join("").length < 6}>
                  {loading ? <span className="spinner" /> : null}
                  {loading ? "Verifying…" : "Verify & Sign In"}
                  {!loading && <span style={{ fontSize: 16 }}>→</span>}
                </button>
              </div>

              <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#5a5a78" }}>
                Didn&apos;t receive it?{" "}
                <button
                  className="resend-btn"
                  disabled={resendTimer > 0}
                  onClick={async () => {
                    setResendTimer(30);
                    setOtp(["","","","","",""]);
                    setError("");
                    await fetch("/api/auth/send-otp", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email }),
                    });
                  }}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
                </button>
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}