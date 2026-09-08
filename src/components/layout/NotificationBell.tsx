"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Charger les notifications
  useEffect(() => {
    if (session?.user) {
      fetch("/api/notifications")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setNotifications(data);
        })
        .catch(console.error);
    }
  }, [session]);

  // Fermeture au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pas de notification si non connecté
  if (!session) return null;

  const unreadCount = notifications.filter(n => n.status === "UNREAD").length;

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12, padding: "8px", color: "#94a3b8", cursor: "pointer",
          position: "relative", transition: "all 0.2s"
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            background: "#ef4444", color: "white", fontSize: 9, fontWeight: 800,
            width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 10px rgba(239,68,68,0.5)"
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: "absolute", top: "calc(100% + 12px)", right: 0, width: 340,
          background: "rgba(17,24,39,0.95)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
          zIndex: 100, overflow: "hidden"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>Notifications</h3>
            {unreadCount > 0 && (
              <button style={{ fontSize: 11, color: "#a78bfa", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b", fontSize: 13 }}>
                <Bell size={24} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                Vous n'avez aucune notification.
              </div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} style={{ 
                  padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.03)", 
                  background: notif.status === "UNREAD" ? "rgba(124,58,237,0.05)" : "transparent",
                  display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", transition: "background 0.2s"
                }}>
                  <div style={{ 
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <Bell size={14} style={{ color: "#a78bfa" }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 600, color: notif.status === "UNREAD" ? "#f8fafc" : "#cbd5e1", marginBottom: 4 }}>{notif.title}</h4>
                    <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.4 }}>{notif.message}</p>
                    {notif.actionLink && (
                      <Link href={notif.actionLink} style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 11, color: "#38bdf8", fontWeight: 600, textDecoration: "none" }}>
                        Voir les détails <ExternalLink size={10} />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
