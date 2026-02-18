'use client'

import { useState, useEffect } from 'react'
import OfertaGrid from '@/components/OfertaGrid'

export default function OfertaPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-transparent pt-32 pb-24 relative overflow-hidden">
      <OfertaGrid />
    </main>
  )
}