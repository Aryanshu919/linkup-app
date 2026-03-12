"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const theme = {
  bg: "#07080d",
  surface: "#0f1018",
  border: "rgba(255,255,255,0.07)",
  accent: "#e8f94a",
  accent2: "#5b4fff",
  text: "#eeeef2",
  muted: "#5a5a78",
  cardBg: "#0b0c14",
};

const SOCIALS = [
  { name: "Instagram", color: "#e1306c", icon: "📸" },
  { name: "Twitter / X", color: "#1da1f2", icon: "🐦" },
  { name: "LinkedIn",   color: "#0077b5", icon: "💼" },
  { name: "GitHub",     color: "#6e40c9", icon: "🐙" },
  { name: "YouTube",    color: "#ff0000", icon: "▶️" },
  { name: "TikTok",     color: "#ff0050", icon: "🎵" },
];

// Fixed static pattern — never use Math.random() during render (causes SSR hydration mismatch)
const QR_CELLS = [
  1,1,1,0,1,0,1,0,1,1,1,
  1,0,1,1,0,1,0,1,1,0,1,
  1,0,1,0,1,0,1,0,1,0,1,
  1,1,1,0,0,1,0,1,1,1,1,
  0,1,0,1,0,0,1,0,0,1,0,
  1,0,1,0,1,1,0,1,1,0,1,
  0,1,0,0,1,0,1,0,0,1,0,
  1,1,1,1,0,1,0,1,1,1,1,
  1,0,1,0,1,0,0,0,1,0,1,
  1,1,0,1,0,1,1,0,0,1,1,
  1,0,1,1,0,0,1,1,1,0,1,
];

function QRMock() {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(11, 1fr)",
      gap: 2, width: 132, height: 132, padding: 10,
      background: "#fff", borderRadius: 12,
      boxShadow: "0 0 40px rgba(232,249,74,0.25)",
    }}>
      {QR_CELLS.map((filled, i) => (
        <div key={i} style={{
          borderRadius: 1.5,
          background: filled ? "#07080d" : "transparent",
        }} />
      ))}
    </div>
  );
}

interface StepCardProps {
  number: string;
  title: string;
  desc: string;
  delay: string;
}

