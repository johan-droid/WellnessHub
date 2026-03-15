"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface RevealWrapperProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  className?: string;
  duration?: number;
}

export function RevealWrapper({ 
  children, 
  direction = 'up', 
  delay = 0, 
  className = "",
  duration = 0.8
}: RevealWrapperProps) {
  
  const getInitial = () => {
    switch(direction) {
      case 'up': return { opacity: 0, y: 30 }
      case 'down': return { opacity: 0, y: -30 }
      case 'left': return { opacity: 0, x: -30 }
      case 'right': return { opacity: 0, x: 30 }
      case 'none': return { opacity: 0 }
    }
  }

  const getAnimate = () => {
    switch(direction) {
      case 'up': case 'down': return { opacity: 1, y: 0 }
      case 'left': case 'right': return { opacity: 1, x: 0 }
      case 'none': return { opacity: 1 }
    }
  }

  return (
    <motion.div
      initial={getInitial()}
      whileInView={getAnimate()}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ 
        duration: duration, 
        delay: delay, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
