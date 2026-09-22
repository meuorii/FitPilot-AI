import type { CoachChatMessage } from '../../services/types/coach'
import roccoCoach from '../../assets/images/rocco-coach-hero.png'

export interface CoachDisplayMessage
  extends CoachChatMessage {
  id: string
  createdAt: number
  delivery: 'sent' | 'failed'
}

interface CoachMessageBubbleProps {
  message: CoachDisplayMessage
  userName: string
  userAvatarUrl?: string | null
}

const formatTime = (timestamp: number) =>
  new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp))

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'FP'

export function CoachMessageBubble({
  message,
  userName,
  userAvatarUrl,
}: CoachMessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <article
      className={`flex items-end gap-2.5 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser ? (
        <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-[#7482A4]/15 bg-[#F5F3F6]">
          <img
            src={roccoCoach}
            alt=""
            className="h-12 w-12 object-cover object-top"
          />
        </div>
      ) : null}

      <div
        className={`max-w-[82%] sm:max-w-[72%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={[
            'rounded-[18px] px-4 py-3 text-[13px] leading-5 shadow-sm',
            isUser
              ? 'rounded-br-md bg-[#7482A4]/13 text-[#38323F]'
              : 'rounded-bl-md border border-[#7482A4]/10 bg-[#FAF9FB] text-[#38323F]',
            message.delivery === 'failed'
              ? 'border border-[#B96F78]/35'
              : '',
          ].join(' ')}
        >
          <p className="whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>

        <div
          className={`mt-1 flex items-center gap-2 px-1 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
        >
          <span className="text-[10px] font-medium text-[#9A949E]">
            {formatTime(message.createdAt)}
          </span>
          {message.delivery === 'failed' ? (
            <span className="text-[10px] font-bold text-[#B96F78]">
              Not sent
            </span>
          ) : null}
        </div>
      </div>

      {isUser ? (
        userAvatarUrl ? (
          <img
            src={userAvatarUrl}
            alt=""
            className="h-9 w-9 shrink-0 rounded-full border border-[#7482A4]/15 object-cover"
          />
        ) : (
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#7482A4] text-[10px] font-extrabold text-white">
            {getInitials(userName)}
          </div>
        )
      ) : null}
    </article>
  )
}
