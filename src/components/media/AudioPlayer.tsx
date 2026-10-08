"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Download, Headphones } from "lucide-react";

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
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
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
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + amount));
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioRef.current && audioRef.current.duration) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = pos * audioRef.current.duration;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#123D46] via-[#10343C] to-[#0A242B] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#00A99D]/20">
      {/* Halo lumineux d'ambiance */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#00A99D]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#5965E8]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Info piste */}
      <div className="relative z-10 flex items-center gap-4 sm:gap-6 mb-6">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border border-white/20 shadow-md">
          {coverImage ? (
            <img src={coverImage} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#00A99D] flex items-center justify-center">
              <Headphones className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#00A99D] text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A99D] animate-pulse" />
            En écoute • Podcast
          </div>
          <h4 className="font-jakarta font-bold text-lg sm:text-xl text-white truncate">
            {title}
          </h4>
          {eclaireurName && (
            <p className="text-xs sm:text-sm text-white/70 truncate mt-0.5">
              Avec {eclaireurName}
            </p>
          )}
        </div>

        {src && (
          <a
            href={src}
            download
            title="Télécharger l'épisode"
            className="p-2.5 rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <Download className="w-5 h-5" />
          </a>
        )}
      </div>

      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Barre de progression */}
      <div className="relative z-10 space-y-2 mb-6">
        <div
          ref={progressBarRef}
          onClick={handleProgressClick}
          className="group relative h-2.5 bg-white/15 rounded-full cursor-pointer overflow-hidden transition-all hover:h-3"
        >
          <div
            className="h-full bg-gradient-to-r from-[#00A99D] to-[#5965E8] rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between text-xs font-mono font-medium text-white/70">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Contrôles Audio */}
      <div className="relative z-10 flex items-center justify-center gap-6 sm:gap-8">
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? "Activer le son" : "Couper le son"}
          className="p-2 text-white/70 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
        </button>

        <button
          type="button"
          onClick={() => skip(-15)}
          aria-label="Reculer de 15 secondes"
          className="p-2 text-white/80 hover:text-white hover:scale-110 transition-transform"
        >
          <SkipBack className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Mettre en pause" : "Lancer la lecture"}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#00A99D] hover:bg-[#008f84] text-white flex items-center justify-center shadow-lg shadow-[#00A99D]/40 hover:scale-105 active:scale-95 transition-all"
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 fill-current" />
          ) : (
            <Play className="w-7 h-7 fill-current ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => skip(15)}
          aria-label="Avancer de 15 secondes"
          className="p-2 text-white/80 hover:text-white hover:scale-110 transition-transform"
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
