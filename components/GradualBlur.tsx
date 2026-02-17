'use client'

interface GradualBlurProps {
  position?: 'top' | 'bottom'
  strength?: number
  height?: string
  animated?: 'none' | 'scroll'
  curve?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
  divCount?: number
}

export default function GradualBlur({
  position = 'bottom',
  strength = 3,
  height = '20rem',
  animated = 'none',
  curve = 'ease-out',
  divCount = 8,
}: GradualBlurProps) {
  const isBottom = position === 'bottom'

  const layers = Array.from({ length: divCount }, (_, i) => {
    const progress = i / (divCount - 1)
    const blurValue = strength * progress
    
    let opacity: number
    switch (curve) {
      case 'ease-in':
        opacity = progress * progress
        break
      case 'ease-out':
        opacity = 1 - (1 - progress) * (1 - progress)
        break
      case 'ease-in-out':
        opacity = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2
        break
      default:
        opacity = progress
    }

    return { blurValue, opacity }
  })

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-10"
      style={{
        height,
        ...(isBottom ? { bottom: 0 } : { top: 0 }),
      }}
    >
      {layers.map((layer, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            backdropFilter: `blur(${layer.blurValue}px)`,
            WebkitBackdropFilter: `blur(${layer.blurValue}px)`,
            maskImage: isBottom
              ? `linear-gradient(to bottom, transparent ${((i / divCount) * 100).toFixed(1)}%, black ${(((i + 1) / divCount) * 100).toFixed(1)}%)`
              : `linear-gradient(to top, transparent ${((i / divCount) * 100).toFixed(1)}%, black ${(((i + 1) / divCount) * 100).toFixed(1)}%)`,
            WebkitMaskImage: isBottom
              ? `linear-gradient(to bottom, transparent ${((i / divCount) * 100).toFixed(1)}%, black ${(((i + 1) / divCount) * 100).toFixed(1)}%)`
              : `linear-gradient(to top, transparent ${((i / divCount) * 100).toFixed(1)}%, black ${(((i + 1) / divCount) * 100).toFixed(1)}%)`,
          }}
        />
      ))}
    </div>
  )
}
