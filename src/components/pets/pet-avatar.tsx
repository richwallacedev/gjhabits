"use client";

import { motion } from "framer-motion";

import type { PetId, PetMood } from "@/lib/constants";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20"
} as const;

type PetAvatarProps = {
  pet: PetId;
  mood?: PetMood;
  size?: keyof typeof sizeMap;
  animated?: boolean;
  className?: string;
};

function moodMotion(mood: PetMood) {
  if (mood === "happy" || mood === "proud") {
    return {
      y: [0, -2, 0],
      rotate: [0, 1.2, -1.2, 0]
    };
  }
  if (mood === "alert" || mood === "tempting") {
    return {
      rotate: [0, 2.5, -2.5, 0]
    };
  }
  if (mood === "angry") {
    return {
      x: [0, -1, 1, -1, 1, 0]
    };
  }
  if (mood === "guilty") {
    return {
      y: [0, 1.5, 0]
    };
  }
  return {
    y: [0, -0.8, 0]
  };
}

function danteMouth(mood: PetMood) {
  if (mood === "happy" || mood === "proud") {
    return (
      <>
        <path d="M44 72c4 6 10 9 16 9s12-3 16-9" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
        <path d="M54 80c0 6 5 10 10 10s10-4 10-10" fill="#f87171" />
      </>
    );
  }
  if (mood === "angry" || mood === "alert") {
    return <path d="M46 78h28" stroke="#0f172a" strokeWidth="3.4" strokeLinecap="round" />;
  }
  if (mood === "guilty") {
    return <path d="M47 83c4-4 9-6 13-6 5 0 10 2 14 6" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />;
  }
  return <path d="M48 80c4 4 8 5 12 5s8-1 12-5" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />;
}

function lucienMouth(mood: PetMood) {
  if (mood === "tempting") {
    return <path d="M47 80c6 2 18 2 26-2" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />;
  }
  if (mood === "guilty") {
    return <path d="M47 83c6-4 18-4 26 0" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />;
  }
  return <path d="M48 80c4 4 8 5 12 5s8-1 12-5" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />;
}

function tomasaMouth(mood: PetMood) {
  if (mood === "angry" || mood === "alert") {
    return <path d="M48 79h24" stroke="#f8fafc" strokeWidth="2.8" strokeLinecap="round" />;
  }
  return <path d="M49 79c4 4 7 5 11 5s7-1 11-5" stroke="#f8fafc" strokeWidth="2.8" strokeLinecap="round" />;
}

function DanteFace({ mood }: { mood: PetMood }) {
  const eyeY = mood === "sleepy" ? 52 : 50;
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full">
      <rect x="0" y="0" width="120" height="120" rx="30" fill="#fff7ed" />
      <path d="M26 30 48 44 40 18Z" fill="#111827" />
      <path d="M94 30 72 44 80 18Z" fill="#111827" />
      <ellipse cx="60" cy="62" rx="34" ry="33" fill="#111827" />
      <path d="M50 86h20l-10 14Z" fill="#f8fafc" />
      <circle cx="47" cy={eyeY} r="9.5" fill="#f8fafc" />
      <circle cx="73" cy={eyeY} r="9.5" fill="#f8fafc" />
      <circle cx="47" cy={eyeY} r="4.3" fill="#0f172a" />
      <circle cx="73" cy={eyeY} r="4.3" fill="#0f172a" />
      <ellipse cx="60" cy="66" rx="8" ry="6" fill="#0f172a" />
      {danteMouth(mood)}
    </svg>
  );
}

function TomasaFace({ mood }: { mood: PetMood }) {
  const eyebrowColor = mood === "angry" ? "#ef4444" : "#f8fafc";
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full">
      <rect x="0" y="0" width="120" height="120" rx="30" fill="#fff7ed" />
      <path d="M30 30 50 45 44 16Z" fill="#111827" />
      <path d="M90 30 70 45 76 16Z" fill="#111827" />
      <ellipse cx="60" cy="63" rx="33" ry="33" fill="#111827" />
      <ellipse cx="48" cy="54" rx="9.4" ry="6.8" fill="#fbbf24" />
      <ellipse cx="72" cy="54" rx="9.4" ry="6.8" fill="#fbbf24" />
      <circle cx="48" cy="54" r="3.6" fill="#0f172a" />
      <circle cx="72" cy="54" r="3.6" fill="#0f172a" />
      <path d="M40 45h16" stroke={eyebrowColor} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M64 45h16" stroke={eyebrowColor} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M60 66l-6 6h12z" fill="#f8fafc" />
      {tomasaMouth(mood)}
      <path d="M28 69h18M74 69h18" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LucienFace({ mood }: { mood: PetMood }) {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full">
      <rect x="0" y="0" width="120" height="120" rx="30" fill="#fff7ed" />
      <path d="M30 30 49 44 43 18Z" fill="#f8fafc" />
      <path d="M90 30 71 44 77 18Z" fill="#f8fafc" />
      <ellipse cx="60" cy="63" rx="33" ry="33" fill="#f8fafc" />
      <path d="M39 38c-8 4-11 14-9 23 3-6 8-10 15-11Z" fill="#111827" />
      <path d="M80 40c8 3 12 12 11 20-4-6-8-9-14-11Z" fill="#111827" />
      <circle cx="48" cy="54" r="8.8" fill="#111827" />
      <circle cx="72" cy="54" r="8.8" fill="#111827" />
      <circle cx="48" cy="54" r="3.4" fill="#f8fafc" />
      <circle cx="72" cy="54" r="3.4" fill="#f8fafc" />
      <path d="M60 66l-7 6h14z" fill="#f9a8d4" />
      {lucienMouth(mood)}
      <path d="M31 69h16M73 69h16" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
      {mood === "tempting" ? (
        <path d="M44 44c4-4 8-5 12-4" stroke="#111827" strokeWidth="2.8" strokeLinecap="round" />
      ) : null}
    </svg>
  );
}

export function PetAvatar({
  pet,
  mood = "happy",
  size = "md",
  animated = true,
  className
}: PetAvatarProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/10 bg-petwarm",
        sizeMap[size],
        className
      )}
      animate={animated ? moodMotion(mood) : undefined}
      transition={animated ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      {pet === "dante" ? <DanteFace mood={mood} /> : null}
      {pet === "tomasa" ? <TomasaFace mood={mood} /> : null}
      {pet === "lucien" ? <LucienFace mood={mood} /> : null}
    </motion.div>
  );
}
