import {
  useRef,
  useState,
} from 'react'
import { useOutletContext } from 'react-router-dom'

import { CoachContent } from '../components/coach/CoachContent'
import type { CoachDisplayMessage } from '../components/coach/CoachMessageBubble'
import { getFirstName, PageHeader } from '../components/layout/PageHeader'
import {
  useCoachContext,
  useSendCoachMessage,
} from '../hooks/useCoach'
import { useDashboard } from '../hooks/useDashboard'
import type { DashboardLayoutContext } from '../layouts/MainDashboardLayout'
import type { CoachChatMessage } from '../services/types/coach'

interface FailedCoachRequest {
  messageId: string
  message: string
  history: CoachChatMessage[]
}

const createMessageId = () =>
  `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`

export function CoachPage() {
  const { openSidebar } =
    useOutletContext<DashboardLayoutContext>()

  const contextQuery = useCoachContext()
  const dashboardQuery = useDashboard()
  const sendMessageMutation = useSendCoachMessage()

  const [messages, setMessages] = useState<
    CoachDisplayMessage[]
  >([])
  const [composerValue, setComposerValue] =
    useState('')
  const [headerQuestion, setHeaderQuestion] =
    useState('')
  const [chatError, setChatError] = useState<
    string | null
  >(null)
  const [failedRequest, setFailedRequest] =
    useState<FailedCoachRequest | null>(null)

  const composerRef =
    useRef<HTMLTextAreaElement | null>(null)

  const context = contextQuery.data?.data
  const dashboardUser = dashboardQuery.data?.data.user

  const fullName =
    context?.user.full_name ||
    dashboardUser?.full_name ||
    'Athlete'
  const avatarUrl = dashboardUser?.avatar_url ?? null

  const focusComposer = () => {
    document
      .getElementById('coach-chat')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })

    window.setTimeout(() => {
      composerRef.current?.focus()
    }, 350)
  }

  const getPreviousHistory = (
    source: CoachDisplayMessage[],
  ): CoachChatMessage[] =>
    source
      .filter(
        (message) => message.delivery === 'sent',
      )
      .map(({ role, content }) => ({
        role,
        content,
      }))

  const submitMessage = (rawMessage: string) => {
    const trimmed = rawMessage.trim()

    if (
      !trimmed ||
      sendMessageMutation.isPending
    ) {
      return false
    }

    const previousHistory =
      getPreviousHistory(messages)
    const messageId = createMessageId()
    const userMessage: CoachDisplayMessage = {
      id: messageId,
      role: 'user',
      content: trimmed,
      createdAt: Date.now(),
      delivery: 'sent',
    }

    setMessages((current) => [
      ...current,
      userMessage,
    ])
    setChatError(null)
    setFailedRequest(null)

    void sendMessageMutation
      .mutateAsync({
        message: trimmed,
        history: previousHistory,
      })
      .then((response) => {
        const assistantMessage: CoachDisplayMessage =
          {
            id: createMessageId(),
            role: 'assistant',
            content: response.reply,
            createdAt: Date.now(),
            delivery: 'sent',
          }

        setMessages((current) => [
          ...current,
          assistantMessage,
        ])
      })
      .catch((error: unknown) => {
        setMessages((current) =>
          current.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  delivery: 'failed',
                }
              : message,
          ),
        )

        setFailedRequest({
          messageId,
          message: trimmed,
          history: previousHistory,
        })

        setChatError(
          error instanceof Error
            ? error.message
            : 'Rocco could not respond. Please try again.',
        )
      })

    return true
  }

  const handleSendComposer = () => {
    const accepted = submitMessage(composerValue)

    if (accepted) {
      setComposerValue('')
    }
  }

  const handlePrompt = (prompt: string) => {
    const accepted = submitMessage(prompt)

    if (accepted) {
      setComposerValue('')
    }
  }

  const handleHeaderSubmit = () => {
    const accepted = submitMessage(headerQuestion)

    if (accepted) {
      setHeaderQuestion('')
      focusComposer()
    }
  }

  const handleRetry = () => {
    if (
      !failedRequest ||
      sendMessageMutation.isPending
    ) {
      return
    }

    const request = failedRequest

    setMessages((current) =>
      current.map((message) =>
        message.id === request.messageId
          ? {
              ...message,
              delivery: 'sent',
            }
          : message,
      ),
    )
    setChatError(null)

    void sendMessageMutation
      .mutateAsync({
        message: request.message,
        history: request.history,
      })
      .then((response) => {
        setMessages((current) => [
          ...current,
          {
            id: createMessageId(),
            role: 'assistant',
            content: response.reply,
            createdAt: Date.now(),
            delivery: 'sent',
          },
        ])
        setFailedRequest(null)
      })
      .catch((error: unknown) => {
        setMessages((current) =>
          current.map((message) =>
            message.id === request.messageId
              ? {
                  ...message,
                  delivery: 'failed',
                }
              : message,
          ),
        )

        setChatError(
          error instanceof Error
            ? error.message
            : 'Rocco could not respond. Please try again.',
        )
      })
  }

  return (
    <>
      <PageHeader
        title={`Talk with Rocco, ${getFirstName(fullName)} 👋`}
        subtitle="Your AI fitness coach for workouts, meals, and daily guidance."
        fullName={fullName}
        avatarUrl={avatarUrl}
        onOpenSidebar={openSidebar}
        search={headerQuestion}
        onSearchChange={setHeaderQuestion}
        onSearchSubmit={handleHeaderSubmit}
        searchPlaceholder="Search workouts, meals, or ask Rocco..."
        searchDisabled={sendMessageMutation.isPending}
      />

      <CoachContent
        context={context}
        isContextLoading={contextQuery.isLoading}
        isContextRetrying={contextQuery.isFetching}
        contextError={
          contextQuery.error?.message ?? null
        }
        messages={messages}
        composerValue={composerValue}
        composerRef={composerRef}
        isSending={sendMessageMutation.isPending}
        chatError={chatError}
        canRetryChat={Boolean(failedRequest)}
        userName={fullName}
        userAvatarUrl={avatarUrl}
        onStartChat={focusComposer}
        onRetryContext={() => {
          void contextQuery.refetch()
        }}
        onComposerChange={setComposerValue}
        onSendComposer={handleSendComposer}
        onPrompt={handlePrompt}
        onRetryChat={handleRetry}
      />
    </>
  )
}