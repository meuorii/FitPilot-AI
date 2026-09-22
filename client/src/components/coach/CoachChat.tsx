import type { RefObject } from 'react'
import {
  AlertCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react'

import type { CoachDisplayMessage } from './CoachMessageBubble'
import { CoachComposer } from './CoachComposer'
import { CoachEmptyState } from './CoachEmptyState'
import { CoachMessageList } from './CoachMessageList'
import { CoachQuickPrompts } from './CoachQuickPrompts'

interface CoachChatProps {
  messages: CoachDisplayMessage[]
  composerValue: string
  composerRef: RefObject<HTMLTextAreaElement | null>
  isSending: boolean
  chatError: string | null
  canRetry: boolean
  userName: string
  userAvatarUrl?: string | null
  onComposerChange: (value: string) => void
  onSendComposer: () => void
  onPrompt: (prompt: string) => void
  onRetry: () => void
}

export function CoachChat({
  messages,
  composerValue,
  composerRef,
  isSending,
  chatError,
  canRetry,
  userName,
  userAvatarUrl,
  onComposerChange,
  onSendComposer,
  onPrompt,
  onRetry,
}: CoachChatProps) {
  return (
    <section
      id="coach-chat"
      className="flex h-[clamp(590px,70vh,760px)] min-h-[590px] flex-col rounded-[24px] border border-[#7482A4]/12 bg-white p-4 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#7482A4]/10 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#7482A4]" />
          <h2 className="text-lg font-extrabold tracking-[-0.025em] text-[#38323F]">
            AI Coach Chat
          </h2>
        </div>

        <span className="text-[10px] font-bold text-[#7482A4]">
          ✦ Powered by FitPilot AI
        </span>
      </div>

      <div className="min-h-0 flex-1 py-3">
        {messages.length === 0 && !isSending ? (
          <CoachEmptyState
            disabled={isSending}
            onPrompt={onPrompt}
          />
        ) : (
          <CoachMessageList
            messages={messages}
            isThinking={isSending}
            userName={userName}
            userAvatarUrl={userAvatarUrl}
          />
        )}
      </div>

      {chatError ? (
        <div
          role="alert"
          className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-[#B96F78]/20 bg-[#B96F78]/[0.06] px-3 py-2.5"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-[#B96F78]" />
          <p className="min-w-0 flex-1 text-xs font-semibold text-[#8B555E]">
            {chatError}
          </p>
          {canRetry ? (
            <button
              type="button"
              onClick={onRetry}
              disabled={isSending}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-extrabold text-[#B96F78] transition hover:bg-[#B96F78]/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B96F78]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      {messages.length > 0 ? (
        <div className="mb-3">
          <CoachQuickPrompts
            disabled={isSending}
            onPrompt={onPrompt}
          />
        </div>
      ) : null}

      <CoachComposer
        value={composerValue}
        textareaRef={composerRef}
        disabled={isSending}
        onChange={onComposerChange}
        onSend={onSendComposer}
      />
    </section>
  )
}
