import { useState, useRef, useCallback } from "react";

// ─── Brand Colors & Design Tokens ────────────────────────────────────────────
const COLORS = {
  sidebar: "#1E1040",
  sidebarHover: "#2D1A5E",
  primary: "#7C3AED",
  primaryDark: "#5B21B6",
  accent: "#F59E0B",
  accentOrange: "#EA580C",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  textDark: "#111827",
  textMid: "#4B5563",
  textLight: "#9CA3AF",
  border: "#E5E7EB",
  bg: "#F9FAFB",
  white: "#FFFFFF",
  purple100: "#EDE9FE",
  purple200: "#DDD6FE",
  purple600: "#7C3AED",
  purple700: "#6D28D9",
};

// ─── Tiny CSS-in-JS helper ───────────────────────────────────────────────────
const css = (styles) => Object.entries(styles).map(([k,v])=>`${k.replace(/([A-Z])/g,'-$1').toLowerCase()}:${v}`).join(';');

// ─── Icons (inline SVG) ──────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor", style = {} }) => {
  const paths = {
    home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    dashboard: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
    requests: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    process: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    archive: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
    reports: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    suppliers: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    catalog: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    help: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    chevronDown: "M19 9l-7 7-7-7",
    chevronRight: "M9 5l7 7-7 7",
    menu: "M4 6h16M4 12h16M4 18h16",
    upload: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
    trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
    check: "M5 13l4 4L19 7",
    x: "M6 18L18 6M6 6l12 12",
    info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    send: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
    save: "M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4",
    eye: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    plus: "M12 4v16m8-8H4",
    filter: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
    approvals: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    history: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
    pdf: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
    image: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={paths[name] || paths.home} />
    </svg>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    "Pendiente": { bg: "#FEF3C7", color: "#D97706", dot: "#F59E0B" },
    "En revisión": { bg: "#DBEAFE", color: "#1D4ED8", dot: "#3B82F6" },
    "Aprobado": { bg: "#D1FAE5", color: "#065F46", dot: "#10B981" },
    "Rechazado": { bg: "#FEE2E2", color: "#991B1B", dot: "#EF4444" },
    "Borrador": { bg: "#F3F4F6", color: "#4B5563", dot: "#9CA3AF" },
  }[status] || { bg: "#F3F4F6", color: "#4B5563", dot: "#9CA3AF" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, background:cfg.bg, color:cfg.color, fontSize:12, fontWeight:600 }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot, flexShrink:0 }} />
      {status}
    </span>
  );
};

