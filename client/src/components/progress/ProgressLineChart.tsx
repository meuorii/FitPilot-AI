import { formatShortDate } from './progress.utils'

export interface ProgressChartPoint {
  id: string
  value: number
  logged_at: string
}

interface ProgressLineChartProps {
  points: ProgressChartPoint[]
  valueSuffix: string
  accessibleLabel: string
}

const width = 680
const height = 240
const padding = {
  left: 52,
  right: 24,
  top: 24,
  bottom: 42,
}

const plotWidth = width - padding.left - padding.right
const plotHeight = height - padding.top - padding.bottom

export function ProgressLineChart({
  points,
  valueSuffix,
  accessibleLabel,
}: ProgressLineChartProps) {
  if (points.length === 0) return null

  const values = points.map((point) => point.value)
  let minValue = Math.min(...values)
  let maxValue = Math.max(...values)

  if (minValue === maxValue) {
    const pad = Math.max(Math.abs(minValue) * 0.03, 1)
    minValue -= pad
    maxValue += pad
  } else {
    const pad = (maxValue - minValue) * 0.12
    minValue -= pad
    maxValue += pad
  }

  const range = Math.max(maxValue - minValue, 1)

  const coords = points.map((point, index) => {
    const x =
      points.length === 1
        ? padding.left + plotWidth / 2
        : padding.left +
          (index / (points.length - 1)) * plotWidth

    const y =
      padding.top +
      (1 - (point.value - minValue) / range) * plotHeight

    return {
      ...point,
      x,
      y,
    }
  })

  const linePath = coords
    .map((point, index) =>
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`,
    )
    .join(' ')

  const areaPath =
    coords.length > 1
      ? `${linePath} L ${coords[coords.length - 1].x} ${
          padding.top + plotHeight
        } L ${coords[0].x} ${padding.top + plotHeight} Z`
      : ''

  const middleIndex = Math.floor((points.length - 1) / 2)
  const xLabelIndexes = Array.from(
    new Set([0, middleIndex, points.length - 1]),
  )

  const yLabels = [maxValue, (maxValue + minValue) / 2, minValue]

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full min-w-0"
        role="img"
        aria-label={accessibleLabel}
      >
        <desc>
          {accessibleLabel}. {points.length} recorded point
          {points.length === 1 ? '' : 's'}.
        </desc>

        {yLabels.map((value, index) => {
          const y =
            padding.top + (index / (yLabels.length - 1)) * plotHeight

          return (
            <g key={`${value}-${index}`}>
              <line
                x1={padding.left}
                x2={padding.left + plotWidth}
                y1={y}
                y2={y}
                stroke="rgba(116,130,164,0.12)"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                fill="#918B95"
                fontSize="11"
              >
                {new Intl.NumberFormat(undefined, {
                  maximumFractionDigits: 1,
                }).format(value)}
              </text>
            </g>
          )
        })}

        {areaPath ? (
          <path
            d={areaPath}
            fill="rgba(116,130,164,0.10)"
          />
        ) : null}

        {coords.length > 1 ? (
          <path
            d={linePath}
            fill="none"
            stroke="#7482A4"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {coords.map((point, index) => {
          const latest = index === coords.length - 1

          return (
            <g key={point.id}>
              <circle
                cx={point.x}
                cy={point.y}
                r={latest ? 6 : 4.5}
                fill={latest ? '#7482A4' : 'white'}
                stroke="#7482A4"
                strokeWidth={latest ? 3 : 2}
              >
                <title>
                  {formatShortDate(point.logged_at)}: {point.value}
                  {valueSuffix}
                </title>
              </circle>

              {latest ? (
                <g>
                  <rect
                    x={Math.min(point.x - 36, width - 92)}
                    y={Math.max(point.y - 38, 4)}
                    width="72"
                    height="24"
                    rx="10"
                    fill="#38323F"
                  />
                  <text
                    x={Math.min(point.x, width - 56)}
                    y={Math.max(point.y - 22, 20)}
                    textAnchor="middle"
                    fill="white"
                    fontSize="11"
                    fontWeight="700"
                  >
                    {new Intl.NumberFormat(undefined, {
                      maximumFractionDigits: 1,
                    }).format(point.value)}
                    {valueSuffix}
                  </text>
                </g>
              ) : null}
            </g>
          )
        })}

        {xLabelIndexes.map((index) => {
          const point = coords[index]
          if (!point) return null

          return (
            <text
              key={`x-${point.id}`}
              x={point.x}
              y={height - 12}
              textAnchor={
                index === 0
                  ? 'start'
                  : index === points.length - 1
                    ? 'end'
                    : 'middle'
              }
              fill="#918B95"
              fontSize="11"
            >
              {formatShortDate(point.logged_at)}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
