import {
  Camera,
  CalendarDays,
  Droplet,
  ImageOff,
  Scale,
} from 'lucide-react'
import {
  useEffect,
  useState,
  type SyntheticEvent,
} from 'react'

import type { ProgressLog } from '../../services/types/progress'
import { ProgressEmptyState } from './ProgressEmptyState'
import {
  formatBodyFat,
  formatDate,
  formatWeight,
} from './progress.utils'

interface LatestCheckInCardProps {
  checkIn: ProgressLog | null
  onLogCheckIn: () => void
}

export function LatestCheckInCard({
  checkIn,
  onLogCheckIn,
}: LatestCheckInCardProps) {
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [checkIn?.photo_url])

  if (!checkIn) {
    return (
      <section className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-[#7482A4]" />
          <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
            Latest Check-In
          </h2>
        </div>

        <ProgressEmptyState
          title="No check-in yet"
          description="Log your first check-in to start tracking progress."
          icon={CalendarDays}
          actionLabel="Log Check-In"
          onAction={onLogCheckIn}
          compact
        />
      </section>
    )
  }

  const showPhoto = Boolean(checkIn.photo_url) && !imageFailed

  return (
    <section className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-[#7482A4]" />
        <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
          Latest Check-In
        </h2>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_132px]">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#7482A4]/[0.06] p-3">
            <Scale className="h-4 w-4 text-[#7482A4]" />
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.06em] text-[#918B95]">
              Weight
            </p>
            <p className="mt-1 text-base font-extrabold text-[#38323F]">
              {formatWeight(checkIn.weight_kg)}
            </p>
          </div>

          <div className="rounded-2xl bg-[#7482A4]/[0.06] p-3">
            <Droplet className="h-4 w-4 text-[#7482A4]" />
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.06em] text-[#918B95]">
              Body Fat
            </p>
            <p className="mt-1 text-base font-extrabold text-[#38323F]">
              {formatBodyFat(checkIn.body_fat_percentage)}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-[#7482A4]/10 px-3.5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#918B95]">
              Logged On
            </p>
            <p className="mt-1 text-sm font-extrabold text-[#38323F]">
              {formatDate(checkIn.logged_at)}
            </p>
          </div>
        </div>

        <div>
          <div className="aspect-square overflow-hidden rounded-2xl border border-[#7482A4]/10 bg-[#F5F3F6]">
            {showPhoto ? (
              <img
                src={checkIn.photo_url ?? ''}
                alt={`${checkIn.photo_tag || 'Progress'} check-in`}
                className="h-full w-full object-cover"
                onError={(
                  _event: SyntheticEvent<HTMLImageElement>,
                ) => setImageFailed(true)}
              />
            ) : (
              <div className="grid h-full place-items-center text-center">
                <div>
                  {checkIn.photo_url ? (
                    <ImageOff className="mx-auto h-5 w-5 text-[#9B96A0]" />
                  ) : (
                    <Camera className="mx-auto h-5 w-5 text-[#9B96A0]" />
                  )}
                  <p className="mt-2 text-[10px] font-semibold text-[#9B96A0]">
                    {checkIn.photo_url
                      ? 'Photo unavailable'
                      : 'No photo'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {checkIn.photo_tag ? (
            <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.05em] text-[#7482A4]">
              {checkIn.photo_tag}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
