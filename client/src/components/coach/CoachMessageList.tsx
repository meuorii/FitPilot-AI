import {
  useEffect,
  useRef,
  useState,
  type UIEvent,
} from 'react'

import roccoCoachAvatar from '../../assets/images/rocco-coach-avatar.png'
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
  const containerRef =
    useRef<HTMLDivElement | null>(null)
  const contentRef =
    useRef<HTMLDivElement | null>(null)

  const [stickToBottom, setStickToBottom] =
    useState(true)

  const scrollToBottom = (
    behavior: ScrollBehavior = 'smooth',
  ) => {
    const container = containerRef.current

    if (!container) return

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    })
  }

  useEffect(() => {
    if (!stickToBottom) return

    const frame = window.requestAnimationFrame(
      () => {
        scrollToBottom('smooth')
      },
    )

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [
    messages,
    isThinking,
    stickToBottom,
  ])

  useEffect(() => {
    const content = contentRef.current

    if (!content) return

    const observer = new ResizeObserver(() => {
      if (!stickToBottom) return
      scrollToBottom('auto')
    })

    observer.observe(content)

    return () => {
      observer.disconnect()
    }
  }, [stickToBottom])

  const handleScroll = (
    event: UIEvent<HTMLDivElement>,
  ) => {
    const target = event.currentTarget

    const distanceFromBottom =
      target.scrollHeight -
      target.scrollTop -
      target.clientHeight

    setStickToBottom(
      distanceFromBottom < 100,
    )
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full min-h-0 overflow-y-auto overscroll-contain pr-2 [scrollbar-color:#CBD0DC_transparent] [scrollbar-width:thin]"
      aria-live="polite"
      aria-label="AI Coach conversation"
    >
      <div
        ref={contentRef}
        className="space-y-4 px-1 pb-2 pt-1"
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
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#7482A4]/20 bg-[#F5F3F6] shadow-sm">
              <img
                src={roccoCoachAvatar}
                alt="Rocco"
                className="h-full w-full rounded-full object-cover object-center"
                draggable={false}
              />
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
    </div>
  )
}