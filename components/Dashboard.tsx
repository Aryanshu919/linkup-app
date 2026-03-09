"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────
type Link = {
  id: string;
  platform: string;
  url: string;
  userId: string;
};

// ── Platform icon map (for link list display) ─────────────────────────────────
const PLATFORM_ICONS: Record<string, { icon: string; color: string }> = {
  instagram: { icon: "📸", color: "#e1306c" },
  twitter:   { icon: "🐦", color: "#1da1f2" },
  x:         { icon: "🐦", color: "#1da1f2" },
  linkedin:  { icon: "💼", color: "#0077b5" },
  github:    { icon: "🐙", color: "#6e40c9" },
  youtube:   { icon: "▶️", color: "#ff0000" },
  tiktok:    { icon: "🎵", color: "#ff0050" },
};

const getPlatformStyle = (value: string) =>
  PLATFORM_ICONS[value.toLowerCase()] ?? { icon: "🔗", color: "#888" };

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

function QRPattern({ size = 100 }: { size?: number }) {
  return (
    <div style={{ position: "relative", display: "inline-block", flexShrink: 0 }}>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(11, 1fr)",
        gap: 2, width: size, height: size, padding: 8,
        background: "#fff", borderRadius: 12,
        boxShadow: "0 0 32px rgba(232,249,74,0.25)",
      }}>
        {QR_CELLS.map((filled, i) => (
          <div key={i} style={{ borderRadius: 1.5, background: filled ? "#07080d" : "transparent" }} />
        ))}
      </div>
      <div style={{
        position: "absolute", left: 8, right: 8, height: 2,
        background: "linear-gradient(90deg, transparent, #e8f94a, transparent)",
        animation: "scanLine 2.4s ease-in-out infinite",
        boxShadow: "0 0 8px #e8f94a",
      }} />
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ light = false }: { light?: boolean }) {
  return (
    <span style={{
      display: "inline-block", width: 14, height: 14, borderRadius: "50%",
      border: `2px solid ${light ? "rgba(255,255,255,0.2)" : "rgba(7,8,13,0.2)"}`,
      borderTopColor: light ? "#eeeef2" : "#07080d",
      animation: "spin 0.7s linear infinite", flexShrink: 0,
    }} />
  );
}

// ── Field label ───────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      display: "block", fontSize: 11, fontWeight: 500,
      color: "#5a5a78", letterSpacing: "0.1em",
      textTransform: "uppercase", marginBottom: 8,
    }}>{children}</label>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "#0b0c14",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 20, padding: "26px 24px",
      ...style,
    }}>{children}</div>
  );
}

// ── Section title ─────────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "'Syne', sans-serif", fontWeight: 700,
      fontSize: 16, marginBottom: 18, color: "#eeeef2",
    }}>{children}</h2>
  );
}

