import type {
  RefObject,
} from 'react'

import type { CoachContextData } from '../../services/types/coach'
import { CoachCapabilities } from './CoachCapabilities'
import { CoachChat } from './CoachChat'
import { CoachContextCard } from './CoachContextCard'
import { CoachErrorState } from './CoachErrorState'
import { CoachHero } from './CoachHero'
import type { CoachDisplayMessage } from './CoachMessageBubble'
import {
  CoachContextSkeleton,
  CoachHeroSkeleton,
} from './CoachSkeleton'
import { SuggestedPrompts } from './SuggestedPrompts'

interface CoachContentProps {
  context?: CoachContextData
  isContextLoading: boolean
  isContextRetrying: boolean
  contextError: string | null
  messages: CoachDisplayMessage[]
  composerValue: string
  composerRef: RefObject<HTMLTextAreaElement | null>
  isSending: boolean
  chatError: string | null
  canRetryChat: boolean
  userName: string
  userAvatarUrl?: string | null
  onStartChat: () => void
  onRetryContext: () => void
  onComposerChange: (value: string) => void
  onSendComposer: () => void
  onPrompt: (prompt: string) => void
  onRetryChat: () => void
}

export function CoachContent({
  context,
  isContextLoading,
  isContextRetrying,
  contextError,
  messages,
  composerValue,
  composerRef,
  isSending,
  chatError,
  canRetryChat,
  userName,
  userAvatarUrl,
  onStartChat,
  onRetryContext,
  onComposerChange,
  onSendComposer,
  onPrompt,
  onRetryChat,
}: CoachContentProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        {isContextLoading && !context ? (
          <CoachHeroSkeleton />
        ) : (
          <CoachHero
            context={context}
            onStartChat={onStartChat}
          />
        )}

        {isContextLoading && !context ? (
          <CoachContextSkeleton />
        ) : context ? (
          <CoachContextCard context={context} />
        ) : (
          <CoachErrorState
            description={
              contextError ||
              'Rocco can still chat with you. Retry to refresh your live Coach Context.'
            }
            isRetrying={isContextRetrying}
            onRetry={onRetryContext}
          />
        )}
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <CoachChat
          messages={messages}
          composerValue={composerValue}
          composerRef={composerRef}
          isSending={isSending}
          chatError={chatError}
          canRetry={canRetryChat}
          userName={userName}
          userAvatarUrl={userAvatarUrl}
          onComposerChange={onComposerChange}
          onSendComposer={onSendComposer}
          onPrompt={onPrompt}
          onRetry={onRetryChat}
        />

        <aside className="min-w-0 space-y-5">
          <CoachCapabilities
            disabled={isSending}
            onPrompt={onPrompt}
          />
          <SuggestedPrompts
            context={context}
            disabled={isSending}
            onPrompt={onPrompt}
          />
        </aside>
      </div>
    </div>
  )
}
