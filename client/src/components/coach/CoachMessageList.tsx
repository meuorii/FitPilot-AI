import {
  useEffect,
  useRef,
  useState,
  type UIEvent,
} from 'react'

import type { CoachDisplayMessage } from './CoachMessageBubble'
import { CoachMessageBubble } from './CoachMessageBubble'

interface CoachMessageListProps {
  messages: CoachDisplayMessage[]
  isThinking: boolean
  userName: string
  userAvatarUrl?: string | null
}

export function CoachMessageList({
  messages,
  isThinking,
  userName,
  userAvatarUrl,
}: CoachMessageListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [stickToBottom, setStickToBottom] = useState(true)

  useEffect(() => {
    const container = containerRef.current

    if (!container || !stickToBottom) return

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages.length, isThinking, stickToBottom])

  const handleScroll = (
    event: UIEvent<HTMLDivElement>,
  ) => {
    const target = event.currentTarget
    const distanceFromBottom =
      target.scrollHeight -
      target.scrollTop -
      target.clientHeight

    setStickToBottom(distanceFromBottom < 120)
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1 py-2 pr-2 [scrollbar-width:thin] [scrollbar-color:#CBD0DC_transparent]"
      aria-live="polite"
      aria-label="AI Coach conversation"
    >
      {messages.map((message) => (
        <CoachMessageBubble
          key={message.id}
          message={message}
          userName={userName}
          userAvatarUrl={userAvatarUrl}
        />
      ))}

      {isThinking ? (
        <div className="flex items-end gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#7482A4]/10 text-sm">
            🐺
          </div>
          <div className="rounded-[18px] rounded-bl-md border border-[#7482A4]/10 bg-[#FAF9FB] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7482A4] [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7482A4] [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7482A4]" />
              <span className="ml-1 text-xs font-semibold text-[#8B8690]">
                Rocco is thinking...
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
