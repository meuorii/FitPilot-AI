import {
  Dumbbell,
  ImageOff,
} from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'

interface WorkoutExerciseImageProps {
  imageUrl: string | null | undefined
  name: string
  className?: string
  fallbackClassName?: string
}

export function WorkoutExerciseImage({
  imageUrl,
  name,
  className = '',
  fallbackClassName = '',
}: WorkoutExerciseImageProps) {
  const [failed, setFailed] =
    useState(false)

  useEffect(() => {
    setFailed(false)
  }, [imageUrl])

  if (!imageUrl || failed) {
    return (
      <div
        aria-label={`${name} image unavailable`}
        className={[
          'grid place-items-center overflow-hidden bg-gradient-to-br from-[#F2F3F7] to-[#E8EAF0] text-[#7482A4]',
          className,
          fallbackClassName,
        ].join(' ')}
      >
        <div className="text-center">
          {imageUrl ? (
            <ImageOff className="mx-auto h-6 w-6" />
          ) : (
            <Dumbbell className="mx-auto h-6 w-6" />
          )}
          <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.08em] text-[#8B8690]">
            {imageUrl
              ? 'Image unavailable'
              : 'No image'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      loading="lazy"
      onError={() =>
        setFailed(true)
      }
      className={[
        'bg-[#F5F3F6] object-contain',
        className,
      ].join(' ')}
      draggable={false}
    />
  )
}
