"use client";

import { CursorIcon } from "./Icons";
import { motion } from "motion/react";

export function Logo({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  // Animation variants for the cursor icon
  const cursorVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1, transition: { duration: 0.2 } }
  };
  
  // Animation variants for the dot
  const dotVariants = {
    initial: { scale: 1, opacity: 0.8 },
    hover: { 
      scale: [1, 1.5, 1], 
      opacity: 1,
      transition: { 
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };
  
  // Animation variants for the ninja emoji
  const ninjaVariants = {
    initial: { rotate: 0, y: 0 },
    hover: { 
      rotate: [-5, 5, -5], 
      y: [-2, 0, -2],
      transition: { 
        duration: 1.5, 
        repeat: Infinity, 
        repeatType: "reverse" as const
      }
    }
  };

  return (
    <motion.div 
      className="flex items-center gap-2"
      initial="initial"
      whileHover="hover"
    >
      <motion.div className="relative">
        <motion.div variants={cursorVariants}>
          <CursorIcon className={`${sizeClasses[size]} text-electric-500`} />
        </motion.div>
        <motion.div 
          className="absolute -top-1 -right-1 w-2 h-2 bg-electric-500 rounded-full"
          variants={dotVariants}
        />
        <motion.div 
          className="absolute -top-3 -right-3"
          variants={ninjaVariants}
        >
          <span role="img" aria-label="ninja" className={`text-sm ${size === "lg" ? "text-base" : size === "md" ? "text-sm" : "text-xs"}`}>
            🥷
          </span>
        </motion.div>
      </motion.div>
      <span className={`font-bold tracking-tighter ${sizeClasses[size]}`}>
        cursor<span className="text-electric-500">.ninja</span>
      </span>
    </motion.div>
  );
} 