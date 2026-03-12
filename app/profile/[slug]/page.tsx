import { prisma } from "@/lib/prisma";
import Link from "next/link";

// ── Platform icon + color map ─────────────────────────────────────────────────
const PLATFORM_META: Record<string, { icon: string; color: string; label: string }> = {
  instagram: { icon: "📸", color: "#e1306c", label: "Instagram"   },
  twitter:   { icon: "🐦", color: "#1da1f2", label: "Twitter / X" },
  x:         { icon: "🐦", color: "#1da1f2", label: "Twitter / X" },
  linkedin:  { icon: "💼", color: "#0077b5", label: "LinkedIn"    },
  github:    { icon: "🐙", color: "#6e40c9", label: "GitHub"      },
  youtube:   { icon: "▶️", color: "#ff0000", label: "YouTube"     },
  tiktok:    { icon: "🎵", color: "#ff0050", label: "TikTok"      },
  facebook:  { icon: "📘", color: "#1877f2", label: "Facebook"    },
  website:   { icon: "🌐", color: "#4ade80", label: "Website"     },
};

const getMeta = (platform: string) =>
  PLATFORM_META[platform.toLowerCase()] ?? {
    icon: "🔗",
    color: "#888",
    label: platform.charAt(0).toUpperCase() + platform.slice(1),
  };

// ── Static QR pattern ─────────────────────────────────────────────────────────
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

