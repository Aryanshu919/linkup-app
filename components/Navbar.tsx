"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface NavbarProps {
  theme: {
    bg: string;
    surface: string;
    border: string;
    accent: string;
    accent2: string;
    text: string;
    muted: string;
    cardBg: string;
  };
}

export default function Navbar({ theme }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 48px",
          backdropFilter: "blur(20px)",
          background: scrolled ? "rgba(7,8,13,0.88)" : "transparent",
          borderBottom: scrolled
            ? `1px solid ${theme.border}`
            : "1px solid transparent",
          transition: "all 0.3s",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: theme.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            ⬛
          </div>

          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: "-0.5px",
            }}
          >
            LinkUp
          </span>
        </div>

        {/* Desktop buttons */}
        <div className="nav-desktop-btns" style={{ display: "flex", gap: 12 }}>
          <Link href="/login">
            <button className="outline-btn">Log in</button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span
            style={{
              transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none",
            }}
          />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span
            style={{
              transform: menuOpen
                ? "rotate(-45deg) translate(5px,-5px)"
                : "none",
            }}
          />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 65,
            left: 0,
            right: 0,
            zIndex: 99,
            background: "rgba(7,8,13,0.97)",
            backdropFilter: "blur(20px)",
            borderBottom: `1px solid ${theme.border}`,
            padding: "20px 24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {["How it works", "Features", "Pricing"].map((l) => (
            <a
              key={l}
              href="#"
              className="nav-link"
              style={{ fontSize: 16 }}
              onClick={() => setMenuOpen(false)}
            >
              {l}
            </a>
          ))}

          <Link href="/login">
            <button
              className="outline-btn"
              style={{ textAlign: "center", padding: "14px" }}
              onClick={() => setMenuOpen(false)}
            >
              Log in
            </button>
          </Link>

          <button
            className="cta-btn"
            style={{ textAlign: "center", padding: "14px" }}
            onClick={() => setMenuOpen(false)}
          >
            Get Started Free
          </button>
        </div>
      )}
    </>
  );
}
