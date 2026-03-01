'use client'

import React from 'react'

export default function CloseWindowButton({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <button onClick={() => window.close()} className={className}>
      {children}
    </button>
  )
}
