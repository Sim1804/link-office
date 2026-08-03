"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";

export function BinomeInviteForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMsg("");
    setError(false);
    
    try {
      const res = await fetch("/api/binome/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setMsg("Invitation envoyée avec succès !");
        setEmail("");
        router.refresh();
      } else {
        setError(true);
        setMsg(data.error || "Une erreur est survenue");
      }
    } catch (err) {
      setError(true);
      setMsg("Impossible d'envoyer l'invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 12 }}>
        <input 
          type="email" 
          required 
          placeholder="Email de votre futur binôme"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          style={{ flex: 1 }}
        />
        <button 
          type="submit"
          disabled={loading || !email}
          className="btn btn-primary"
        >
          {loading ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> : <><Send style={{ width: 18, height: 18 }} /> Envoyer</>}
        </button>
      </div>
      {msg && (
        <p style={{ fontSize: 13, color: error ? "#ef4444" : "#34d399", marginTop: 4 }}>{msg}</p>
      )}
    </form>
  );
}
