/**
 * @file Breadcrumb.tsx
 * @module src/components/layout
 * @description Fil d'Ariane réutilisable pour les pages profondes des dashboards.
 *
 * Usage :
 * ```tsx
 * <Breadcrumb items={[
 *   { label: "Tableau de bord RH", href: "/dashboard/rh" },
 *   { label: "Campagnes", href: "/dashboard/rh/campaigns" },
 *   { label: "Campagne Lumina Retail" }, // dernier item = page courante, sans href
 * ]} />
 * ```
 */

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Route de la page d'accueil du rôle (défaut: "/dashboard") */
  homeHref?: string;
}

export function Breadcrumb({ items, homeHref = "/dashboard" }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "10px 0",
        marginBottom: 24,
        flexWrap: "wrap",
      }}
    >
      {/* Icône maison */}
      <Link
        href={homeHref}
        aria-label="Accueil"
        style={{
          display: "flex",
          alignItems: "center",
          color: "var(--text-3)",
          textDecoration: "none",
          transition: "color 0.15s",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
      >
        <Home size={14} />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <ChevronRight size={13} style={{ color: "var(--text-3)", flexShrink: 0 }} />
            {isLast || !item.href ? (
              <span
                aria-current={isLast ? "page" : undefined}
                style={{
                  fontSize: 13,
                  fontWeight: isLast ? 600 : 400,
                  color: isLast ? "var(--text-1)" : "var(--text-2)",
                  maxWidth: 200,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                style={{
                  fontSize: 13,
                  fontWeight: 400,
                  color: "var(--text-2)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                  maxWidth: 200,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-2)")}
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
