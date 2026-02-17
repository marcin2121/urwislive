'use client'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

// ZMIANA: Rozszerzamy HTMLMotionProps<"button"> zamiast React.ButtonHTMLAttributes
interface JellyButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'blue'
  children: React.ReactNode
}

export default function JellyButton({ className, variant = 'primary', children, ...props }: JellyButtonProps) {
  
  const variants = {
    primary: "bg-linear-to-b from-red-500 to-red-600 shadow-red-500/40 text-white border-b-4 border-red-700 active:border-b-0",
    secondary: "bg-white text-gray-800 shadow-gray-200 border-2 border-gray-100 hover:border-blue-200",
    blue: "bg-linear-to-b from-blue-500 to-blue-600 shadow-blue-500/40 text-white border-b-4 border-blue-700 active:border-b-0"
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05, translateY: -2 }}
      whileTap={{ scale: 0.95, rotate: -1, translateY: 2 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={cn(
        "relative px-8 py-4 rounded-2xl font-black font-heading tracking-wide shadow-xl transition-all overflow-hidden group cursor-pointer",
        // Efekt błysku (shine effect)
        "after:absolute after:inset-0 after:bg-linear-to-r after:from-transparent after:via-white/30 after:to-transparent after:-translate-x-[150%] group-hover:after:translate-x-[150%] after:transition-transform after:duration-700",
        variants[variant],
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}