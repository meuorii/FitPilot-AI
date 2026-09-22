import type { ReactNode } from 'react'

interface CoachFormattedMessageProps {
  content: string
  isAssistant: boolean
}

interface WorkoutRow {
  exercise: string
  sets: string
  reps: string
  rest: string
}

type MessageBlock =
  | {
      type: 'heading'
      text: string
    }
  | {
      type: 'paragraph'
      text: string
    }
  | {
      type: 'list'
      items: string[]
    }
  | {
      type: 'workout'
      title?: string
      rows: WorkoutRow[]
    }

const stripBold = (value: string) =>
  value.replace(/\*\*/g, '').trim()

const cleanText = (value: string) =>
  value
    .replace(/^\s*[-•]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()

const isDividerCell = (value: string) =>
  /^:?-{2,}:?$/.test(value.trim())

const normalizeContent = (value: string) =>
  value
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

const normalizedCell = (value: string) =>
  stripBold(value)
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase()

const findWorkoutHeaderIndex = (
  cells: string[],
) => {
  for (let index = 0; index <= cells.length - 4; index += 1) {
    const candidate = cells
      .slice(index, index + 4)
      .map(normalizedCell)

    if (
      candidate[0] === 'exercise' &&
      candidate[1] === 'sets' &&
      candidate[2] === 'reps' &&
      candidate[3] === 'rest'
    ) {
      return index
    }
  }

  return -1
}

const parseWorkoutLine = (
  line: string,
): {
  prefix: string | null
  rows: WorkoutRow[]
  trailing: string | null
} | null => {
  if (!line.includes('|')) return null

  const cells = line
    .split('|')
    .map((cell) => cell.trim())
    .filter(Boolean)

  const headerIndex = findWorkoutHeaderIndex(cells)

  if (headerIndex < 0) return null

  const prefix =
    cells
      .slice(0, headerIndex)
      .filter((cell) => !isDividerCell(cell))
      .join(' ')
      .trim() || null

  const sourceCells = cells
    .slice(headerIndex + 4)
    .filter((cell) => !isDividerCell(cell))

  const workoutCells: string[] = []
  let trailing: string | null = null

  for (const cell of sourceCells) {
    const boldIndex = cell.indexOf('**')

    if (
      workoutCells.length >= 4 &&
      workoutCells.length % 4 === 0 &&
      boldIndex === 0
    ) {
      trailing = [
        cell,
        ...sourceCells.slice(
          sourceCells.indexOf(cell) + 1,
        ),
      ]
        .join(' ')
        .trim()

      break
    }

    if (
      boldIndex > 0 &&
      workoutCells.length % 4 === 3
    ) {
      const before = cell
        .slice(0, boldIndex)
        .trim()
      const after = cell
        .slice(boldIndex)
        .trim()

      if (before) {
        workoutCells.push(before)
      }

      trailing = after || null
      break
    }

    workoutCells.push(cell)
  }

  const rows: WorkoutRow[] = []

  for (
    let index = 0;
    index + 3 < workoutCells.length;
    index += 4
  ) {
    const [exercise, sets, reps, rest] =
      workoutCells.slice(index, index + 4)

    if (!exercise) continue

    rows.push({
      exercise: stripBold(exercise),
      sets: stripBold(sets || '—'),
      reps: stripBold(reps || '—'),
      rest: stripBold(rest || '—'),
    })
  }

  if (rows.length === 0) return null

  return {
    prefix,
    rows,
    trailing,
  }
}

const isStandaloneHeading = (line: string) => {
  const trimmed = line.trim()

  return (
    /^#{1,6}\s+/.test(trimmed) ||
    /^\*\*[^*]{2,90}\*\*$/.test(trimmed)
  )
}

const headingText = (line: string) =>
  stripBold(
    line
      .trim()
      .replace(/^#{1,6}\s+/, ''),
  )

const buildBlocks = (
  rawContent: string,
): MessageBlock[] => {
  const content = normalizeContent(rawContent)
  const lines = content.split('\n')
  const blocks: MessageBlock[] = []

  let index = 0

  while (index < lines.length) {
    const current = lines[index]?.trim() || ''

    if (!current) {
      index += 1
      continue
    }

    const workout = parseWorkoutLine(current)

    if (workout) {
      if (workout.prefix) {
        const prefix = stripBold(workout.prefix)

        if (prefix) {
          blocks.push({
            type: 'heading',
            text: prefix,
          })
        }
      }

      blocks.push({
        type: 'workout',
        rows: workout.rows,
      })

      if (workout.trailing) {
        blocks.push(
          ...buildBlocks(workout.trailing),
        )
      }

      index += 1
      continue
    }

    if (isStandaloneHeading(current)) {
      blocks.push({
        type: 'heading',
        text: headingText(current),
      })
      index += 1
      continue
    }

    if (/^[-•]\s+/.test(current)) {
      const items: string[] = []

      while (index < lines.length) {
        const itemLine =
          lines[index]?.trim() || ''

        if (
          !itemLine ||
          !/^[-•]\s+/.test(itemLine)
        ) {
          break
        }

        items.push(cleanText(itemLine))
        index += 1
      }

      if (items.length > 0) {
        blocks.push({
          type: 'list',
          items,
        })
      }

      continue
    }

    if (current.includes('|')) {
      const readable = current
        .split('|')
        .map(cleanText)
        .filter(
          (part) =>
            part &&
            !isDividerCell(part),
        )

      if (readable.length > 0) {
        blocks.push({
          type: 'list',
          items: readable,
        })
      }

      index += 1
      continue
    }

    const paragraphLines: string[] = []

    while (index < lines.length) {
      const paragraphLine =
        lines[index]?.trim() || ''

      if (
        !paragraphLine ||
        isStandaloneHeading(paragraphLine) ||
        /^[-•]\s+/.test(paragraphLine) ||
        paragraphLine.includes('|')
      ) {
        break
      }

      paragraphLines.push(
        cleanText(paragraphLine),
      )
      index += 1
    }

    if (paragraphLines.length > 0) {
      blocks.push({
        type: 'paragraph',
        text: paragraphLines.join(' '),
      })
      continue
    }

    index += 1
  }

  return blocks
}

const renderInline = (
  text: string,
): ReactNode[] => {
  const parts = text.split(
    /(\*\*[^*]+\*\*)/g,
  )

  return parts
    .filter(Boolean)
    .map((part, index) => {
      if (
        /^\*\*[^*]+\*\*$/.test(part)
      ) {
        return (
          <strong
            key={`${part}-${index}`}
            className="font-extrabold text-[#38323F]"
          >
            {part.replace(
              /^\*\*|\*\*$/g,
              '',
            )}
          </strong>
        )
      }

      return (
        <span key={`${part}-${index}`}>
          {part}
        </span>
      )
    })
}

function WorkoutPlan({
  rows,
}: {
  rows: WorkoutRow[]
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#7482A4]/12 bg-white">
      <div className="border-b border-[#7482A4]/10 bg-[#F5F3F6] px-3.5 py-2.5">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#5E6C8C]">
          Exercise Plan
        </p>
      </div>

      <div className="divide-y divide-[#7482A4]/10">
        {rows.map((row, index) => (
          <div
            key={`${row.exercise}-${index}`}
            className="px-3.5 py-3"
          >
            <p className="text-[13px] font-extrabold leading-5 text-[#38323F]">
              {row.exercise}
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-lg bg-[#7482A4]/10 px-2 py-1 text-[10px] font-bold text-[#5E6C8C]">
                {row.sets} sets
              </span>

              <span className="rounded-lg bg-[#7482A4]/10 px-2 py-1 text-[10px] font-bold text-[#5E6C8C]">
                {row.reps} reps
              </span>

              <span className="rounded-lg bg-[#7482A4]/10 px-2 py-1 text-[10px] font-bold text-[#5E6C8C]">
                {row.rest} rest
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CoachFormattedMessage({
  content,
  isAssistant,
}: CoachFormattedMessageProps) {
  if (!isAssistant) {
    return (
      <p className="whitespace-pre-wrap break-words">
        {content}
      </p>
    )
  }

  const blocks = buildBlocks(content)

  if (blocks.length === 0) {
    return (
      <p className="whitespace-pre-wrap break-words text-[13px] leading-6 text-[#4E4854]">
        {content}
      </p>
    )
  }

  return (
    <div className="space-y-3.5 break-words">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h4
              key={`heading-${index}`}
              className="pt-0.5 text-[13px] font-extrabold leading-5 text-[#38323F]"
            >
              {renderInline(block.text)}
            </h4>
          )
        }

        if (block.type === 'paragraph') {
          return (
            <p
              key={`paragraph-${index}`}
              className="text-[13px] leading-6 text-[#4E4854]"
            >
              {renderInline(block.text)}
            </p>
          )
        }

        if (block.type === 'list') {
          return (
            <ul
              key={`list-${index}`}
              className="space-y-2 pl-5 text-[13px] leading-6 text-[#4E4854]"
            >
              {block.items.map(
                (item, itemIndex) => (
                  <li
                    key={`item-${index}-${itemIndex}`}
                    className="list-disc pl-0.5 marker:text-[#7482A4]"
                  >
                    {renderInline(item)}
                  </li>
                ),
              )}
            </ul>
          )
        }

        if (block.type === 'workout') {
          return (
            <WorkoutPlan
              key={`workout-${index}`}
              rows={block.rows}
            />
          )
        }

        return null
      })}
    </div>
  )
}
