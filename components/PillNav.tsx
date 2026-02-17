'use client'

import React, { useState } from 'react'
import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'

export interface PillNavItem {
  label: string
  href: string
}

export interface PillNavProps {
  logo: string | StaticImageData
  logoAlt: string
  items: PillNavItem[]
  activeHref?: string
  className?: string
  ease?: string
  baseColor?: string
  pillColor?: string
  hoveredPillTextColor?: string
  pillTextColor?: string
  theme?: 'color' | 'light' | 'dark'
  initialLoadAnimation?: boolean
}

export default function PillNav({
  logo,
  logoAlt,
  items,
  activeHref = '/',
  className = '',
  baseColor = '#bf2024',
  pillColor = '#ffffff',
  hoveredPillTextColor = '#ffffff',
  pillTextColor = '#000000',
  theme = 'color',
  initialLoadAnimation = false,
}: PillNavProps) {
  const [hoveredHref, setHoveredHref] = useState<string | null>(null)

  const logoSrc = typeof logo === 'string' ? logo : (logo as StaticImageData).src
  const logoWidth = typeof logo === 'string' ? undefined : (logo as StaticImageData).width
  const logoHeight = typeof logo === 'string' ? undefined : (logo as StaticImageData).height

  return (
    <nav
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        padding: '1rem 2rem',
        pointerEvents: 'auto',
        backgroundColor: 'rgba(255, 255, 255, 0)',
      }}
    >
      <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
        <Image
          src={logoSrc}
          alt={logoAlt}
          width={logoWidth ?? 120}
          height={logoHeight ?? 48}
          style={{ height: 'auto', maxHeight: '48px', width: 'auto' }}
        />
      </Link>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {items.map((item) => {
          const isActive = activeHref === item.href
          const isHovered = hoveredHref === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredHref(item.href)}
              onMouseLeave={() => setHoveredHref(null)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                backgroundColor: isActive || isHovered ? baseColor : pillColor,
                color: isActive || isHovered ? hoveredPillTextColor : pillTextColor,
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'background-color 0.2s, color 0.2s',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
