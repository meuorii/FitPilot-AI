import { Utensils } from 'lucide-react'
import { useState } from 'react'

interface MealImageProps {
  src?: string | null
  alt?: string
  className?: string
}

export function MealImage({
  src,
  alt = '',
  className = '',
}: MealImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        aria-hidden="true"
        className={`grid place-items-center bg-[#7482A4]/10 text-[#7482A4] ${className}`}
      >
        <Utensils className="h-5 w-5" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  )
}
