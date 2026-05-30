"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AnimatedGradient({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <motion.div
        className="absolute -inset-[40%] opacity-70 blur-3xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 48, ease: "linear", repeat: Infinity }}
        style={{
          background:
            "conic-gradient(from 180deg at 50% 50%, rgba(34,211,238,0.45), rgba(59,130,246,0.35), rgba(217,70,239,0.28), rgba(34,211,238,0.45))",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/20 to-black/60" />
    </div>
  );
}

