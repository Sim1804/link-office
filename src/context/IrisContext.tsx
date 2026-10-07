"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface IrisContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeTab: "coach" | "explication";
  setActiveTab: (tab: "coach" | "explication") => void;
  openIris: (tab?: "coach" | "explication") => void;
  closeIris: () => void;
  toggleIris: () => void;
}

const IrisContext = createContext<IrisContextType | undefined>(undefined);

export function IrisProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"coach" | "explication">("coach");

  const openIris = (tab: "coach" | "explication" = "coach") => {
    setActiveTab(tab);
    setIsOpen(true);
  };

  const closeIris = () => {
    setIsOpen(false);
  };

  const toggleIris = () => {
    setIsOpen(prev => !prev);
  };

  // Support external triggers via CustomEvent "open-iris"
  useEffect(() => {
    const handleOpenIrisEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const targetTab = customEvent.detail?.tab || "coach";
      openIris(targetTab);
    };

    window.addEventListener("open-iris", handleOpenIrisEvent);
    return () => {
      window.removeEventListener("open-iris", handleOpenIrisEvent);
    };
  }, []);

  return (
    <IrisContext.Provider
      value={{
        isOpen,
        setIsOpen,
        activeTab,
        setActiveTab,
        openIris,
        closeIris,
        toggleIris,
      }}
    >
      {children}
    </IrisContext.Provider>
  );
}

export function useIris() {
  const context = useContext(IrisContext);
  if (!context) {
    throw new Error("useIris must be used within an IrisProvider");
  }
  return context;
}

/**
 * Wrapper for the page content that shifts to the left when IRIS is opened.
 * This gives the incorporated SaaS side-dock experience.
 */
export function IrisLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isOpen } = useIris();

  return (
    <div
      className={`min-h-screen w-full transition-[margin,width] duration-300 ease-in-out ${
        isOpen ? "lg:mr-[420px] lg:w-[calc(100%-420px)]" : "mr-0 w-full"
      }`}
    >
      {children}
    </div>
  );
}
