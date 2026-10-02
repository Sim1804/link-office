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
    <div ref={containerRef} className={`relative ${isOpen ? 'z-50' : 'z-10'}`} style={style}>
      <div 
        className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all duration-200 select-none ${
          disabled 
            ? "bg-[#FAF9F5] border-[#E3EBE6] cursor-not-allowed opacity-70" 
            : "bg-white border-[#E3EBE6] cursor-pointer hover:border-[#00A99D]/50"
        } ${isOpen && !disabled ? "border-[#00A99D] shadow-[0_0_0_4px_rgba(0,169,157,0.1)]" : "shadow-sm"} ${className}`}
        onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
      >
        <span className={`text-sm truncate ${selectedOption ? (disabled ? "text-[#123D46]/50" : "text-[#123D46]") : "text-[#123D46]/50"}`}>
          {selectedOption ? selectedOption.label : placeholder || "Sélectionner..."}
        </span>
        <ChevronDown 
          size={16} 
          className={`shrink-0 ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"} ${disabled ? "text-[#123D46]/40" : "text-[#123D46]/60"}`} 
        />
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-white border border-[#E3EBE6] rounded-xl shadow-lg p-1.5 max-h-[250px] overflow-y-auto">
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <div
                key={option.value}
                onClick={() => { onChange(option.value); setIsOpen(false); }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-[13px] transition-colors ${
                  isSelected 
                    ? "bg-[#00A99D]/10 text-[#00A99D] font-bold" 
                    : "text-[#123D46] font-medium hover:bg-[#FAF9F5]"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check size={14} className="shrink-0 ml-2" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
