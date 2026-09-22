import {
  useEffect,
  type ChangeEvent,
  type KeyboardEvent,
  type RefObject,
} from 'react'
import {
  Paperclip,
  Send,
} from 'lucide-react'

interface CoachComposerProps {
  value: string
  textareaRef: RefObject<HTMLTextAreaElement | null>
  disabled: boolean
  onChange: (value: string) => void
  onSend: () => void
}

export function CoachComposer({
  value,
  textareaRef,
  disabled,
  onChange,
  onSend,
}: CoachComposerProps) {
  useEffect(() => {
    const textarea = textareaRef.current

    if (!textarea) return

    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      128,
    )}px`
  }, [value, textareaRef])

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault()

      if (!disabled && value.trim()) {
        onSend()
      }
    }
  }

  return (
    <div className="rounded-2xl border border-[#7482A4]/15 bg-white p-2 shadow-[0_6px_18px_rgba(56,50,63,0.04)] focus-within:border-[#7482A4]/40 focus-within:ring-2 focus-within:ring-[#7482A4]/10">
      <div className="flex items-end gap-2">
        <button
          type="button"
          disabled
          title="Attachments coming soon"
          aria-label="Attachments coming soon"
          className="grid h-10 w-10 shrink-0 cursor-not-allowed place-items-center rounded-xl text-[#A39EA7] opacity-60"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <label className="min-w-0 flex-1">
          <span className="sr-only">
            Ask Rocco a question
          </span>
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            disabled={disabled}
            onKeyDown={handleKeyDown}
            onChange={(
              event: ChangeEvent<HTMLTextAreaElement>,
            ) => onChange(event.target.value)}
            placeholder="Ask Rocco anything about workouts, nutrition, or recovery..."
            className="max-h-32 min-h-10 w-full resize-none bg-transparent px-1 py-2.5 text-sm leading-5 text-[#38323F] outline-none placeholder:text-[#AAA5AE] disabled:cursor-not-allowed disabled:opacity-65"
          />
        </label>

        <button
          type="button"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#7482A4] text-white shadow-sm transition hover:bg-[#657493] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7482A4] focus-visible:ring-offset-2"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