export default async function Profile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {

  const { slug} = await params;

  const profile = await prisma.profile.findUnique({
    where:{ userId:slug },
    include: {
      user: {
        include: { links: true },
      },
    },
  });

  if (!profile) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Instrument+Sans:wght@400&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #07080d; color: #eeeef2; font-family: 'Instrument Sans', sans-serif; }
        `}</style>
        <div style={{
          minHeight: "100vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 16,
          background: "#07080d",
        }}>
          <div style={{ fontSize: 56 }}>🔍</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24 }}>
            Profile not found
          </h1>
          <p style={{ color: "#5a5a78", fontSize: 14 }}>
            This link doesn&apos;t exist or has been removed.
          </p>
          <Link href="/" style={{
            marginTop: 8, color: "#e8f94a", fontSize: 14,
            textDecoration: "none", borderBottom: "1px solid rgba(232,249,74,0.3)",
          }}>← Back to LinkUp</Link>
        </div>
      </>
    );
  }

  const { user } = profile;
  const links = user.links ?? [];
  const initials = (user.name ?? slug).slice(0, 2).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: #07080d;
          color: #eeeef2;
          font-family: 'Instrument Sans', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes gradShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatAvatar {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-6px); }
        }
        @keyframes scanLine {
          0%   { top: 8%;  opacity: 1; }
          90%  { top: 88%; opacity: 1; }
          100% { top: 88%; opacity: 0; }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(232,249,74,0.3); }
          70%  { box-shadow: 0 0 0 12px rgba(232,249,74,0); }
          100% { box-shadow: 0 0 0 0 rgba(232,249,74,0); }
        }

        .link-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.07);
          background: #0b0c14;
          text-decoration: none;
          color: #eeeef2;
          transition: transform 0.18s, border-color 0.2s, box-shadow 0.2s, background 0.2s;
          animation: fadeUp 0.5s ease both;
        }
        .link-card:hover {
          transform: translateY(-3px) scale(1.01);
          border-color: rgba(232,249,74,0.25);
          background: #0f1018;
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
        }
        .link-card:active {
          transform: translateY(-1px) scale(1.005);
        }

        .arrow {
          margin-left: auto;
          color: #5a5a78;
          font-size: 18px;
          transition: color 0.2s, transform 0.2s;
          flex-shrink: 0;
        }
        .link-card:hover .arrow {
          color: #e8f94a;
          transform: translateX(3px);
        }

        .powered-by {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          font-size: 12px;
          color: #5a5a78;
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s;
        }
        .powered-by:hover { border-color: rgba(232,249,74,0.3); color: #e8f94a; }

        @media (max-width: 480px) {
          .profile-wrap { padding: 32px 16px 48px !important; }
        }
      `}</style>

      {/* ── BG GLOWS ── */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse at 50% 0%, rgba(91,79,255,0.14) 0%, transparent 60%)",
      }} />
      <div style={{
        position: "fixed", bottom: -60, left: "50%", transform: "translateX(-50%)",
        width: 480, height: 300, borderRadius: "50%",
        background: "rgba(232,249,74,0.05)", filter: "blur(90px)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* ── PAGE ── */}
      <div style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>

        {/* Topbar */}
        <div style={{
          display: "flex", justifyContent: "center",
          padding: "18px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 7,
            textDecoration: "none",
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: "#e8f94a",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13,
            }}>⬛</div>
            <span style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: 16, letterSpacing: "-0.5px", color: "#eeeef2",
            }}>LinkUp</span>
          </Link>
        </div>

        {/* Main content */}
        <div
          className="profile-wrap"
          style={{
            maxWidth: 480,
            margin: "0 auto",
            padding: "48px 24px 64px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >

          {/* ── AVATAR ── */}
          <div style={{
            animation: "floatAvatar 4s ease-in-out infinite",
            marginBottom: 20,
          }}>
            <div style={{
              width: 88, height: 88, borderRadius: "50%",
              background: "linear-gradient(135deg, #5b4fff, #e8f94a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: 30, color: "#07080d",
              animation: "pulse-ring 2.5s ease-out infinite",
              border: "3px solid #0b0c14",
              boxShadow: "0 0 0 3px rgba(232,249,74,0.15)",
            }}>
              {initials}
            </div>
          </div>

          {/* ── NAME ── */}
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: "clamp(22px, 5vw, 30px)",
            letterSpacing: "-0.5px", textAlign: "center",
            marginBottom: 6,
            animation: "fadeUp 0.4s ease 0.05s both",
          }}>
            {user.name || slug}
          </h1>

          {/* ── SLUG CHIP ── */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 14px",
            borderRadius: 100,
            background: "rgba(232,249,74,0.07)",
            border: "1px solid rgba(232,249,74,0.18)",
            marginBottom: 32,
            animation: "fadeUp 0.4s ease 0.1s both",
          }}>
            <span style={{ color: "#5a5a78", fontSize: 12 }}>linkup.io/profile/</span>
            <span style={{ color: "#e8f94a", fontSize: 12, fontWeight: 500 }}>{slug}</span>
          </div>

          {/* ── MINI QR ── */}
          <div style={{
            position: "relative",
            marginBottom: 36,
            animation: "fadeUp 0.4s ease 0.15s both",
          }}>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(11, 1fr)",
              gap: 2, width: 72, height: 72, padding: 6,
              background: "#fff", borderRadius: 10,
              boxShadow: "0 0 24px rgba(232,249,74,0.2)",
            }}>
              {QR_CELLS.map((filled, i) => (
                <div key={i} style={{
                  borderRadius: 1,
                  background: filled ? "#07080d" : "transparent",
                }} />
              ))}
            </div>
            <div style={{
              position: "absolute", left: 6, right: 6, height: 1.5,
              background: "linear-gradient(90deg, transparent, #e8f94a, transparent)",
              animation: "scanLine 2.4s ease-in-out infinite",
              boxShadow: "0 0 6px #e8f94a",
            }} />
          </div>

          {/* ── LINKS COUNT ── */}
          <p style={{
            color: "#5a5a78", fontSize: 13, marginBottom: 20,
            animation: "fadeUp 0.4s ease 0.2s both",
          }}>
            {links.length} social profile{links.length !== 1 ? "s" : ""}
          </p>

          {/* ── LINK CARDS ── */}
          <div style={{
            width: "100%",
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            {links.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "40px 20px",
                color: "#5a5a78", fontSize: 14,
                animation: "fadeIn 0.4s ease both",
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔗</div>
                <p>No links added yet.</p>
              </div>
            ) : (
              links.map((link, i) => {
                const meta = getMeta(link.platform);
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-card"
                    style={{ animationDelay: `${0.2 + i * 0.07}s` }}
                  >
                    {/* Platform icon */}
                    <div style={{
                      width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                      background: `${meta.color}18`,
                      border: `1px solid ${meta.color}35`,
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 20,
                    }}>
                      {meta.icon}
                    </div>

                    {/* Label + URL */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 600, fontSize: 15,
                        marginBottom: 3, color: "#eeeef2",
                      }}>{meta.label}</p>
                      <p style={{
                        fontSize: 12, color: "#5a5a78",
                        whiteSpace: "nowrap", overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>{link.url}</p>
                    </div>

                    {/* Arrow */}
                    <span className="arrow">→</span>
                  </a>
                );
              })
            )}
          </div>

          {/* ── DIVIDER ── */}
          <div style={{
            width: "100%", height: 1,
            background: "rgba(255,255,255,0.05)",
            margin: "36px 0 24px",
          }} />

          {/* ── POWERED BY ── */}
          <Link href="/" className="powered-by">
            <div style={{
              width: 16, height: 16, borderRadius: 4,
              background: "#e8f94a",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 8,
            }}>⬛</div>
            Powered by <strong style={{ color: "#eeeef2" }}>LinkUp</strong>
          </Link>

        </div>
      </div>
    </>
  );
}