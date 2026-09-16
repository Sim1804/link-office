"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Download } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  title: string;
  eclaireurName?: string;
  coverImage?: string;
}

export function AudioPlayer({ src, title, eclaireurName, coverImage }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skip = (amount: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += amount;
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = pos * audioRef.current.duration;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{ 
      background: "linear-gradient(145deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.9) 100%)", 
      padding: 32, borderRadius: 32, 
      border: "1px solid var(--border)",
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 var(--border)",
      backdropFilter: "blur(20px)",
      display: "flex", flexDirection: "column", gap: 32,
      position: "relative", overflow: "hidden"
    }}>
      {/* Decorative gradient orb */}
      <div style={{ position: "absolute", top: -50, right: -50, width: 150, height: 150, background: "rgba(192,132,252,0.3)", filter: "blur(60px)", borderRadius: "50%", pointerEvents: "none" }} />
      
      {/* Header / Info */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, position: "relative", zIndex: 1 }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, overflow: "hidden", flexShrink: 0, border: "2px solid var(--border)", boxShadow: "0 10px 25px rgba(0,0,0,0.4)" }}>
          {coverImage ? (
            <img src={coverImage} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, var(--primary), #ec4899)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play size={32} color="white" />
            </div>
          )}
        </div>
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <div style={{ display: "inline-block", padding: "4px 10px", background: "var(--border)", borderRadius: 999, fontSize: 11, fontWeight: 700, color: "var(--text-3)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            En écoute
          </div>
          <h4 style={{ color: "#ffffff", fontSize: 22, fontWeight: 800, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.01em" }}>
            {title}
          </h4>
          {eclaireurName && (
            <div style={{ color: "var(--text-2)", fontSize: 15, marginTop: 4, fontWeight: 500 }}>Avec {eclaireurName}</div>
          )}
        </div>
        <a href={src} download style={{ color: "rgba(255,255,255,0.5)", transition: "all 0.3s ease", padding: 12, background: "rgba(18,61,70,0.05)", borderRadius: "50%" }} className="hover-btn-dl">
          <Download size={22} />
        </a>
      </div>

      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Progress Bar */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div 
          ref={progressBarRef}
          onClick={handleProgressClick}
          className="progress-container"
          style={{
            height: 8, background: "var(--surface)", borderRadius: 4, cursor: "pointer", position: "relative", overflow: "visible"
          }}
        >
          <div style={{
            position: "absolute", top: 0, left: 0, height: "100%", background: "linear-gradient(90deg, #a855f7, #ec4899)",
            width: `${progress}%`, borderRadius: 4, transition: "width 0.1s linear"
          }} />
          <div className="progress-thumb" style={{
            position: "absolute", top: "50%", left: `${progress}%`, transform: "translate(-50%, -50%)",
            width: 16, height: 16, background: "var(--surface)", borderRadius: "50%", boxShadow: "0 0 15px rgba(236,72,153,0.8)",
            opacity: isPlaying ? 1 : 0, transition: "opacity 0.2s, transform 0.2s"
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-2)", fontSize: 13, marginTop: 12, fontWeight: 600, fontFamily: "monospace" }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, position: "relative", zIndex: 1 }}>
        <button onClick={toggleMute} style={{ background: "none", border: "none", color: isMuted ? "#ef4444" : "rgba(255,255,255,0.5)", cursor: "pointer", padding: 8, transition: "color 0.2s" }} className="hover-text-white">
          {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
        </button>
        
        <button onClick={() => skip(-15)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", cursor: "pointer", padding: 8, transition: "transform 0.2s, color 0.2s" }} className="hover-text-white hover-scale">
          <SkipBack size={28} />
        </button>
        
        <button 
          onClick={togglePlay}
          style={{ 
            width: 72, height: 72, borderRadius: "50%", border: "none", cursor: "pointer",
            background: "linear-gradient(135deg, #a855f7, #ec4899)", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: isPlaying ? "0 0 30px rgba(236,72,153,0.6)" : "0 10px 25px rgba(0,0,0,0.5)",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", transform: isPlaying ? "scale(0.95)" : "scale(1)"
          }}
          className="play-btn"
        >
          {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" style={{ marginLeft: 6 }} />}
        </button>
        
        <button onClick={() => skip(15)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", cursor: "pointer", padding: 8, transition: "transform 0.2s, color 0.2s" }} className="hover-text-white hover-scale">
          <SkipForward size={28} />
        </button>
        
        <div style={{ width: 38 }} /> {/* Spacer to balance mute button */}
      </div>

      <style>{`
        .hover-btn-dl:hover { color: #fff !important; background: rgba(255,255,255,0.15) !important; transform: translateY(-2px); }
        .hover-text-white:hover { color: #fff !important; }
        .hover-scale:hover { transform: scale(1.1); }
        .progress-container:hover .progress-thumb { opacity: 1 !important; transform: translate(-50%, -50%) scale(1.2) !important; }
        .play-btn:hover { transform: scale(1.05); }
      `}</style>
    </div>
  );
}
