"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface Option {
  value: string;
  label: string;
}

export interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
}

export function Select({ options, value, onChange, placeholder, style, className = "input-field", disabled = false }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", zIndex: isOpen ? 100 : 1, ...style }}>
      <div 
        className={className} 
        style={{ 
          display: "flex", alignItems: "center", justifyContent: "space-between", 
          cursor: disabled ? "not-allowed" : "pointer", userSelect: "none",
          background: disabled ? "var(--surface-2)" : "var(--surface)", 
          borderColor: isOpen ? "var(--primary)" : "var(--border-strong)",
          boxShadow: isOpen ? "0 0 0 4px var(--primary-glow)" : "0 1px 2px rgba(18,61,70,0.02)",
          padding: "10px 16px", borderRadius: 12, 
          color: selectedOption ? (disabled ? "var(--text-3)" : "var(--text-1)") : "var(--text-3)",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: disabled ? 0.7 : 1
        }}
        onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
        onMouseOver={(e) => { if (!isOpen && !disabled) e.currentTarget.style.borderColor = "rgba(18,61,70,0.3)"; }}
        onMouseOut={(e) => { if (!isOpen && !disabled) e.currentTarget.style.borderColor = "var(--border-strong)"; }}
      >
        <span style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOption ? selectedOption.label : placeholder || "Sélectionner..."}
        </span>
        <ChevronDown size={16} style={{ color: "var(--text-3)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0, marginLeft: 8 }} />
      </div>

      {isOpen && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 100,
          background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: 12,
          boxShadow: "var(--shadow-card-hover)", padding: 6, maxHeight: 250, overflowY: "auto"
        }}>
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => { onChange(option.value); setIsOpen(false); }}
              style={{
                padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: value === option.value ? "rgba(18,61,70,0.04)" : "transparent",
                color: value === option.value ? "var(--primary)" : "var(--text-1)",
                fontWeight: value === option.value ? 600 : 500,
                fontSize: 13, transition: "background 0.2s"
              }}
              onMouseOver={(e) => { if (value !== option.value) e.currentTarget.style.background = "rgba(18,61,70,0.02)"; }}
              onMouseOut={(e) => { if (value !== option.value) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{option.label}</span>
              {value === option.value && <Check size={14} style={{ flexShrink: 0, marginLeft: 8 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