// ─── Toast Notification ───────────────────────────────────────────────────────
const Toast = ({ toasts, removeToast }) => (
  <div style={{ position:"fixed", top:20, right:20, zIndex:9999, display:"flex", flexDirection:"column", gap:10 }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        display:"flex", alignItems:"center", gap:12, padding:"14px 18px",
        background: t.type === "success" ? "#ECFDF5" : t.type === "error" ? "#FEF2F2" : "#EFF6FF",
        border: `1px solid ${t.type === "success" ? "#A7F3D0" : t.type === "error" ? "#FECACA" : "#BFDBFE"}`,
        borderRadius:12, boxShadow:"0 10px 25px rgba(0,0,0,.12)", minWidth:300,
        animation:"slideIn .3s ease", color: t.type === "success" ? "#065F46" : t.type === "error" ? "#991B1B" : "#1E40AF",
        fontSize:14, fontWeight:500
      }}>
        <Icon name={t.type === "success" ? "check" : t.type === "error" ? "x" : "info"} size={16} color={t.type === "success" ? "#10B981" : t.type === "error" ? "#EF4444" : "#3B82F6"} />
        {t.message}
        <button onClick={() => removeToast(t.id)} style={{ marginLeft:"auto", background:"none", border:"none", cursor:"pointer", opacity:.6, lineHeight:1 }}>✕</button>
      </div>
    ))}
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, actions }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.45)", backdropFilter:"blur(3px)" }} />
      <div style={{ position:"relative", background:"#fff", borderRadius:16, boxShadow:"0 25px 60px rgba(0,0,0,.2)", width:"100%", maxWidth:540, padding:28, zIndex:1 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:COLORS.textDark }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", padding:4, borderRadius:8, color:COLORS.textLight }}>
            <Icon name="x" size={20} />
          </button>
        </div>
        <div style={{ marginBottom:24 }}>{children}</div>
        {actions && <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>{actions}</div>}
      </div>
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ currentPage, setPage, collapsed, setCollapsed }) => {
  const [openGroups, setOpenGroups] = useState({ solicitudes: true, procesos: false });
  const toggleGroup = g => setOpenGroups(p => ({ ...p, [g]: !p[g] }));

  const navItems = [
    { id:"inicio", label:"Inicio", icon:"home" },
    { id:"dashboard", label:"Dashboard", icon:"dashboard" },
    {
      id:"solicitudes", label:"Solicitudes", icon:"requests", group:true,
      children:[
        { id:"solicitud-pago", label:"Solicitud de pago" },
        { id:"solicitud-anticipo", label:"Solicitud de anticipo" },
        { id:"viaticos", label:"Viáticos y gastos" },
      ]
    },
    {
      id:"procesos", label:"Procesos", icon:"process", group:true,
      children:[
        { id:"mis-procesos", label:"Mis procesos" },
        { id:"aprobaciones", label:"Aprobaciones" },
        { id:"historial", label:"Historial" },
      ]
    },
    { id:"archivo-digital", label:"Archivo digital", icon:"archive" },
    { id:"reportes", label:"Reportes", icon:"reports" },
    { id:"proveedores", label:"Proveedores", icon:"suppliers" },
    { id:"catalogos", label:"Catálogos", icon:"catalog" },
    { id:"ajustes", label:"Ajustes", icon:"settings" },
    { id:"ayuda", label:"Ayuda y soporte", icon:"help" },
  ];

  return (
    <aside style={{
      width: collapsed ? 64 : 220, flexShrink:0, background:COLORS.sidebar,
      display:"flex", flexDirection:"column", height:"100vh",
      position:"sticky", top:0, transition:"width .25s cubic-bezier(.4,0,.2,1)", overflow:"hidden",
      boxShadow:"4px 0 24px rgba(0,0,0,.18)"
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? "24px 16px" : "24px 20px", borderBottom:"1px solid rgba(255,255,255,.08)", flexShrink:0 }}>
        {!collapsed ? (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:"linear-gradient(135deg,#7C3AED,#EA580C)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:16, fontWeight:900, color:"#fff", letterSpacing:-1 }}>
              ofi
            </div>
            <div>
              <div style={{ color:"#fff", fontWeight:800, fontSize:16, lineHeight:1.1 }}>OFI</div>
              <div style={{ color:"rgba(255,255,255,.45)", fontSize:10, fontWeight:500 }}>make it real</div>
            </div>
          </div>
        ) : (
          <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#7C3AED,#EA580C)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#fff" }}>ofi</div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex:1, overflowY:"auto", overflowX:"hidden", padding:"12px 0" }}>
        {navItems.map(item => {
          if (item.group) {
            const isOpen = openGroups[item.id];
            const isActive = item.children?.some(c => c.id === currentPage);
            return (
              <div key={item.id}>
                <button onClick={() => toggleGroup(item.id)} style={{
                  width:"100%", display:"flex", alignItems:"center", gap:10,
                  padding: collapsed ? "10px 20px" : "10px 16px", background:"none", border:"none",
                  color: isActive ? "#fff" : "rgba(255,255,255,.6)",
                  cursor:"pointer", textAlign:"left", borderRadius:0,
                  transition:"all .15s",
                }}>
                  <Icon name={item.icon} size={18} color={isActive ? "#fff" : "rgba(255,255,255,.55)"} />
                  {!collapsed && (
                    <>
                      <span style={{ flex:1, fontSize:13, fontWeight:600 }}>{item.label}</span>
                      <Icon name="chevronDown" size={14} color="rgba(255,255,255,.4)" style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)", transition:"transform .2s" }} />
                    </>
                  )}
                </button>
                {!collapsed && isOpen && item.children?.map(child => (
                  <button key={child.id} onClick={() => setPage(child.id)} style={{
                    width:"100%", display:"flex", alignItems:"center", padding:"9px 16px 9px 46px",
                    background: currentPage === child.id ? "linear-gradient(90deg,rgba(124,58,237,.5),rgba(124,58,237,.1))" : "none",
                    border:"none", borderLeft: currentPage === child.id ? "3px solid #F59E0B" : "3px solid transparent",
                    color: currentPage === child.id ? "#fff" : "rgba(255,255,255,.55)",
                    cursor:"pointer", textAlign:"left", fontSize:12.5, fontWeight: currentPage === child.id ? 700 : 500,
                    transition:"all .15s",
                  }}>
                    {child.label}
                  </button>
                ))}
              </div>
            );
          }
          const isActive = currentPage === item.id;
          return (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              width:"100%", display:"flex", alignItems:"center", gap:10,
              padding: collapsed ? "10px 20px" : "10px 16px",
              background: isActive ? "linear-gradient(90deg,rgba(124,58,237,.5),rgba(124,58,237,.1))" : "none",
              border:"none", borderLeft: isActive ? "3px solid #F59E0B" : "3px solid transparent",
              color: isActive ? "#fff" : "rgba(255,255,255,.6)",
              cursor:"pointer", textAlign:"left",
              transition:"all .15s",
            }}>
              <Icon name={item.icon} size={18} color={isActive ? "#fff" : "rgba(255,255,255,.55)"} />
              {!collapsed && <span style={{ fontSize:13, fontWeight: isActive ? 700 : 500 }}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding:"16px 12px", borderTop:"1px solid rgba(255,255,255,.08)", flexShrink:0 }}>
        {!collapsed && (
          <div style={{ color:"rgba(255,255,255,.3)", fontSize:10, textAlign:"center", lineHeight:1.6 }}>
            © 2024 OFI (Olam Food Ingredients)<br/>Todos los derechos reservados
          </div>
        )}
      </div>
    </aside>
  );
};

// ─── Top Nav ──────────────────────────────────────────────────────────────────
const TopNav = ({ collapsed, setCollapsed, notifCount, setPage }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const notifications = [
    { id:1, text:"Solicitud VIA-2024-089 aprobada", time:"hace 5 min", type:"success", read:false },
    { id:2, text:"Nueva solicitud pendiente de revisión", time:"hace 1 hora", type:"info", read:false },
    { id:3, text:"Recordatorio: 3 solicitudes vencen hoy", time:"hace 2 horas", type:"warning", read:false },
    { id:4, text:"Factura_Hotel rechazada por formato", time:"ayer", type:"error", read:true },
    { id:5, text:"Proceso VIA-2024-085 completado", time:"ayer", type:"success", read:true },
  ];

  return (
    <header style={{
      height:60, background:"#fff", borderBottom:`1px solid ${COLORS.border}`,
      display:"flex", alignItems:"center", padding:"0 24px", gap:16,
      position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 8px rgba(0,0,0,.06)"
    }}>
      <button onClick={() => setCollapsed(!collapsed)} style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.textMid, padding:6, borderRadius:8, display:"flex" }}>
        <Icon name="menu" size={20} />
      </button>

      {/* Search */}
      <div style={{ flex:1, maxWidth:420, position:"relative" }}>
        <Icon name="search" size={16} color={COLORS.textLight} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }} />
        <input placeholder="Buscar en el sistema..." style={{
          width:"100%", padding:"8px 14px 8px 38px", border:`1.5px solid ${COLORS.border}`,
          borderRadius:10, fontSize:13.5, color:COLORS.textDark, background:"#F9FAFB",
          outline:"none", boxSizing:"border-box",
          transition:"border-color .15s",
        }} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border} />
      </div>

      <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
        {/* Notifications */}
        <div style={{ position:"relative" }}>
          <button onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); }} style={{
            position:"relative", background:"none", border:"none", cursor:"pointer",
            padding:8, borderRadius:10, color:COLORS.textMid, display:"flex",
            transition:"background .15s",
          }} onMouseEnter={e => e.currentTarget.style.background="#F3F4F6"} onMouseLeave={e => e.currentTarget.style.background="none"}>
            <Icon name="bell" size={20} />
            {notifCount > 0 && (
              <span style={{
                position:"absolute", top:4, right:4, width:18, height:18,
                background:"#EF4444", borderRadius:"50%", fontSize:10, fontWeight:700,
                color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
                border:"2px solid #fff"
              }}>{notifCount}</span>
            )}
          </button>
          {notifOpen && (
            <div style={{
              position:"absolute", right:0, top:"calc(100% + 8px)", width:360,
              background:"#fff", borderRadius:14, boxShadow:"0 20px 50px rgba(0,0,0,.16)",
              border:`1px solid ${COLORS.border}`, zIndex:200, overflow:"hidden"
            }}>
              <div style={{ padding:"14px 18px", borderBottom:`1px solid ${COLORS.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontWeight:700, fontSize:14, color:COLORS.textDark }}>Notificaciones</span>
                <span style={{ fontSize:12, color:COLORS.primary, cursor:"pointer", fontWeight:600 }}>Marcar todo leído</span>
              </div>
              {notifications.map(n => (
                <div key={n.id} style={{
                  padding:"12px 18px", display:"flex", alignItems:"flex-start", gap:12,
                  background: n.read ? "#fff" : "#FAFAF9",
                  borderBottom:`1px solid ${COLORS.border}`, cursor:"pointer",
                  transition:"background .15s",
                }} onMouseEnter={e => e.currentTarget.style.background="#F9FAFB"} onMouseLeave={e => e.currentTarget.style.background = n.read ? "#fff" : "#FAFAF9"}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background: n.read ? "transparent" : COLORS.primary, marginTop:5, flexShrink:0 }} />
                  <div>
                    <div style={{ fontSize:13, color:COLORS.textDark, fontWeight: n.read ? 400 : 600 }}>{n.text}</div>
                    <div style={{ fontSize:11, color:COLORS.textLight, marginTop:2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding:"10px 18px", textAlign:"center" }}>
                <button onClick={() => { setNotifOpen(false); setPage("historial"); }} style={{ color:COLORS.primary, background:"none", border:"none", cursor:"pointer", fontSize:13, fontWeight:600 }}>Ver todo el historial</button>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div style={{ position:"relative" }}>
          <button onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }} style={{
            display:"flex", alignItems:"center", gap:10, background:"none", border:"none",
            cursor:"pointer", padding:"6px 10px", borderRadius:10,
            transition:"background .15s",
          }} onMouseEnter={e => e.currentTarget.style.background="#F3F4F6"} onMouseLeave={e => e.currentTarget.style.background="none"}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#7C3AED,#EA580C)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:700 }}>O</div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:13, fontWeight:700, color:COLORS.textDark, lineHeight:1.2 }}>Osmar</div>
              <div style={{ fontSize:11, color:COLORS.textLight }}>Contador</div>
            </div>
            <Icon name="chevronDown" size={14} color={COLORS.textLight} />
          </button>
          {userOpen && (
            <div style={{
              position:"absolute", right:0, top:"calc(100% + 8px)", width:200,
              background:"#fff", borderRadius:12, boxShadow:"0 16px 40px rgba(0,0,0,.14)",
              border:`1px solid ${COLORS.border}`, zIndex:200, overflow:"hidden"
            }}>
              {[
                { icon:"user", label:"Mi perfil" },
                { icon:"settings", label:"Configuración" },
                { icon:"logout", label:"Cerrar sesión", danger:true },
              ].map(item => (
                <button key={item.label} style={{
                  width:"100%", display:"flex", alignItems:"center", gap:10, padding:"11px 16px",
                  background:"none", border:"none", cursor:"pointer", textAlign:"left",
                  color: item.danger ? "#EF4444" : COLORS.textDark, fontSize:13,
                  transition:"background .15s", borderBottom: item.label !== "Cerrar sesión" ? `1px solid ${COLORS.border}` : "none",
                }} onMouseEnter={e => e.currentTarget.style.background="#F9FAFB"} onMouseLeave={e => e.currentTarget.style.background="none"}>
                  <Icon name={item.icon} size={15} color={item.danger ? "#EF4444" : COLORS.textMid} />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
const Breadcrumb = ({ items, setPage }) => (
  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:20 }}>
    {items.map((item, i) => (
      <span key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
        {i > 0 && <Icon name="chevronRight" size={12} color={COLORS.textLight} />}
        <span onClick={() => item.page && setPage(item.page)} style={{
          fontSize:13, color: i === items.length-1 ? COLORS.textMid : COLORS.primary,
          cursor: item.page ? "pointer" : "default", fontWeight: i === items.length-1 ? 500 : 600,
          textDecoration: item.page ? "none" : "none",
        }} onMouseEnter={e => { if(item.page) e.target.style.textDecoration="underline"; }}
           onMouseLeave={e => { e.target.style.textDecoration="none"; }}>
          {item.label}
        </span>
      </span>
    ))}
  </div>
);

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ currentStep }) => {
  const steps = ["Información", "Revisión", "Confirmación"];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0 }}>
      {steps.map((label, i) => {
        const num = i + 1;
        const active = num === currentStep;
        const done = num < currentStep;
        return (
          <div key={i} style={{ display:"flex", alignItems:"center" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
              <div style={{
                width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                background: active ? COLORS.primary : done ? COLORS.success : "#E5E7EB",
                color: active || done ? "#fff" : COLORS.textLight,
                fontSize:14, fontWeight:700, transition:"all .3s",
                boxShadow: active ? `0 0 0 4px ${COLORS.purple100}` : "none"
              }}>
                {done ? <Icon name="check" size={16} color="#fff" /> : num}
              </div>
              <span style={{ fontSize:11.5, fontWeight: active ? 700 : 500, color: active ? COLORS.primary : COLORS.textLight, whiteSpace:"nowrap" }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width:80, height:2, background: done ? COLORS.success : "#E5E7EB", margin:"0 4px", marginBottom:20, transition:"background .3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── File Upload Zone ─────────────────────────────────────────────────────────
const FileUploadZone = ({ files, setFiles }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = useCallback(e => {
    e.preventDefault(); setDragging(false);
    const newFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...newFiles.map(f => ({ name:f.name, size:f.size, type:f.type, file:f }))]);
  }, [setFiles]);

  const handleSelect = e => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles.map(f => ({ name:f.name, size:f.size, type:f.type, file:f }))]);
  };

  const removeFile = idx => setFiles(prev => prev.filter((_,i) => i !== idx));

  const formatSize = bytes => bytes < 1024*1024 ? `${(bytes/1024).toFixed(0)} KB` : `${(bytes/1024/1024).toFixed(1)} MB`;

  const getIcon = (name) => name.toLowerCase().endsWith(".pdf") ? "pdf" : "image";

  const preloaded = [
    { name:"Factura_Hotel_20524.pdf", size:1258291, type:"application/pdf" },
    { name:"Factura_Alimentos_20524.jpg", size:1011000, type:"image/jpeg" },
    { name:"Factura_Taxi_20524.jpg", size:669696, type:"image/jpeg" },
    { name:"Factura_Estacionamiento_20524.pdf", size:749568, type:"application/pdf" },
  ];

  const allFiles = [...preloaded, ...files];

  return (
    <div>
      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        style={{
          border:`2px dashed ${dragging ? COLORS.primary : "#C4B5FD"}`,
          borderRadius:12, padding:"28px 20px", textAlign:"center", cursor:"pointer",
          background: dragging ? COLORS.purple100 : "#FDFAFF",
          transition:"all .2s",
        }}
      >
        <Icon name="upload" size={32} color={COLORS.primary} style={{ display:"block", margin:"0 auto 10px" }} />
        <div style={{ color:COLORS.primary, fontWeight:600, fontSize:13.5, lineHeight:1.6 }}>
          Arrastra y suelta tus archivos aquí<br/>
          <span style={{ fontWeight:400, color:COLORS.textLight }}>o</span>
        </div>
        <button style={{
          marginTop:10, padding:"7px 18px", background:"#fff", border:`1.5px solid ${COLORS.primary}`,
          borderRadius:8, color:COLORS.primary, fontWeight:600, fontSize:13, cursor:"pointer",
          transition:"all .15s",
        }} onMouseEnter={e => { e.currentTarget.style.background=COLORS.purple100; }} onMouseLeave={e => { e.currentTarget.style.background="#fff"; }}>
          Seleccionar archivos
        </button>
        <div style={{ marginTop:10, color:COLORS.textLight, fontSize:11 }}>
          Formatos permitidos: JPG, PNG, PDF · Tamaño máximo: 5 MB
        </div>
        <input ref={inputRef} type="file" multiple accept=".jpg,.jpeg,.png,.pdf" style={{ display:"none" }} onChange={handleSelect} />
      </div>

      {/* File List */}
      {allFiles.length > 0 && (
        <div style={{ marginTop:16 }}>
          <div style={{ fontWeight:700, fontSize:13, color:COLORS.textDark, marginBottom:10 }}>
            Archivos adjuntos ({allFiles.length})
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {allFiles.map((f, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                background:"#F9FAFB", border:`1px solid ${COLORS.border}`, borderRadius:10,
              }}>
                <div style={{ width:36, height:36, borderRadius:8, background: f.type?.includes("pdf") ? "#FEE2E2" : "#DBEAFE", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon name={getIcon(f.name)} size={18} color={f.type?.includes("pdf") ? "#DC2626" : "#2563EB"} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12.5, fontWeight:600, color:COLORS.textDark, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name}</div>
                  <div style={{ fontSize:11, color:COLORS.textLight }}>{formatSize(f.size)}</div>
                </div>
                {i >= preloaded.length && (
                  <button onClick={() => removeFile(i - preloaded.length)} style={{ background:"none", border:"none", cursor:"pointer", color:"#EF4444", padding:4 }}>
                    <Icon name="trash" size={16} color="#EF4444" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop:10, padding:"10px 14px", background:"#ECFDF5", border:"1px solid #A7F3D0", borderRadius:8, display:"flex", alignItems:"center", gap:8 }}>
            <Icon name="check" size={16} color="#10B981" />
            <span style={{ fontSize:12.5, fontWeight:600, color:"#065F46" }}>{allFiles.length} archivos listos para enviar</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Page: Viaticos Form ──────────────────────────────────────────────────────
const ViaticosPage = ({ addToast }) => {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [recibioCAnticipo, setRecibioCAnticipo] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState({
    destino:"Monterrey, Nuevo León",
    fechaInicio:"2024-05-20",
    fechaFin:"2024-05-23",
    proposito:"Visita a cliente",
    proyecto:"CC-2100 - Ventas Industriales",
    motivo:"Visita a cliente para negociación de contrato anual de suministro.\nReuniones con el equipo de compras y operaciones para presentación de propuesta y definición de entregas.",
    monto:"5000.00",
    fechaRecepcion:"2024-05-17",
    folio:"ANT-2024-0456",
  });
  const setF = (k,v) => setForm(p => ({...p,[k]:v}));

  const calcDays = () => {
    if (!form.fechaInicio || !form.fechaFin) return 0;
    const diff = new Date(form.fechaFin) - new Date(form.fechaInicio);
    return Math.max(0, Math.round(diff/(1000*60*60*24)) + 1);
  };

  const inputStyle = {
    width:"100%", padding:"9px 12px", border:`1.5px solid ${COLORS.border}`,
    borderRadius:8, fontSize:13.5, color:COLORS.textDark, background:"#fff",
    outline:"none", boxSizing:"border-box", transition:"border-color .15s",
  };
  const labelStyle = { fontSize:12.5, fontWeight:600, color:COLORS.textMid, display:"block", marginBottom:5 };
  const sectionStyle = { background:"#fff", borderRadius:14, padding:24, border:`1px solid ${COLORS.border}`, marginBottom:20, boxShadow:"0 1px 4px rgba(0,0,0,.04)" };

  const handleSubmit = () => {
    setConfirmOpen(false);
    addToast({ type:"success", message:"Solicitud enviada a aprobación exitosamente" });
    setTimeout(() => addToast({ type:"info", message:"El aprobador recibirá una notificación" }), 1200);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:28 }}>
        <div>
          <h1 style={{ margin:"0 0 4px", fontSize:22, fontWeight:800, color:COLORS.textDark }}>
            Solicitud de aprobación de legalización de viáticos
          </h1>
          <p style={{ margin:0, fontSize:13.5, color:COLORS.textLight }}>
            Completa la información de tu viaje y adjunta los comprobantes fiscales correspondientes.
          </p>
        </div>
        <div style={{ flexShrink:0 }}>
          <StepIndicator currentStep={step} />
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:24 }}>
        {/* Left Column */}
        <div>
          {/* Section 1 */}
          <div style={sectionStyle}>
            <h3 style={{ margin:"0 0 18px", fontSize:14, fontWeight:700, color:COLORS.primary }}>1. Información del viaje</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:16 }}>
              <div>
                <label style={labelStyle}>Destino <span style={{color:"#EF4444"}}>*</span></label>
                <div style={{ position:"relative" }}>
                  <select value={form.destino} onChange={e=>setF("destino",e.target.value)} style={{...inputStyle, paddingRight:32, appearance:"none"}}>
                    {["Monterrey, Nuevo León","Ciudad de México","Guadalajara, Jalisco","Tijuana, BC","Cancún, Q. Roo"].map(d=><option key={d}>{d}</option>)}
                  </select>
                  <Icon name="chevronDown" size={14} color={COLORS.textLight} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Fecha de inicio <span style={{color:"#EF4444"}}>*</span></label>
                <div style={{ position:"relative" }}>
                  <input type="date" value={form.fechaInicio} onChange={e=>setF("fechaInicio",e.target.value)} style={{...inputStyle, paddingRight:36}} onFocus={e=>e.target.style.borderColor=COLORS.primary} onBlur={e=>e.target.style.borderColor=COLORS.border} />
                  <Icon name="calendar" size={15} color={COLORS.textLight} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Fecha de fin <span style={{color:"#EF4444"}}>*</span></label>
                <div style={{ position:"relative" }}>
                  <input type="date" value={form.fechaFin} onChange={e=>setF("fechaFin",e.target.value)} style={{...inputStyle, paddingRight:36}} onFocus={e=>e.target.style.borderColor=COLORS.primary} onBlur={e=>e.target.style.borderColor=COLORS.border} />
                  <Icon name="calendar" size={15} color={COLORS.textLight} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}} />
                </div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div>
                <label style={labelStyle}>Propósito del viaje <span style={{color:"#EF4444"}}>*</span></label>
                <div style={{ position:"relative" }}>
                  <select value={form.proposito} onChange={e=>setF("proposito",e.target.value)} style={{...inputStyle, paddingRight:32, appearance:"none"}}>
                    {["Visita a cliente","Capacitación","Conferencia","Auditoría interna","Reunión corporativa"].map(p=><option key={p}>{p}</option>)}
                  </select>
                  <Icon name="chevronDown" size={14} color={COLORS.textLight} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Proyecto / Centro de costo</label>
                <div style={{ position:"relative" }}>
                  <select value={form.proyecto} onChange={e=>setF("proyecto",e.target.value)} style={{...inputStyle, paddingRight:32, appearance:"none"}}>
                    {["CC-2100 - Ventas Industriales","CC-3200 - Operaciones","CC-1100 - Administración","CC-4500 - Logística"].map(p=><option key={p}>{p}</option>)}
                  </select>
                  <Icon name="chevronDown" size={14} color={COLORS.textLight} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div style={sectionStyle}>
            <h3 style={{ margin:"0 0 6px", fontSize:14, fontWeight:700, color:COLORS.primary }}>2. Motivo o razón del viaje</h3>
            <p style={{ margin:"0 0 14px", fontSize:12.5, color:COLORS.textLight }}>Describe el objetivo del viaje y las actividades realizadas.</p>
            <textarea value={form.motivo} onChange={e=>setF("motivo",e.target.value)} rows={5} maxLength={1000} style={{
              ...inputStyle, resize:"vertical", lineHeight:1.6, fontFamily:"inherit",
            }} onFocus={e=>e.target.style.borderColor=COLORS.primary} onBlur={e=>e.target.style.borderColor=COLORS.border} />
            <div style={{ textAlign:"right", fontSize:11.5, color:COLORS.textLight, marginTop:4 }}>{form.motivo.length}/1000</div>
          </div>

          {/* Section 3 */}
          <div style={sectionStyle}>
            <h3 style={{ margin:"0 0 16px", fontSize:14, fontWeight:700, color:COLORS.primary }}>3. ¿Se recibió anticipo para este viaje?</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
              {[
                { val:true, label:"Sí, se recibió anticipo", sub:"Completa la información del anticipo recibido." },
                { val:false, label:"No, no se recibió anticipo", sub:"No se recibió ningún anticipo para este viaje." },
              ].map(opt => (
                <label key={String(opt.val)} style={{
                  display:"flex", alignItems:"flex-start", gap:12, padding:16,
                  border:`2px solid ${recibioCAnticipo === opt.val ? COLORS.primary : COLORS.border}`,
                  borderRadius:10, cursor:"pointer",
                  background: recibioCAnticipo === opt.val ? COLORS.purple100 : "#fff",
                  transition:"all .2s",
                }}>
                  <input type="radio" checked={recibioCAnticipo === opt.val} onChange={() => setRecibioCAnticipo(opt.val)} style={{ marginTop:2, accentColor:COLORS.primary }} />
                  <div>
                    <div style={{ fontWeight:600, fontSize:13, color:COLORS.textDark }}>{opt.label}</div>
                    <div style={{ fontSize:12, color:COLORS.textLight, marginTop:2 }}>{opt.sub}</div>
                  </div>
                </label>
              ))}
            </div>

            {recibioCAnticipo && (
              <div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                  <div>
                    <label style={labelStyle}>Monto del anticipo recibido</label>
                    <input value={`MXN ${form.monto}`} onChange={e=>setF("monto",e.target.value.replace("MXN ",""))} style={inputStyle} onFocus={e=>e.target.style.borderColor=COLORS.primary} onBlur={e=>e.target.style.borderColor=COLORS.border} />
                  </div>
                  <div>
                    <label style={labelStyle}>Fecha de recepción</label>
                    <div style={{ position:"relative" }}>
                      <input type="date" value={form.fechaRecepcion} onChange={e=>setF("fechaRecepcion",e.target.value)} style={{...inputStyle, paddingRight:36}} onFocus={e=>e.target.style.borderColor=COLORS.primary} onBlur={e=>e.target.style.borderColor=COLORS.border} />
                      <Icon name="calendar" size={15} color={COLORS.textLight} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Folio / Comprobante</label>
                    <input value={form.folio} onChange={e=>setF("folio",e.target.value)} style={inputStyle} onFocus={e=>e.target.style.borderColor=COLORS.primary} onBlur={e=>e.target.style.borderColor=COLORS.border} />
                  </div>
                </div>
                <div style={{ marginTop:14, padding:"12px 16px", background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:8, display:"flex", alignItems:"center", gap:10 }}>
                  <Icon name="info" size={16} color="#3B82F6" />
                  <span style={{ fontSize:12.5, color:"#1E40AF" }}>Deberás comprobar el total del anticipo recibido más los gastos adicionales generados durante el viaje.</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display:"flex", justifyContent:"flex-end", gap:12, paddingTop:4 }}>
            <button style={{
              padding:"11px 24px", background:"#fff", border:`1.5px solid ${COLORS.border}`,
              borderRadius:10, fontSize:13.5, fontWeight:600, color:COLORS.textMid, cursor:"pointer",
              transition:"all .15s",
            }} onMouseEnter={e=>{e.currentTarget.style.borderColor=COLORS.textMid;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=COLORS.border;}}>
              <span style={{display:"flex",alignItems:"center",gap:8}}>
                <Icon name="save" size={16} />
                Guardar borrador
              </span>
            </button>
            <button onClick={() => setConfirmOpen(true)} style={{
              padding:"11px 24px", background:`linear-gradient(135deg,${COLORS.primary},${COLORS.primaryDark})`,
              border:"none", borderRadius:10, fontSize:13.5, fontWeight:700, color:"#fff", cursor:"pointer",
              boxShadow:"0 4px 14px rgba(124,58,237,.4)", transition:"all .15s",
              display:"flex", alignItems:"center", gap:8,
            }} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 18px rgba(124,58,237,.5)";}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 14px rgba(124,58,237,.4)";}}>
              <Icon name="send" size={16} />
              Enviar a aprobación
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {/* File Upload */}
          <div style={sectionStyle}>
            <h3 style={{ margin:"0 0 6px", fontSize:14, fontWeight:700, color:COLORS.primary }}>4. Comprobantes fiscales</h3>
            <p style={{ margin:"0 0 14px", fontSize:12, color:COLORS.textLight }}>Adjunta las fotos o archivos de las facturas y comprobantes correspondientes.</p>
            <FileUploadZone files={files} setFiles={setFiles} />
          </div>

          {/* Summary */}
          <div style={sectionStyle}>
            <h3 style={{ margin:"0 0 14px", fontSize:14, fontWeight:700, color:COLORS.primary }}>Resumen del viaje</h3>
            {[
              { label:"Destino", value:form.destino },
              { label:"Fechas", value:`${form.fechaInicio.split("-").reverse().join("/")} - ${form.fechaFin.split("-").reverse().join("/")}` },
              { label:"Días de viaje", value:`${calcDays()} días` },
              { label:"Anticipo recibido", value:recibioCAnticipo ? `MXN ${parseFloat(form.monto||0).toLocaleString("es-MX",{minimumFractionDigits:2})}` : "No aplica" },
              { label:"Gastos por comprobar", value:"—" },
            ].map(row => (
              <div key={row.label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${COLORS.border}`, fontSize:13 }}>
                <span style={{ color:COLORS.textLight }}>{row.label}</span>
                <span style={{ fontWeight:600, color:COLORS.textDark }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="¿Enviar solicitud a aprobación?"
        actions={[
          <button key="cancel" onClick={() => setConfirmOpen(false)} style={{ padding:"9px 20px", background:"none", border:`1.5px solid ${COLORS.border}`, borderRadius:8, fontSize:13.5, cursor:"pointer", fontWeight:600, color:COLORS.textMid }}>Cancelar</button>,
          <button key="confirm" onClick={handleSubmit} style={{ padding:"9px 20px", background:`linear-gradient(135deg,${COLORS.primary},${COLORS.primaryDark})`, border:"none", borderRadius:8, fontSize:13.5, fontWeight:700, color:"#fff", cursor:"pointer" }}>Confirmar envío</button>,
        ]}>
        <p style={{ margin:0, fontSize:14, color:COLORS.textMid, lineHeight:1.6 }}>
          La solicitud será enviada al aprobador asignado. Una vez enviada, no podrás editarla hasta que sea revisada.
        </p>
        <div style={{ marginTop:16, padding:"12px 14px", background:"#F9FAFB", borderRadius:8, fontSize:13 }}>
          <div style={{ fontWeight:600, color:COLORS.textDark, marginBottom:6 }}>Resumen</div>
          <div style={{ color:COLORS.textMid }}>Destino: <strong>{form.destino}</strong></div>
          <div style={{ color:COLORS.textMid }}>Anticipo: <strong>MXN {parseFloat(form.monto||0).toLocaleString("es-MX",{minimumFractionDigits:2})}</strong></div>
          <div style={{ color:COLORS.textMid }}>Archivos adjuntos: <strong>4</strong></div>
        </div>
      </Modal>
    </div>
  );
};

// ─── Page: Dashboard ──────────────────────────────────────────────────────────
const DashboardPage = ({ setPage }) => {
  const cards = [
    { label:"Solicitudes activas", value:12, delta:"+3 este mes", color:COLORS.primary, bg:COLORS.purple100, icon:"requests" },
    { label:"Pendientes de aprobación", value:5, delta:"2 urgentes", color:"#D97706", bg:"#FEF3C7", icon:"approvals" },
    { label:"Aprobadas este mes", value:28, delta:"+8% vs anterior", color:"#065F46", bg:"#D1FAE5", icon:"check" },
    { label:"Rechazadas este mes", value:3, delta:"-2 vs anterior", color:"#991B1B", bg:"#FEE2E2", icon:"x" },
  ];
  const recentRequests = [
    { id:"VIA-2024-089", type:"Viáticos y gastos", dest:"Monterrey, NL", date:"20/05/2024", amount:"MXN 5,000", status:"En revisión" },
    { id:"PAG-2024-041", type:"Solicitud de pago", dest:"—", date:"18/05/2024", amount:"MXN 12,500", status:"Aprobado" },
    { id:"ANT-2024-033", type:"Solicitud de anticipo", dest:"Guadalajara, JAL", date:"15/05/2024", amount:"MXN 3,200", status:"Aprobado" },
    { id:"VIA-2024-082", type:"Viáticos y gastos", dest:"Ciudad de México", date:"10/05/2024", amount:"MXN 8,750", status:"Rechazado" },
    { id:"PAG-2024-038", type:"Solicitud de pago", dest:"—", date:"08/05/2024", amount:"MXN 45,000", status:"Pendiente" },
  ];

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ margin:"0 0 4px", fontSize:22, fontWeight:800, color:COLORS.textDark }}>Dashboard</h1>
        <p style={{ margin:0, fontSize:13.5, color:COLORS.textLight }}>Resumen general de tus solicitudes y actividad reciente.</p>
      </div>

      {/* Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18, marginBottom:28 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background:"#fff", borderRadius:14, padding:22, border:`1px solid ${COLORS.border}`, boxShadow:"0 1px 4px rgba(0,0,0,.04)", cursor:"pointer", transition:"transform .15s, box-shadow .15s" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 20px rgba(0,0,0,.1)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,.04)";}}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <span style={{ fontSize:12.5, fontWeight:600, color:COLORS.textMid }}>{c.label}</span>
              <div style={{ width:36, height:36, borderRadius:10, background:c.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon name={c.icon} size={18} color={c.color} />
              </div>
            </div>
            <div style={{ fontSize:30, fontWeight:800, color:COLORS.textDark, lineHeight:1 }}>{c.value}</div>
            <div style={{ fontSize:12, color:c.color, marginTop:6, fontWeight:600 }}>{c.delta}</div>
          </div>
        ))}
      </div>

      {/* Recent Requests */}
      <div style={{ background:"#fff", borderRadius:14, border:`1px solid ${COLORS.border}`, boxShadow:"0 1px 4px rgba(0,0,0,.04)", overflow:"hidden" }}>
        <div style={{ padding:"18px 22px", borderBottom:`1px solid ${COLORS.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <h2 style={{ margin:0, fontSize:15, fontWeight:700, color:COLORS.textDark }}>Solicitudes recientes</h2>
          <button onClick={() => setPage("viaticos")} style={{ padding:"7px 14px", background:COLORS.purple100, border:"none", borderRadius:8, color:COLORS.primary, fontSize:12.5, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <Icon name="plus" size={14} /> Nueva solicitud
          </button>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#F9FAFB" }}>
              {["ID","Tipo","Destino","Fecha","Monto","Estado",""].map(h => (
                <th key={h} style={{ padding:"11px 18px", textAlign:"left", fontSize:11.5, fontWeight:700, color:COLORS.textLight, borderBottom:`1px solid ${COLORS.border}`, letterSpacing:.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentRequests.map((r, i) => (
              <tr key={r.id} style={{ borderBottom:`1px solid ${COLORS.border}`, transition:"background .12s" }}
                onMouseEnter={e=>e.currentTarget.style.background="#F9FAFB"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                <td style={{ padding:"13px 18px", fontSize:13, fontWeight:700, color:COLORS.primary }}>{r.id}</td>
                <td style={{ padding:"13px 18px", fontSize:13, color:COLORS.textDark }}>{r.type}</td>
                <td style={{ padding:"13px 18px", fontSize:13, color:COLORS.textMid }}>{r.dest}</td>
                <td style={{ padding:"13px 18px", fontSize:13, color:COLORS.textMid }}>{r.date}</td>
                <td style={{ padding:"13px 18px", fontSize:13, fontWeight:600, color:COLORS.textDark }}>{r.amount}</td>
                <td style={{ padding:"13px 18px" }}><StatusBadge status={r.status} /></td>
                <td style={{ padding:"13px 18px" }}>
                  <button style={{ background:"none", border:"none", cursor:"pointer", color:COLORS.primary, padding:4 }}>
                    <Icon name="eye" size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Page: Approvals ──────────────────────────────────────────────────────────
const ApprovalsPage = ({ addToast }) => {
  const [filter, setFilter] = useState("all");
  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [comment, setComment] = useState("");

  const requests = [
    { id:"VIA-2024-089", user:"Osmar Gómez", type:"Viáticos y gastos", amount:"MXN 5,000", submitted:"27/05/2024", status:"Pendiente", days:1 },
    { id:"VIA-2024-087", user:"Laura Pérez", type:"Viáticos y gastos", amount:"MXN 7,200", submitted:"26/05/2024", status:"Pendiente", days:2 },
    { id:"PAG-2024-041", user:"Carlos Ruiz", type:"Solicitud de pago", amount:"MXN 12,500", submitted:"25/05/2024", status:"En revisión", days:3 },
    { id:"ANT-2024-033", user:"María López", type:"Solicitud de anticipo", amount:"MXN 3,200", submitted:"24/05/2024", status:"En revisión", days:4 },
    { id:"VIA-2024-080", user:"Jorge Hernández", type:"Viáticos y gastos", amount:"MXN 9,100", submitted:"20/05/2024", status:"Aprobado", days:8 },
  ];

  const filtered = filter === "all" ? requests : requests.filter(r => r.status.toLowerCase().includes(filter));

  const handleApprove = () => {
    addToast({ type:"success", message:`Solicitud ${approveModal} aprobada exitosamente` });
    setApproveModal(null); setComment("");
  };
  const handleReject = () => {
    addToast({ type:"error", message:`Solicitud ${rejectModal} rechazada` });
    setRejectModal(null); setComment("");
  };

  const inputStyle = { width:"100%", padding:"9px 12px", border:`1.5px solid ${COLORS.border}`, borderRadius:8, fontSize:13.5, color:COLORS.textDark, outline:"none", boxSizing:"border-box", resize:"vertical", fontFamily:"inherit", minHeight:90 };

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ margin:"0 0 4px", fontSize:22, fontWeight:800, color:COLORS.textDark }}>Aprobaciones</h1>
        <p style={{ margin:0, fontSize:13.5, color:COLORS.textLight }}>Gestiona las solicitudes pendientes de aprobación.</p>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {[["all","Todas",requests.length],["pendiente","Pendientes",requests.filter(r=>r.status==="Pendiente").length],["revisión","En revisión",requests.filter(r=>r.status==="En revisión").length],["aprobado","Aprobadas",requests.filter(r=>r.status==="Aprobado").length]].map(([key,label,count]) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6,
            background: filter === key ? COLORS.primary : "#fff",
            color: filter === key ? "#fff" : COLORS.textMid,
            border: filter === key ? `1.5px solid ${COLORS.primary}` : `1.5px solid ${COLORS.border}`,
            transition:"all .15s",
          }}>
            {label}
            <span style={{ background: filter === key ? "rgba(255,255,255,.25)" : COLORS.border, padding:"1px 7px", borderRadius:12, fontSize:11 }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:"#fff", borderRadius:14, border:`1px solid ${COLORS.border}`, boxShadow:"0 1px 4px rgba(0,0,0,.04)", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#F9FAFB" }}>
              {["Solicitud","Solicitante","Tipo","Monto","Enviado","Días","Estado","Acciones"].map(h => (
                <th key={h} style={{ padding:"11px 18px", textAlign:"left", fontSize:11.5, fontWeight:700, color:COLORS.textLight, borderBottom:`1px solid ${COLORS.border}`, letterSpacing:.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} style={{ borderBottom:`1px solid ${COLORS.border}`, transition:"background .12s" }}
                onMouseEnter={e=>e.currentTarget.style.background="#F9FAFB"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                <td style={{ padding:"13px 18px", fontSize:13, fontWeight:700, color:COLORS.primary }}>{r.id}</td>
                <td style={{ padding:"13px 18px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${COLORS.primary},${COLORS.accent})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff", flexShrink:0 }}>{r.user[0]}</div>
                    <span style={{ fontSize:13, color:COLORS.textDark, fontWeight:500 }}>{r.user}</span>
                  </div>
                </td>
                <td style={{ padding:"13px 18px", fontSize:13, color:COLORS.textMid }}>{r.type}</td>
                <td style={{ padding:"13px 18px", fontSize:13, fontWeight:600, color:COLORS.textDark }}>{r.amount}</td>
                <td style={{ padding:"13px 18px", fontSize:13, color:COLORS.textMid }}>{r.submitted}</td>
                <td style={{ padding:"13px 18px" }}>
                  <span style={{ fontSize:12, fontWeight:700, color: r.days >= 3 ? "#DC2626" : COLORS.textMid }}>{r.days}d</span>
                </td>
                <td style={{ padding:"13px 18px" }}><StatusBadge status={r.status} /></td>
                <td style={{ padding:"13px 18px" }}>
                  {r.status !== "Aprobado" && r.status !== "Rechazado" && (
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => setApproveModal(r.id)} style={{ padding:"5px 12px", background:"#ECFDF5", border:"1.5px solid #A7F3D0", borderRadius:6, fontSize:12, fontWeight:600, color:"#065F46", cursor:"pointer" }}>Aprobar</button>
                      <button onClick={() => setRejectModal(r.id)} style={{ padding:"5px 12px", background:"#FEF2F2", border:"1.5px solid #FECACA", borderRadius:6, fontSize:12, fontWeight:600, color:"#991B1B", cursor:"pointer" }}>Rechazar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Approve Modal */}
      <Modal open={!!approveModal} onClose={() => setApproveModal(null)} title={`Aprobar solicitud ${approveModal}`}
        actions={[
          <button key="c" onClick={() => setApproveModal(null)} style={{ padding:"9px 20px", background:"none", border:`1.5px solid ${COLORS.border}`, borderRadius:8, fontSize:13, cursor:"pointer", fontWeight:600, color:COLORS.textMid }}>Cancelar</button>,
          <button key="a" onClick={handleApprove} style={{ padding:"9px 20px", background:"#10B981", border:"none", borderRadius:8, fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>✓ Confirmar aprobación</button>,
        ]}>
        <div>
          <label style={{ fontSize:12.5, fontWeight:600, color:COLORS.textMid, display:"block", marginBottom:8 }}>Comentarios (opcional)</label>
          <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Añade un comentario para el solicitante..." style={inputStyle} onFocus={e=>e.target.style.borderColor=COLORS.primary} onBlur={e=>e.target.style.borderColor=COLORS.border} />
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title={`Rechazar solicitud ${rejectModal}`}
        actions={[
          <button key="c" onClick={() => setRejectModal(null)} style={{ padding:"9px 20px", background:"none", border:`1.5px solid ${COLORS.border}`, borderRadius:8, fontSize:13, cursor:"pointer", fontWeight:600, color:COLORS.textMid }}>Cancelar</button>,
          <button key="r" onClick={handleReject} style={{ padding:"9px 20px", background:"#EF4444", border:"none", borderRadius:8, fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>✕ Confirmar rechazo</button>,
        ]}>
        <div>
          <label style={{ fontSize:12.5, fontWeight:600, color:COLORS.textMid, display:"block", marginBottom:8 }}>Motivo del rechazo <span style={{color:"#EF4444"}}>*</span></label>
          <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Explica el motivo del rechazo..." style={inputStyle} onFocus={e=>e.target.style.borderColor="#EF4444"} onBlur={e=>e.target.style.borderColor=COLORS.border} />
        </div>
      </Modal>
    </div>
  );
};

// ─── Page: History ────────────────────────────────────────────────────────────
const HistorialPage = () => {
  const logs = [
    { id:1, action:"Solicitud enviada a aprobación", user:"Osmar Gómez", req:"VIA-2024-089", time:"27/05/2024 10:32", type:"info" },
    { id:2, action:"Solicitud aprobada", user:"Gerente Finanzas", req:"PAG-2024-041", time:"26/05/2024 14:15", type:"success" },
    { id:3, action:"Comentario añadido", user:"Gerente Finanzas", req:"ANT-2024-033", time:"25/05/2024 09:00", type:"info" },
    { id:4, action:"Solicitud rechazada — documentación incompleta", user:"Gerente Finanzas", req:"VIA-2024-082", time:"22/05/2024 16:45", type:"error" },
    { id:5, action:"Archivos adjuntados (3 archivos)", user:"Carlos Ruiz", req:"VIA-2024-080", time:"20/05/2024 11:20", type:"info" },
    { id:6, action:"Solicitud aprobada", user:"Director Regional", req:"VIA-2024-080", time:"19/05/2024 08:55", type:"success" },
    { id:7, action:"Borrador guardado", user:"Osmar Gómez", req:"VIA-2024-089", time:"18/05/2024 17:10", type:"info" },
  ];

  const typeColor = { info:COLORS.info, success:COLORS.success, error:COLORS.danger, warning:COLORS.warning };
  const typeBg = { info:"#EFF6FF", success:"#ECFDF5", error:"#FEF2F2", warning:"#FFFBEB" };

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ margin:"0 0 4px", fontSize:22, fontWeight:800, color:COLORS.textDark }}>Historial de actividad</h1>
        <p style={{ margin:0, fontSize:13.5, color:COLORS.textLight }}>Registro completo de todas las acciones realizadas en el sistema.</p>
      </div>
      <div style={{ background:"#fff", borderRadius:14, border:`1px solid ${COLORS.border}`, boxShadow:"0 1px 4px rgba(0,0,0,.04)", overflow:"hidden" }}>
        {logs.map((log, i) => (
          <div key={log.id} style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"16px 22px", borderBottom: i < logs.length-1 ? `1px solid ${COLORS.border}` : "none", transition:"background .12s" }}
            onMouseEnter={e=>e.currentTarget.style.background="#F9FAFB"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
            <div style={{ width:36, height:36, borderRadius:10, background:typeBg[log.type], display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Icon name={log.type==="success"?"check":log.type==="error"?"x":"info"} size={16} color={typeColor[log.type]} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13.5, fontWeight:600, color:COLORS.textDark }}>{log.action}</div>
              <div style={{ fontSize:12.5, color:COLORS.textLight, marginTop:2 }}>
                <span style={{ fontWeight:600, color:COLORS.textMid }}>{log.user}</span> · {log.req}
              </div>
            </div>
            <div style={{ fontSize:12, color:COLORS.textLight, flexShrink:0 }}>{log.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Placeholder Page ─────────────────────────────────────────────────────────
const PlaceholderPage = ({ title, icon }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400, textAlign:"center" }}>
    <div style={{ width:80, height:80, borderRadius:20, background:COLORS.purple100, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
      <Icon name={icon || "dashboard"} size={36} color={COLORS.primary} />
    </div>
    <h2 style={{ margin:"0 0 8px", fontSize:20, fontWeight:700, color:COLORS.textDark }}>{title}</h2>
    <p style={{ margin:0, fontSize:14, color:COLORS.textLight, maxWidth:320 }}>Esta sección está disponible en la versión completa del sistema.</p>
  </div>
);

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("viaticos");
  const [collapsed, setCollapsed] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (t) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4500);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(x => x.id !== id));

  const pageMap = {
    inicio: <PlaceholderPage title="Inicio" icon="home" />,
    dashboard: <DashboardPage setPage={setPage} />,
    "solicitud-pago": <PlaceholderPage title="Solicitud de pago" icon="requests" />,
    "solicitud-anticipo": <PlaceholderPage title="Solicitud de anticipo" icon="requests" />,
    viaticos: <ViaticosPage addToast={addToast} />,
    "mis-procesos": <PlaceholderPage title="Mis procesos" icon="process" />,
    aprobaciones: <ApprovalsPage addToast={addToast} />,
    historial: <HistorialPage />,
    "archivo-digital": <PlaceholderPage title="Archivo digital" icon="archive" />,
    reportes: <PlaceholderPage title="Reportes" icon="reports" />,
    proveedores: <PlaceholderPage title="Proveedores" icon="suppliers" />,
    catalogos: <PlaceholderPage title="Catálogos" icon="catalog" />,
    ajustes: <PlaceholderPage title="Ajustes" icon="settings" />,
    ayuda: <PlaceholderPage title="Ayuda y soporte" icon="help" />,
  };

  const breadcrumbMap = {
    viaticos: [
      { label:"Inicio", page:"inicio" },
      { label:"Solicitudes", page:"solicitud-pago" },
      { label:"Viáticos y gastos", page:"viaticos" },
      { label:"Nueva solicitud de legalización" },
    ],
    dashboard: [{ label:"Dashboard" }],
    aprobaciones: [{ label:"Procesos" }, { label:"Aprobaciones" }],
    historial: [{ label:"Procesos" }, { label:"Historial" }],
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #F9FAFB; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        select, input, textarea, button { font-family: inherit; }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
      `}</style>

      <div style={{ display:"flex", minHeight:"100vh" }}>
        <Sidebar currentPage={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />

        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" }}>
          <TopNav collapsed={collapsed} setCollapsed={setCollapsed} notifCount={3} setPage={setPage} />

          <main style={{ flex:1, overflowY:"auto", padding:"28px 32px" }}>
            {breadcrumbMap[page] && <Breadcrumb items={breadcrumbMap[page]} setPage={setPage} />}
            {pageMap[page] || <PlaceholderPage title={page} />}
          </main>
        </div>
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  );
}
