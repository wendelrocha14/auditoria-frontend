'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FooterButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  disabled?: boolean
  className?: string
  icon?: React.ReactNode
}

export function FooterButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  className,
  icon
}: FooterButtonProps) {
  const variants = {
    primary: 'bg-foreground text-background',
    secondary: 'bg-secondary text-foreground',
    success: 'gradient-green text-white',
    danger: 'gradient-red text-white',
  }

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full py-4 px-6 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all',
        variants[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {icon}
      {children}
    </motion.button>
  )
}

interface StickyFooterProps {
  children: React.ReactNode
  className?: string
}

export function StickyFooter({ children, className }: StickyFooterProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'fixed bottom-0 left-0 right-0 p-4 glass safe-bottom',
        className
      )}
    >
      <div className="max-w-lg mx-auto">
        {children}
      </div>
    </motion.div>
  )
}