function StepCard({ number, title, desc, delay }: StepCardProps) {
  return (
    <div style={{
      background: theme.cardBg,
      border: `1px solid ${theme.border}`,
      borderRadius: 18, padding: "32px 28px",
      flex: "1 1 260px", minWidth: 0,
      position: "relative", overflow: "hidden",
      animation: "fadeUp 0.6s ease both",
      animationDelay: delay,
    }}>
      <span style={{
        position: "absolute", top: -10, right: 16,
        fontSize: 96, fontFamily: "'Syne', sans-serif",
        fontWeight: 800, color: "rgba(255,255,255,0.03)",
        lineHeight: 1, userSelect: "none",
      }}>{number}</span>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: theme.accent, color: theme.bg,
        fontFamily: "'Syne', sans-serif", fontWeight: 800,
        fontSize: 16, display: "flex", alignItems: "center",
        justifyContent: "center", marginBottom: 18,
      }}>{number}</div>
      <h3 style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 700,
        fontSize: 18, marginBottom: 10, color: theme.text,
      }}>{title}</h3>
      <p style={{ color: theme.muted, fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
}

export default function HomePage() {
  const [scrolled, setScrolled]         = useState(false);
  const [activeSocial, setActiveSocial] = useState(0);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [isMobile, setIsMobile]         = useState(false);
  const [isTablet, setIsTablet]         = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth < 900);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveSocial((p) => (p + 1) % SOCIALS.length), 1600);
    return () => clearInterval(t);
  }, []);

  const px = isMobile ? "20px" : isTablet ? "28px" : "48px";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Sans:ital,wght@0,300;0,400;1,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${theme.bg}; color: ${theme.text}; font-family: 'Instrument Sans', sans-serif; overflow-x: hidden; }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes floatQR {
          0%,100% { transform:translateY(0) rotate(-2deg); }
          50%     { transform:translateY(-14px) rotate(2deg); }
        }
        @keyframes scanLine {
          0%   { top:8%;  opacity:1; }
          90%  { top:88%; opacity:1; }
          100% { top:88%; opacity:0; }
        }
        @keyframes blink {
          0%,100% { opacity:1; } 50% { opacity:0.3; }
        }
        @keyframes gradShift {
          0%   { background-position:0% 50%; }
          50%  { background-position:100% 50%; }
          100% { background-position:0% 50%; }
        }
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .nav-link { color:${theme.muted}; text-decoration:none; font-size:15px; transition:color 0.2s; }
        .nav-link:hover { color:${theme.text}; }

        .cta-btn {
          background:${theme.accent}; color:${theme.bg}; border:none; cursor:pointer;
          font-family:'Syne',sans-serif; font-weight:700; font-size:14px;
          padding:11px 24px; border-radius:100px;
          transition:transform 0.15s,box-shadow 0.2s; white-space:nowrap;
        }
        .cta-btn:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(232,249,74,0.35); }

        .cta-btn-lg {
          background:${theme.accent}; color:${theme.bg}; border:none; cursor:pointer;
          font-family:'Syne',sans-serif; font-weight:800; font-size:16px;
          padding:16px 36px; border-radius:100px;
          transition:transform 0.15s,box-shadow 0.2s;
          display:inline-flex; align-items:center; gap:10px; white-space:nowrap;
        }
        .cta-btn-lg:hover { transform:translateY(-3px); box-shadow:0 12px 40px rgba(232,249,74,0.4); }

        .outline-btn {
          background:transparent; color:${theme.text};
          border:1px solid ${theme.border}; cursor:pointer;
          font-family:'Syne',sans-serif; font-weight:600; font-size:14px;
          padding:11px 24px; border-radius:100px;
          transition:border-color 0.2s,background 0.2s; white-space:nowrap;
        }
        .outline-btn:hover { border-color:rgba(255,255,255,0.2); background:rgba(255,255,255,0.04); }

        .social-pill {
          display:flex; align-items:center; gap:8px;
          padding:7px 14px; border-radius:100px;
          border:1px solid ${theme.border}; background:${theme.cardBg};
          font-size:13px; cursor:default; transition:all 0.3s;
        }
        .social-pill.active {
          border-color:${theme.accent};
          background:rgba(232,249,74,0.08);
          color:${theme.accent};
        }

        .hamburger {
          display:none; flex-direction:column; gap:5px;
          cursor:pointer; padding:4px; background:none; border:none;
        }
        .hamburger span {
          display:block; width:22px; height:2px;
          background:${theme.text}; border-radius:2px; transition:all 0.3s;
        }

        @media (max-width:640px) {
          .nav-desktop-links, .nav-desktop-btns { display:none !important; }
          .hamburger { display:flex !important; }
          .free-label { display:none !important; }
          .cta-btn-lg { font-size:15px !important; padding:14px 26px !important; }
        }

        @media (max-width:400px) {
          .social-pill .pill-label { display:none; }
          .social-pill { padding:7px 10px; }
        }
      `}</style>

      {/* ── NAV ── */}
     <Navbar theme={theme} />

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: isTablet ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        padding: isTablet
          ? `${isMobile ? "90px" : "100px"} ${px} 60px`
          : `120px ${px} 80px`,
        position: "relative", overflow: "hidden",
        gap: isTablet ? 48 : 64,
        textAlign: isTablet ? "center" : "left",
        maxWidth: 1200, margin: "0 auto",
       
      }}>
        {/* BG glows */}
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          background: "rgba(91,79,255,0.12)", filter: "blur(110px)",
          top: -100, right: -80, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", width: 400, height: 400, borderRadius: "50%",
          background: "rgba(232,249,74,0.07)", filter: "blur(100px)",
          bottom: 0, left: 0, pointerEvents: "none",
        }} />

        {/* Copy */}
        <div style={{
          flex: 1, maxWidth: isTablet ? "100%" : 560,
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column",
          alignItems: isTablet ? "center" : "flex-start",
        }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px 6px 6px",
            borderRadius: 100, border: `1px solid ${theme.border}`,
            background: "rgba(232,249,74,0.06)",
            marginBottom: 28, fontSize: 13,
            animation: "fadeUp 0.5s ease both",
          }}>
            <span style={{
              background: theme.accent, color: theme.bg, fontSize: 11,
              fontWeight: 700, padding: "2px 8px", borderRadius: 100,
              fontFamily: "'Syne', sans-serif",
            }}>NEW</span>
            <span style={{ color: theme.muted }}>Share all your links in one scan</span>
          </div>

          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(36px, 5vw, 68px)",
            fontWeight: 800, lineHeight: 1.08,
            letterSpacing: "-2px", marginBottom: 24,
            animation: "fadeUp 0.6s ease 0.1s both",
          }}>
            One QR Code.<br />
            <span style={{
              background: `linear-gradient(90deg, ${theme.accent}, #b8ff57, ${theme.accent})`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "gradShift 3s linear infinite",
            }}>
              All Your Socials.
            </span>
          </h1>

          <p style={{
            fontSize: "clamp(14px, 2vw, 17px)", lineHeight: 1.75,
            color: theme.muted, maxWidth: 460, marginBottom: 32,
            animation: "fadeUp 0.6s ease 0.2s both",
          }}>
            Generate a single QR code that links to every social profile you own.
            Share it anywhere — one scan takes people straight to your full social universe.
          </p>

          {/* Social pills */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 8,
            marginBottom: 32, justifyContent: isTablet ? "center" : "flex-start",
            animation: "fadeUp 0.6s ease 0.3s both",
          }}>
            {SOCIALS.map((s, i) => (
              <div key={s.name} className={`social-pill ${i === activeSocial ? "active" : ""}`}>
                <span>{s.icon}</span>
                <span className="pill-label">{s.name}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{
            display: "flex", alignItems: "center",
            flexWrap: "wrap", gap: 16,
            justifyContent: isTablet ? "center" : "flex-start",
            animation: "fadeUp 0.6s ease 0.4s both",
          }}>
          <Link href="/login">
              <button className="cta-btn-lg">
              Generate My QR
              <span style={{ fontSize: 18 }}>→</span>
            </button>
          </Link>
            <span className="free-label" style={{ color: theme.muted, fontSize: 13 }}>
              Free forever · No credit card
            </span>
          </div>
        </div>

        {/* QR Visual */}
        <div style={{
          flex: 1, display: "flex", justifyContent: "center", alignItems: "center",
          position: "relative",
          minHeight: isTablet ? "auto" : 420,
          zIndex: 1,
          width: isTablet ? "100%" : "auto",
        }}>
          <div style={{
            position: "relative",
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 24, padding: "36px 32px",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 20,
            animation: "floatQR 5s ease-in-out infinite",
            boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
          }}>
            <div style={{ position: "relative" }}>
              <QRMock />
              <div style={{
                position: "absolute", left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
                animation: "scanLine 2.4s ease-in-out infinite",
                boxShadow: `0 0 8px ${theme.accent}`,
              }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 700,
                fontSize: 16, marginBottom: 4,
              }}>@yourhandle</p>
              <p style={{ color: theme.muted, fontSize: 12 }}>Scan to see all my links</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {SOCIALS.slice(0, 5).map((s) => (
                <div key={s.name} title={s.name} style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: `${s.color}22`, border: `1px solid ${s.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                }}>{s.icon}</div>
              ))}
            </div>
          </div>
          {/* Decorative rings — hide on small screens */}
          {!isMobile && [220, 300, 380].map((size, i) => (
            <div key={i} style={{
              position: "absolute", width: size, height: size, borderRadius: "50%",
              border: `1px solid rgba(255,255,255,${0.04 - i * 0.01})`,
              pointerEvents: "none",
              animation: `blink ${3 + i}s ease-in-out infinite`,
            }} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{
        padding: `80px ${px} 100px`,
        borderTop: `1px solid ${theme.border}`,
      }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{
            color: theme.accent, fontSize: 12, fontWeight: 700,
            letterSpacing: "0.15em", textTransform: "uppercase",
            marginBottom: 12, fontFamily: "'Syne', sans-serif",
          }}>How it works</p>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: "clamp(24px, 3vw, 42px)", letterSpacing: "-1px",
          }}>Ready in under 60 seconds</h2>
        </div>
        <div style={{
          display: "flex",
          flexDirection: isTablet ? "column" : "row",
          gap: 20, maxWidth: 980, margin: "0 auto",
        }}>
          <StepCard number="1" delay="0s"   title="Add Your Links"
            desc="Paste in your Instagram, Twitter, LinkedIn, GitHub — any platform you're on. We support 20+ networks." />
          <StepCard number="2" delay="0.1s" title="Get Your QR Code"
            desc="We instantly generate a unique QR code and a personal link page that lives at linkup.io/@you." />
          <StepCard number="3" delay="0.2s" title="Share Everywhere"
            desc="Print it on your business card, add it to your bio, or drop it in an email. One scan, every link." />
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{
        padding: `60px ${px} 100px`,
        display: "flex", justifyContent: "center",
      }}>
        <div style={{
          maxWidth: 720, width: "100%",
          background: `linear-gradient(135deg, ${theme.accent2}22, ${theme.cardBg})`,
          border: `1px solid ${theme.border}`,
          borderRadius: 24,
          padding: isMobile ? "36px 20px" : isTablet ? "48px 32px" : "60px 48px",
          textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at 50% 0%, rgba(232,249,74,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: "clamp(22px, 3vw, 38px)", letterSpacing: "-1px",
            marginBottom: 16, position: "relative",
          }}>
            Your entire social world,{isMobile ? " " : <br />}
            one scan away.
          </h2>
          <p style={{
            color: theme.muted,
            fontSize: "clamp(13px, 2vw, 15px)",
            marginBottom: 36, position: "relative", lineHeight: 1.7,
          }}>
            Join thousands of creators and professionals who use LinkUp
            to make sharing effortless.
          </p>
         <Link href="/login">
          <button className="cta-btn-lg" style={{ position: "relative" }}>
            Create Your Free QR Code
            <span style={{ fontSize: 18 }}>→</span>
          </button></Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${theme.border}` }}>
        <div style={{
          padding: `28px ${px}`,
          display: "flex",
          flexDirection: isTablet ? "column" : "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: isTablet ? 16 : 0,
          textAlign: isTablet ? "center" : "left",
        }}>
          <span style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18,
          }}>LinkUp</span>
          <p style={{ color: theme.muted, fontSize: 13 }}>© 2026 LinkUp. All rights reserved.</p>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a key={l} href="#" className="nav-link" style={{ fontSize: 13 }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
