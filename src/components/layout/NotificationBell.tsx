"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, ArrowRight, Sparkles, AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  actionLink?: string | null;
  status: "UNREAD" | "READ";
  createdAt: string;
}

export function NotificationBell() {
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Charger les notifications
  const loadNotifications = () => {
    if (session?.user) {
      setIsLoading(true);
      fetch("/api/notifications")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setNotifications(data);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  };

  useEffect(() => {
    loadNotifications();
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

  // Marquer une notification comme lue
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      // Mise à jour optimiste immédiate
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "READ" } : n))
      );
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error("[NotificationBell] Erreur lors du marquage comme lu :", err);
    }
  };

  // Marquer toutes les notifications comme lues
  const handleMarkAllAsRead = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      // Mise à jour optimiste
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
    } catch (err) {
      console.error("[NotificationBell] Erreur tout marquer comme lu :", err);
    }
  };

  // Clic sur "Voir les détails" ou sur la carte
  const handleNotificationAction = async (notif: NotificationItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (notif.status === "UNREAD") {
      await handleMarkAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.actionLink) {
      router.push(notif.actionLink);
    }
  };

  if (!session) return null;

  const unreadCount = notifications.filter((n) => n.status === "UNREAD").length;

  const formatNotifDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return "À l'instant";
      if (diffHours < 24) return `Il y a ${diffHours}h`;
      if (diffDays === 1) return "Hier";
      if (diffDays < 7) return `Il y a ${diffDays}j`;
      return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "REPORT_AVAILABLE":
        return <AlertCircle className="w-4 h-4 text-[#F59E0B]" />;
      case "SYSTEM":
        return <Info className="w-4 h-4 text-[#5965E8]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#00A99D]" />;
    }
  };

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      {/* Bouton Cloche */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Centre de notifications"
        aria-expanded={isOpen}
        className="relative p-2 rounded-xl border border-[#E3EBE6] bg-white hover:bg-[#FAF9F5] text-[#123D46]/70 hover:text-[#123D46] hover:border-[#00A99D]/40 transition-all flex items-center justify-center shadow-2xs cursor-pointer focus:outline-hidden"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs ring-2 ring-white animate-scale-in">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Menu Déroulant Notifications */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E3EBE6] rounded-2xl shadow-2xl z-50 overflow-hidden font-inter text-xs animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E3EBE6] bg-[#FAF9F5]">
            <div className="flex items-center gap-2">
              <h3 className="font-jakarta font-bold text-sm text-[#123D46] m-0">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#00A99D]/10 text-[#00A99D] border border-[#00A99D]/20">
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-xs font-jakarta font-semibold text-[#00A99D] hover:text-[#199E9A] hover:underline flex items-center gap-1 cursor-pointer transition-colors bg-transparent border-none p-0"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tout marquer comme lu</span>
              </button>
            )}
          </div>

          {/* Liste des notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#E3EBE6]/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-[#123D46]/60">
                <div className="w-10 h-10 rounded-full bg-[#FAF9F5] border border-[#E3EBE6] flex items-center justify-center mx-auto mb-3 text-[#123D46]/40">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="font-jakarta font-bold text-xs text-[#123D46]">Aucune notification</div>
                <p className="text-[11px] text-[#123D46]/60 mt-1 m-0">
                  Vous êtes à jour, aucune nouvelle alerte pour le moment.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = notif.status === "UNREAD";

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationAction(notif)}
                    className={`p-3.5 flex gap-3 items-start transition-colors cursor-pointer ${
                      isUnread
                        ? "bg-[#00A99D]/[0.035] hover:bg-[#00A99D]/[0.07] border-l-3 border-l-[#00A99D]"
                        : "bg-white hover:bg-[#FAF9F5] border-l-3 border-l-transparent"
                    }`}
                  >
                    {/* Icône */}
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#E3EBE6] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      {getNotifIcon(notif.type)}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isUnread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00A99D] shrink-0" />
                          )}
                          <h4
                            className={`text-xs font-jakarta truncate m-0 ${
                              isUnread ? "font-bold text-[#123D46]" : "font-semibold text-[#123D46]/80"
                            }`}
                          >
                            {notif.title}
                          </h4>
                        </div>
                        <span className="text-[10px] text-[#123D46]/45 shrink-0 whitespace-nowrap">
                          {formatNotifDate(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#123D46]/70 leading-snug m-0 line-clamp-2">
                        {notif.message}
                      </p>

                      {/* Barre d'action */}
                      <div className="flex items-center justify-between mt-2 pt-1">
                        {notif.actionLink ? (
                          <button
                            type="button"
                            onClick={(e) => handleNotificationAction(notif, e)}
                            className="inline-flex items-center gap-1 text-[11px] font-jakarta font-bold text-[#00A99D] hover:text-[#199E9A] transition-colors cursor-pointer bg-transparent border-none p-0 group"
                          >
                            <span>Voir les détails</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ) : (
                          <span />
                        )}

                        {isUnread && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            title="Marquer comme lu"
                            className="inline-flex items-center gap-1 text-[10px] font-jakarta font-medium text-[#123D46]/50 hover:text-[#00A99D] hover:bg-[#00A99D]/10 px-2 py-0.5 rounded-md transition-colors cursor-pointer bg-transparent border-none"
                          >
                            <Check className="w-3 h-3" />
                            <span>Marquer comme lu</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
