import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const patientNav = [
  { path: "/dashboard",              icon: "🏠", label: "Home" },
  { path: "/dashboard/book",         icon: "📅", label: "Book Appointment" },
  { path: "/dashboard/appointments", icon: "📋", label: "My Appointments" },
  { path: "/dashboard/history",      icon: "📂", label: "Treatment History" },
];

const adminNav = [
  { path: "/admin",              icon: "📊", label: "Dashboard" },
  { path: "/admin/appointments", icon: "📋", label: "Appointments" },
  { path: "/admin/patients",     icon: "👥", label: "Patients" },
  { path: "/admin/revenue",      icon: "💰", label: "Revenue" },
  { path: "/admin/blogs",        icon: "✍️",  label: "Blogs" },
  { path: "/admin/testimonials", icon: "⭐", label: "Testimonials" },
  { path: "/admin/settings",     icon: "⚙️",  label: "Clinic Settings" },
];

export default function Sidebar({ type = "patient" }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const nav       = type === "admin" ? adminNav : patientNav;
  const [hovered, setHovered]   = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  // const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // useEffect(() => {
  //   const handleResize = () => setIsMobile(window.innerWidth <= 768);
  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile sidebar open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        .sidebar-inner {
          animation: slideIn 0.3s cubic-bezier(0.4,0,0.2,1);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        @media (max-width: 768px) {
          .sidebar-inner {
            transform: translateX(-100%) !important;
            animation: none !important;
          }
          .sidebar-inner.mobile-open {
            transform: translateX(0) !important;
          }
        }
        .nav-btn {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 14px; border-radius: 10px;
          border: 1px solid transparent;
          font-size: 14px; cursor: pointer; width: 100%;
          text-align: left; font-family: inherit;
          transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
          position: relative; background: transparent;
        }
        .nav-btn::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0;
          width: 3px; border-radius: 0 3px 3px 0;
          background: #c9a84c; transform: scaleY(0);
          transition: transform 0.2s ease;
        }
        .nav-btn.active::before  { transform: scaleY(1); }
        .nav-btn.active {
          background: rgba(255,255,255,0.15) !important;
          border-color: rgba(255,255,255,0.12) !important;
          color: white !important; font-weight: 600;
        }
        .nav-btn:hover:not(.active) {
          background: rgba(255,255,255,0.07) !important;
          color: rgba(255,255,255,0.9) !important;
          transform: translateX(3px);
        }
        .hamburger {
          display: none;
          flex-direction: column; gap: 5px;
          cursor: pointer; padding: 8px;
          background: none; border: none;
          z-index: 300; position: fixed;
          top: 14px; left: 14px;
        }
        .hamburger span {
          display: block; width: 22px; height: 2px;
          background: var(--teal-dark);
          border-radius: 2px;
          transition: all 0.2s;
        }
        .hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }
        @media (max-width: 768px) {
          .hamburger { display: flex; }
        }
        .mobile-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 150;
          backdrop-filter: blur(2px);
        }
        .mobile-overlay.show { display: block; }
      `}</style>

      {/* Hamburger button (mobile only) */}
      <button
        className={`hamburger${mobileOpen ? " open" : ""}`}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      {/* Mobile overlay */}
      <div
        className={`mobile-overlay${mobileOpen ? " show" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`sidebar-inner${mobileOpen ? " mobile-open" : ""}`}
        style={{
          width: 240,
          background: "linear-gradient(180deg, #0d3d52 0%, #1a5f7a 100%)",
          position: "fixed", top: 0, left: 0, bottom: 0,
          display: "flex", flexDirection: "column", zIndex: 200,
          boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
          overflowY: "auto",
        }}
      >
        <div style={{ padding:"22px 20px 16px", borderBottom:"1px solid rgba(255,255,255,0.08)", flexShrink:0 }}>
          <div style={{ fontSize:21, fontWeight:800, color:"white", letterSpacing:2 }}>NIRMAXIS</div>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)", letterSpacing:2, marginTop:2 }}>
            {type === "admin" ? "ADMIN PANEL" : "PATIENT PORTAL"}
          </div>
        </div>

        <nav style={{ flex:1, padding:"14px 10px", display:"flex", flexDirection:"column", gap:3 }}>
          {nav.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`nav-btn${active ? " active" : ""}`}
                onClick={() => handleNav(item.path)}
                onMouseEnter={() => setHovered(item.path)}
                onMouseLeave={() => setHovered(null)}
                style={{ color: active ? "white" : "rgba(255,255,255,0.65)" }}
              >
                <span style={{
                  fontSize:17,
                  transition:"transform 0.2s",
                  transform: hovered===item.path ? "scale(1.15)" : "scale(1)",
                  display:"inline-block",
                }}>
                  {item.icon}
                </span>
                <span style={{ flex:1 }}>{item.label}</span>
                {active && <span style={{ width:7, height:7, borderRadius:"50%", background:"#c9a84c", flexShrink:0 }} />}
              </button>
            );
          })}
        </nav>

        <div style={{ padding:"14px 20px", borderTop:"1px solid rgba(255,255,255,0.06)", textAlign:"center", flexShrink:0 }}>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.2)", letterSpacing:1 }}>NEURO & ORTHO REHAB</div>
        </div>
      </aside>
    </>
  );
}