// ── Styled input ──────────────────────────────────────────────────────────────
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: "100%", background: "#0f1018",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12, padding: "12px 16px",
        fontFamily: "'Instrument Sans', sans-serif",
        fontSize: 14, color: "#eeeef2", outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        caretColor: "#e8f94a",
        ...props.style,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "rgba(232,249,74,0.45)";
        e.target.style.boxShadow = "0 0 0 3px rgba(232,249,74,0.07)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "rgba(255,255,255,0.08)";
        e.target.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
    />
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard({ userId }: { userId: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"links" | "qr">("links");

  // Links state
  const [links, setLinks]           = useState<Link[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [platform, setPlatform]     = useState("instagram");
  const [url, setUrl]               = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError]     = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // QR state
  const [qrImage, setQrImage]       = useState<string | null>(null);
  const [qrLoading, setQrLoading]   = useState(false);
  const [qrError, setQrError]       = useState("");
  const [copied, setCopied]         = useState(false);

  // ── Fetch links on mount ──────────────────────────────────────────────────
  useEffect(() => {
    fetchLinks();
  }, [userId]);

  const fetchLinks = async () => {
    setLoadingLinks(true);
    try {
      const res = await fetch(`/api/links?userId=${userId}`);
      const data = await res.json();
      setLinks(Array.isArray(data) ? data : []);
    } catch {
      setLinks([]);
    } finally {
      setLoadingLinks(false);
    }
  };

  // ── Add link ──────────────────────────────────────────────────────────────
  const handleAddLink = async () => {
    if (!url.trim()) { setAddError("Please enter a URL."); return; }
    if (!url.startsWith("http")) { setAddError("URL must start with https://"); return; }
    setAddError("");
    setAddLoading(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, url, userId }),
      });
      const newLink = await res.json();
      setLinks((prev) => [...prev, newLink]);
      setUrl("");
    } catch {
      setAddError("Failed to add link. Try again.");
    } finally {
      setAddLoading(false);
    }
  };

  // ── Delete link (ready for DELETE /api/links/[id]) ────────────────────────
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/links/${id}`, { method: "DELETE" });
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } catch {
      // silently fail — add toast here if needed
    } finally {
      setDeletingId(null);
    }
  };

  // ── Generate QR ───────────────────────────────────────────────────────────
  // Your API: POST /api/qr/generate expects { slug }
  // It builds the URL as: ${NEXT_PUBLIC_URL}/profile/${slug}
  const handleGenerateQR = async () => {
    setQrLoading(true);
    setQrError("");
    setQrImage(null);
    try {
      const res = await fetch("/api/auth/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: userId }), // slug = userId (the user's unique handle)
      });
      const data = await res.json();
      if (data.qr) {
        setQrImage(data.qr);
      } else {
        setQrError("No QR returned. Check your API.");
      }
    } catch {
      setQrError("Failed to generate QR. Try again.");
    } finally {
      setQrLoading(false);
    }
  };

  // ── Download QR ───────────────────────────────────────────────────────────
  const downloadQR = () => {
    if (!qrImage) return;
    const a = document.createElement("a");
    a.href = qrImage;
    a.download = `linkup-qr-${userId}.png`;
    a.click();
  };

  // Profile URL matches your API: /profile/${slug}
  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/profile/${userId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #07080d; color: #eeeef2; font-family: 'Instrument Sans', sans-serif; overflow-x: hidden; }

        @keyframes fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes scanLine { 0% { top:8%; opacity:1; } 90% { top:88%; opacity:1; } 100% { top:88%; opacity:0; } }
        @keyframes floatQR  { 0%,100% { transform:translateY(0) rotate(-1.5deg); } 50% { transform:translateY(-10px) rotate(1.5deg); } }
        @keyframes gradShift { 0% { background-position:0% 50%; } 50% { background-position:100% 50%; } 100% { background-position:0% 50%; } }
        @keyframes spin     { to { transform:rotate(360deg); } }
        @keyframes popIn    { 0% { opacity:0; transform:scale(0.9); } 60% { transform:scale(1.03); } 100% { opacity:1; transform:scale(1); } }

        .primary-btn {
          background: #e8f94a; color: #07080d; border: none; cursor: pointer;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px;
          padding: 12px 24px; border-radius: 12px;
          transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          white-space: nowrap;
        }
        .primary-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(232,249,74,0.35); }
        .primary-btn:disabled { opacity:0.5; cursor:not-allowed; }

        .ghost-btn {
          background: transparent; color: #eeeef2;
          border: 1px solid rgba(255,255,255,0.1); cursor: pointer;
          font-family: 'Instrument Sans', sans-serif; font-size: 13px;
          padding: 9px 16px; border-radius: 10px;
          transition: border-color 0.2s, background 0.2s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .ghost-btn:hover { border-color:rgba(255,255,255,0.22); background:rgba(255,255,255,0.05); }

        .danger-btn {
          background: transparent; color: #ff6b6b;
          border: 1px solid rgba(255,107,107,0.15); cursor: pointer;
          font-size: 12px; padding: 6px 12px; border-radius: 8px;
          font-family: 'Instrument Sans', sans-serif;
          transition: background 0.2s, border-color 0.2s;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .danger-btn:hover { background:rgba(255,107,107,0.08); border-color:rgba(255,107,107,0.35); }
        .danger-btn:disabled { opacity:0.4; cursor:not-allowed; }

        .logout-btn {
          background: transparent; border: 1px solid rgba(255,107,107,0.2);
          color: #ff6b6b; cursor: pointer;
          font-family: 'Syne', sans-serif; font-weight: 600; font-size: 13px;
          padding: 9px 20px; border-radius: 10px;
          transition: background 0.2s, border-color 0.2s;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .logout-btn:hover { background:rgba(255,107,107,0.07); border-color:rgba(255,107,107,0.4); }

        .tab-btn {
          flex:1; padding:11px 0; border:none; border-radius:10px;
          cursor:pointer; font-family:'Syne',sans-serif;
          font-weight:600; font-size:14px; transition:all 0.2s;
        }
        .tab-btn.on  { background:#e8f94a; color:#07080d; box-shadow:0 4px 16px rgba(232,249,74,0.25); }
        .tab-btn.off { background:transparent; color:#5a5a78; }
        .tab-btn.off:hover { color:#eeeef2; background:rgba(255,255,255,0.04); }

        .link-row {
          display:flex; align-items:center; gap:12px;
          padding:13px 14px; border-radius:12px;
          border:1px solid rgba(255,255,255,0.06);
          background:#0f1018; margin-bottom:8px;
          animation:fadeUp 0.35s ease both;
          transition:border-color 0.2s;
        }
        .link-row:hover { border-color:rgba(255,255,255,0.12); }


        .empty-state {
          text-align:center; padding:48px 24px;
          animation:fadeIn 0.4s ease both;
        }

        @media (max-width:640px) {
          .topbar    { padding:14px 16px !important; }
          .page-body { padding:24px 16px !important; }
          .user-pill span { display:none; }
        }
      `}</style>

      {/* BG glows */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        background:"radial-gradient(ellipse at 70% 0%, rgba(91,79,255,0.12) 0%, transparent 55%)" }} />
      <div style={{ position:"fixed", bottom:-80, left:"20%", width:500, height:350,
        borderRadius:"50%", background:"rgba(232,249,74,0.04)", filter:"blur(100px)",
        pointerEvents:"none", zIndex:0 }} />

      <div style={{ minHeight:"100vh", position:"relative", zIndex:1 }}>

        {/* ── TOPBAR ── */}
        <nav className="topbar" style={{
          position:"sticky", top:0, zIndex:40,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"16px 40px",
          backdropFilter:"blur(20px)",
          background:"rgba(7,8,13,0.82)",
          borderBottom:"1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{
              width:30, height:30, borderRadius:8, background:"#e8f94a",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
            }}>⬛</div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:19, letterSpacing:"-0.5px" }}>
              LinkUp
            </span>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div className="user-pill" style={{
              display:"flex", alignItems:"center", gap:8,
              padding:"5px 12px 5px 5px",
              background:"rgba(255,255,255,0.04)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:100,
            }}>
              <div style={{
                width:24, height:24, borderRadius:"50%",
                background:"linear-gradient(135deg,#5b4fff,#e8f94a)", flexShrink:0,
              }} />
              <span style={{ fontSize:13, color:"#5a5a78" }}>{userId}</span>
            </div>
            <button className="logout-btn" onClick={() => router.push("/login")}>
              <span style={{ fontSize:14 }}>→</span> Log out
            </button>
          </div>
        </nav>

        {/* ── PAGE ── */}
        <div className="page-body" style={{ maxWidth:620, margin:"0 auto", padding:"40px 24px" }}>

          {/* Heading */}
          <div style={{ marginBottom:28, animation:"fadeUp 0.4s ease both" }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:8,
              padding:"5px 14px 5px 5px", borderRadius:100,
              border:"1px solid rgba(255,255,255,0.08)",
              background:"rgba(232,249,74,0.06)", marginBottom:16,
            }}>
              <span style={{
                background:"#e8f94a", color:"#07080d", fontSize:10, fontWeight:700,
                padding:"2px 8px", borderRadius:100, fontFamily:"'Syne',sans-serif",
              }}>DASHBOARD</span>
              <span style={{ fontSize:12, color:"#5a5a78" }}>Welcome back 👋</span>
            </div>
            <h1 style={{
              fontFamily:"'Syne',sans-serif", fontWeight:800,
              fontSize:"clamp(26px,4vw,38px)", letterSpacing:"-1px", lineHeight:1.1, marginBottom:8,
            }}>
              Your{" "}
              <span style={{
                background:"linear-gradient(90deg,#e8f94a,#b8ff57,#e8f94a)",
                backgroundSize:"200% auto",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                animation:"gradShift 3s linear infinite",
              }}>social links.</span>
            </h1>
            <p style={{ color:"#5a5a78", fontSize:14, lineHeight:1.7 }}>
              Add your social profiles, then generate a single QR code for all of them.
            </p>
          </div>

          {/* ── TAB SWITCHER ── */}
          <div style={{
            display:"flex", gap:6,
            background:"#0b0c14", border:"1px solid rgba(255,255,255,0.07)",
            borderRadius:14, padding:5, marginBottom:22,
            animation:"fadeUp 0.4s ease 0.05s both",
          }}>
            <button className={`tab-btn ${tab === "links" ? "on" : "off"}`} onClick={() => setTab("links")}>
              🔗 My Links {links.length > 0 && `(${links.length})`}
            </button>
            <button className={`tab-btn ${tab === "qr" ? "on" : "off"}`} onClick={() => setTab("qr")}>
              ⬛ Generate QR
            </button>
          </div>

          {/* ══════════════ LINKS TAB ══════════════ */}
          {tab === "links" && (
            <div style={{ animation:"fadeUp 0.35s ease both" }}>

              {/* Add link form */}
              <Card style={{ marginBottom:16 }}>
                <SectionTitle>Add a Social Link</SectionTitle>

                <div style={{ marginBottom:14 }}>
                  <Label>Platform</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Instagram, GitHub, TikTok…"
                    value={platform}
                    onChange={(e) => { setPlatform(e.target.value); }}
                  />
                </div>

                <div style={{ marginBottom:18 }}>
                  <Label>URL</Label>
                  <Input
                    type="url"
                    placeholder="https://yourprofile.com"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setAddError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
                  />
                  {addError && (
                    <p style={{ color:"#ff6b6b", fontSize:12, marginTop:6 }}>⚠ {addError}</p>
                  )}
                </div>

                <button
                  className="primary-btn"
                  style={{ width:"100%" }}
                  onClick={handleAddLink}
                  disabled={addLoading}
                >
                  {addLoading ? <><Spinner /> Adding…</> : <>+ Add Link</>}
                </button>
              </Card>

              {/* Links list */}
              <Card>
                <SectionTitle>
                  {loadingLinks ? "Loading…" : `${links.length} Link${links.length !== 1 ? "s" : ""} Added`}
                </SectionTitle>

                {loadingLinks ? (
                  <div style={{ display:"flex", justifyContent:"center", padding:"32px 0" }}>
                    <Spinner light />
                  </div>
                ) : links.length === 0 ? (
                  <div className="empty-state">
                    <div style={{ fontSize:48, marginBottom:14 }}>🔗</div>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:6 }}>
                      No links yet
                    </p>
                    <p style={{ color:"#5a5a78", fontSize:14 }}>
                      Add your first social link above to get started.
                    </p>
                  </div>
                ) : (
                  links.map((link, i) => {
                    const p = getPlatformStyle(link.platform);
                    return (
                      <div key={link.id} className="link-row" style={{ animationDelay:`${i * 0.06}s` }}>
                        {/* Platform icon */}
                        <div style={{
                          width:36, height:36, borderRadius:9, flexShrink:0,
                          background:`${p.color}20`, border:`1px solid ${p.color}40`,
                          display:"flex", alignItems:"center", justifyContent:"center", fontSize:17,
                        }}>{p.icon}</div>

                        {/* Info */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontWeight:500, fontSize:13, marginBottom:3, color:"#eeeef2" }}>
                            {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                          </p>
                          <p style={{
                            color:"#5a5a78", fontSize:12,
                            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                          }}>{link.url}</p>
                        </div>

                        {/* Delete */}
                        <button
                          className="danger-btn"
                          disabled={deletingId === link.id}
                          onClick={() => handleDelete(link.id)}
                        >
                          {deletingId === link.id ? <Spinner /> : "✕"}
                        </button>
                      </div>
                    );
                  })
                )}

                {links.length > 0 && (
                  <button
                    className="primary-btn"
                    style={{ width:"100%", marginTop:16 }}
                    onClick={() => setTab("qr")}
                  >
                    Generate QR Code →
                  </button>
                )}
              </Card>
            </div>
          )}

          {/* ══════════════ QR TAB ══════════════ */}
          {tab === "qr" && (
            <div style={{ animation:"fadeUp 0.35s ease both" }}>
              <Card style={{ marginBottom:16, textAlign:"center" }}>
                <SectionTitle>Generate Your QR Code</SectionTitle>
                <p style={{ color:"#5a5a78", fontSize:14, marginBottom:22, lineHeight:1.7 }}>
                  This QR code links to all {links.length > 0 ? `your ${links.length} social profile${links.length !== 1 ? "s" : ""}` : "your social profiles"}.
                  Anyone who scans it will see all your links.
                </p>

                {!qrImage ? (
                  <>
                    {/* Placeholder preview */}
                    <div style={{
                      display:"flex", justifyContent:"center", marginBottom:24,
                      animation:"floatQR 4s ease-in-out infinite",
                    }}>
                      <QRPattern size={130} />
                    </div>

                    {links.length === 0 && (
                      <div style={{
                        padding:"10px 14px", borderRadius:10, marginBottom:18,
                        background:"rgba(255,200,50,0.07)",
                        border:"1px solid rgba(255,200,50,0.2)",
                        color:"#ffc832", fontSize:13,
                      }}>
                        ⚠ Add at least one social link before generating.
                      </div>
                    )}

                    {qrError && (
                      <div style={{
                        padding:"10px 14px", borderRadius:10, marginBottom:18,
                        background:"rgba(255,107,107,0.07)",
                        border:"1px solid rgba(255,107,107,0.2)",
                        color:"#ff6b6b", fontSize:13,
                      }}>
                        ⚠ {qrError}
                      </div>
                    )}

                    <button
                      className="primary-btn"
                      style={{ width:"100%" }}
                      onClick={handleGenerateQR}
                      disabled={qrLoading || links.length === 0}
                    >
                      {qrLoading ? <><Spinner /> Generating…</> : "Generate QR Code →"}
                    </button>
                  </>
                ) : (
                  /* ── QR Result ── */
                  <div style={{ animation:"popIn 0.45s ease both" }}>
                    <p style={{
                      fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16,
                      marginBottom:6, color:"#eeeef2",
                    }}>Your QR code is ready! 🎉</p>
                    <p style={{ color:"#5a5a78", fontSize:13, marginBottom:24 }}>
                      Download it and share anywhere.
                    </p>

                    {/* Real QR image from API */}
                    <div style={{
                      display:"flex", justifyContent:"center", marginBottom:22,
                      animation:"floatQR 4s ease-in-out infinite",
                    }}>
                      <img
                        src={qrImage}
                        alt="Your QR Code"
                        style={{
                          width:160, height:160, borderRadius:16,
                          boxShadow:"0 0 48px rgba(232,249,74,0.3)",
                          border:"4px solid #fff",
                        }}
                      />
                    </div>

                    {/* Profile URL chip */}
                    <div style={{
                      display:"inline-flex", alignItems:"center", gap:8,
                      padding:"8px 16px", borderRadius:100,
                      background:"rgba(232,249,74,0.07)",
                      border:"1px solid rgba(232,249,74,0.2)",
                      marginBottom:24, fontSize:13,
                    }}>
                      <span style={{ color:"#5a5a78" }}>linkup.io/profile/</span>
                      <span style={{ color:"#e8f94a", fontWeight:500 }}>{userId}</span>
                    </div>

                    {/* Actions */}
                    <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                      <button className="primary-btn" onClick={downloadQR}>
                        ⬇ Download PNG
                      </button>
                      <button className="ghost-btn" onClick={copyLink}>
                        {copied ? "✓ Copied!" : "📋 Copy Link"}
                      </button>
                      <button className="ghost-btn" onClick={() => setQrImage(null)}>
                        ↺ Regenerate
                      </button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Back to links */}
              <div style={{ textAlign:"center" }}>
                <button className="ghost-btn" onClick={() => setTab("links")}>
                  ← Back to Links
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}