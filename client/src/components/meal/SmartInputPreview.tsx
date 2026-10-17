import { useMemo } from 'react'
import { ClipboardPaste, ListChecks, Table } from 'lucide-react'

import { buildInputPreview } from './smartMeal.utils'

interface SmartInputPreviewProps {
  text: string
}

export function SmartInputPreview({ text }: SmartInputPreviewProps) {
  const preview = useMemo(() => buildInputPreview(text), [text])

  if (preview.kind === 'empty') {
    return (
      <div className="grid min-h-[200px] place-items-center rounded-2xl border border-dashed border-[#7482A4]/20 bg-[#FAF9FB] p-6 text-center">
        <div>
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-[#7482A4]/10 text-[#7482A4]">
            <ClipboardPaste className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-extrabold text-[#38323F]">
            Input preview
          </p>
          <p className="mt-1 max-w-xs text-xs leading-5 text-[#8B8690]">
            Type your meal or paste a nutrition table. We&apos;ll show what we
            detected here before analyzing it.
          </p>
        </div>
      </div>
    )
  }

  if (preview.kind === 'text') {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#7482A4]/12">
        <div className="flex items-center gap-2 border-b border-[#7482A4]/10 bg-[#FAF9FB] px-3 py-2">
          <ListChecks className="h-4 w-4 text-[#7482A4]" />
          <p className="text-[11px] font-extrabold text-[#38323F]">
            {preview.items.length} {preview.items.length === 1 ? 'item' : 'items'} detected
          </p>
        </div>

        <ol className="max-h-[260px] space-y-1.5 overflow-auto p-3">
          {preview.items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-start gap-2.5 rounded-xl bg-[#F5F3F6] px-3 py-2"
            >
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#7482A4]/15 text-[10px] font-extrabold text-[#7482A4]">
                {index + 1}
              </span>
              <span className="min-w-0 break-words text-xs font-semibold text-[#38323F]">
                {item}
              </span>
            </li>
          ))}
        </ol>

        <p className="border-t border-[#7482A4]/10 px-3 py-2 text-[10px] leading-4 text-[#8B8690]">
          Each item will be looked up in the FitPilot food database.
        </p>
      </div>
    )
  }

  const { header, rows, columns } = preview

  return (
    <div className="overflow-hidden rounded-2xl border border-[#7482A4]/12">
      <div className="flex items-center gap-2 border-b border-[#7482A4]/10 bg-[#FAF9FB] px-3 py-2">
        <Table className="h-4 w-4 text-[#7482A4]" />
        <p className="text-[11px] font-extrabold text-[#38323F]">Table detected</p>
        <span className="ml-auto text-[10px] font-semibold text-[#8B8690]">
          {rows.length} {rows.length === 1 ? 'row' : 'rows'}
        </span>
      </div>

      <div className="max-h-[260px] overflow-auto">
        <table className="w-full min-w-[420px] border-collapse text-left text-[11px]">
          {header ? (
            <thead>
              <tr className="bg-[#F5F3F6]">
                {Array.from({ length: columns }, (_, column) => (
                  <th
                    key={column}
                    className={[
                      'px-3 py-2 text-[10px] font-bold uppercase tracking-[0.05em] text-[#8B8690]',
                      column === 0 ? 'text-left' : 'text-right',
                    ].join(' ')}
                  >
                    {header[column] ?? ''}
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}

          <tbody className="divide-y divide-[#7482A4]/10">
            {rows.map((cells, rowIndex) => {
              if (cells.length === 1) {
                return (
                  <tr key={rowIndex}>
                    <td
                      colSpan={columns}
                      className="px-3 py-2 text-[11px] leading-4 text-[#6F6A74]"
                    >
                      {cells[0]}
                    </td>
                  </tr>
                )
              }

              const isTotal = /^total\b/i.test(cells[0] ?? '')

              return (
                <tr key={rowIndex} className={isTotal ? 'bg-[#F5F3F6]' : undefined}>
                  {Array.from({ length: columns }, (_, column) => (
                    <td
                      key={column}
                      className={[
                        'px-3 py-2 align-top',
                        column === 0 ? 'text-left' : 'whitespace-nowrap text-right',
                        isTotal || column === 0
                          ? 'font-extrabold text-[#38323F]'
                          : 'font-semibold text-[#5F5A64]',
                      ].join(' ')}
                    >
                      {cells[column] ?? ''}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="border-t border-[#7482A4]/10 px-3 py-2 text-[10px] leading-4 text-[#8B8690]">
        {header
          ? 'Macros will be read straight from your table.'
          : 'No header row found. Columns are read as Calories, Protein, Carbs, Fat.'}
      </p>
    </div>
  )
}
