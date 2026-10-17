import type {
  LogMealItemInput,
  MealNutritionTotals,
  SmartParsedFood,
  SmartParseSource,
  SmartParserKind,
} from '../../services/types/meal'

// -----------------------------------------------------------------------------
// Input preview (what the user typed or pasted)
// -----------------------------------------------------------------------------

export type SmartInputPreviewData =
  | { kind: 'empty' }
  | { kind: 'text'; items: string[] }
  | {
      kind: 'table'
      header: string[] | null
      rows: string[][]
      columns: number
    }

const HEADER_HINT = /kcal|calor|protein|carb|\bfats?\b|food|item|weight|qty|quantity/i

const isSeparatorLine = (line: string): boolean =>
  /^[\s|:+-]+$/.test(line) && line.includes('-')

/** Same column delimiters the backend table parser understands: tab, pipe, 2+ spaces. */
export const splitTableCells = (line: string): string[] => {
  if (line.includes('\t')) return line.split('\t').map((cell) => cell.trim())

  if (line.includes('|')) {
    return line
      .replace(/^\s*\|/, '')
      .replace(/\|\s*$/, '')
      .split('|')
      .map((cell) => cell.trim())
  }

  return line
    .trim()
    .split(/\s{2,}/)
    .map((cell) => cell.trim())
}

export const buildInputPreview = (text: string): SmartInputPreviewData => {
  const trimmed = text.trim()
  if (!trimmed) return { kind: 'empty' }

  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !isSeparatorLine(line))

  const cellRows = lines.map(splitTableCells)
  const wideRows = cellRows.filter((cells) => cells.length >= 4).length

  if (wideRows >= 1 && wideRows >= lines.length / 2) {
    const first = cellRows[0] ?? []
    const hasHeader =
      first.length >= 4 &&
      first.filter((cell) => HEADER_HINT.test(cell)).length >= 2

    return {
      kind: 'table',
      header: hasHeader ? first : null,
      rows: hasHeader ? cellRows.slice(1) : cellRows,
      columns: Math.max(...cellRows.map((cells) => cells.length)),
    }
  }

  const items = trimmed
    .split(/[\n,;+&]/)
    .map((item) => item.trim())
    .filter(Boolean)

  return { kind: 'text', items }
}

export const isTableInput = (text: string): boolean =>
  buildInputPreview(text).kind === 'table'

// -----------------------------------------------------------------------------
// Editable review rows
// -----------------------------------------------------------------------------

export type MacroField = 'calories' | 'protein' | 'carbs' | 'fat'

export const MACRO_FIELDS: ReadonlyArray<{
  key: MacroField
  label: string
  unit: 'kcal' | 'g'
  step: string
}> = [
  { key: 'calories', label: 'Calories', unit: 'kcal', step: '1' },
  { key: 'protein', label: 'Protein', unit: 'g', step: '0.1' },
  { key: 'carbs', label: 'Carbs', unit: 'g', step: '0.1' },
  { key: 'fat', label: 'Fat', unit: 'g', step: '0.1' },
]

/** A parsed food whose macros are kept as strings so inputs can be edited freely. */
export interface EditableSmartFood {
  key: string
  name: string
  serving: string | null
  quantity: number
  unit: string
  weight_g: number | null
  source: SmartParseSource
  confidence: number
  notes: string | null
  raw_text: string | null
  calories: string
  protein: string
  carbs: string
  fat: string
}

const round1 = (value: number): number => Math.round(value * 10) / 10

export const formatSmartServing = (
  food: Pick<SmartParsedFood, 'quantity' | 'unit' | 'weight_g'>,
): string | null => {
  const hasWeight = food.weight_g !== null && food.weight_g > 0

  // "1 serving" on its own says nothing useful.
  if (!hasWeight && food.unit === 'serving' && food.quantity === 1) return null

  const quantity = Math.round(food.quantity * 100) / 100
  const base = `${quantity} ${food.unit}`.trim()

  if (!hasWeight || food.weight_g === null) return base

  const grams = `${round1(food.weight_g)}g`
  // "1 serving (86g)" is redundant: when the unit is just "serving", show the weight only.
  if (food.unit === 'g' || (food.unit === 'serving' && food.quantity === 1)) return grams

  return `${base} (${grams})`
}

export const toEditableFoods = (foods: SmartParsedFood[]): EditableSmartFood[] =>
  foods.map((food, index) => {
    // Unrecognised items start blank so the user sees the placeholders.
    const isManual = food.source === 'manual'

    return {
      key: `${index}-${food.name}`,
      name: food.name,
      serving: formatSmartServing(food),
      quantity: food.quantity,
      unit: food.unit,
      weight_g: food.weight_g,
      source: food.source,
      confidence: food.confidence,
      notes: food.notes,
      raw_text: food.raw_text,
      calories: isManual ? '' : String(Math.round(food.calories)),
      protein: isManual ? '' : String(round1(food.protein)),
      carbs: isManual ? '' : String(round1(food.carbs)),
      fat: isManual ? '' : String(round1(food.fat)),
    }
  })

/** Blank counts as 0. Returns null for anything that is not a non-negative number. */
export const parseMacroInput = (value: string): number | null => {
  const trimmed = value.trim()
  if (trimmed === '') return 0

  const number = Number(trimmed)
  return Number.isFinite(number) && number >= 0 ? number : null
}

export const sumEditableFoods = (
  foods: EditableSmartFood[],
): MealNutritionTotals =>
  foods.reduce<MealNutritionTotals>(
    (totals, food) => ({
      calories: totals.calories + (parseMacroInput(food.calories) ?? 0),
      protein: totals.protein + (parseMacroInput(food.protein) ?? 0),
      carbs: totals.carbs + (parseMacroInput(food.carbs) ?? 0),
      fat: totals.fat + (parseMacroInput(food.fat) ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

export type LogPayloadResult =
  | { ok: true; items: LogMealItemInput[]; totals: MealNutritionTotals }
  | { ok: false; error: string }

/** Title of a single logged entry, e.g. "White Rice (150g)". */
export const buildItemPrompt = (food: Pick<EditableSmartFood, 'name' | 'serving'>): string => {
  const title = food.serving && !food.name.includes(food.serving)
    ? `${food.name} (${food.serving})`
    : food.name
  return title.length > 240 ? `${title.slice(0, 237)}...` : title
}

/**
 * Validates the edited rows and converts them to the shape POST /meals/log/batch
 * expects: one item per food, each becoming its own meal entry.
 */
export const buildLogPayload = (foods: EditableSmartFood[]): LogPayloadResult => {
  const items: LogMealItemInput[] = []

  for (const food of foods) {
    const calories = parseMacroInput(food.calories)
    const protein = parseMacroInput(food.protein)
    const carbs = parseMacroInput(food.carbs)
    const fat = parseMacroInput(food.fat)

    if (calories === null || protein === null || carbs === null || fat === null) {
      return {
        ok: false,
        error: `Nutrition values for "${food.name}" must be non-negative numbers.`,
      }
    }

    items.push({
      name: food.name,
      raw_input_prompt: buildItemPrompt(food),
      ...(food.serving ? { serving_size: food.serving } : {}),
      quantity: food.quantity,
      serving_unit: food.unit,
      weight_g: food.weight_g,
      calories: Math.round(calories),
      protein: round1(protein),
      carbs: round1(carbs),
      fat: round1(fat),
      source: food.source,
      confidence: food.confidence,
    })
  }

  const totals = items.reduce<MealNutritionTotals>(
    (sum, item) => ({
      calories: sum.calories + item.calories,
      protein: sum.protein + item.protein,
      carbs: sum.carbs + item.carbs,
      fat: sum.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  return {
    ok: true,
    items,
    totals: {
      calories: Math.round(totals.calories),
      protein: round1(totals.protein),
      carbs: round1(totals.carbs),
      fat: round1(totals.fat),
    },
  }
}

/**
 * Text saved as the meal's title. A pasted table would make a huge multi-line
 * title, so tables are saved as the list of food names instead.
 */
export const buildLogPrompt = (
  text: string,
  foodNames: string[],
  isTable: boolean,
): string => {
  const source = isTable ? foodNames.join(', ') : text.replace(/\s+/g, ' ').trim()
  return source.length > 240 ? `${source.slice(0, 237)}...` : source
}

// -----------------------------------------------------------------------------
// Labels & examples
// -----------------------------------------------------------------------------

export const SMART_SOURCE_LABELS: Record<SmartParseSource, string> = {
  table: 'Your values',
  db: 'Estimated',
  ai: 'AI estimate',
  manual: 'Add macros',
}

export const SMART_PARSER_SUMMARY: Record<SmartParserKind, string> = {
  table: 'Read from your table. Macros use the values you pasted.',
  db: 'Matched against the FitPilot food database. Values are estimates.',
  ai: 'Estimated by AI. Please double-check the values.',
  mixed: 'Mixed result: some items matched the food database, others were estimated.',
  none: 'Nothing could be recognised in your text.',
}

export const SMART_TEXT_EXAMPLE = '2 cups sinangag, tuna omelette, 1 hopia'

export const SMART_TABLE_EXAMPLE = [
  'Food Item\tWeight/Qty\tCalories\tProtein\tCarbs\tFat',
  'Garlic Rice (Sinangag)\t240g\t367 kcal\t7.2g\t66.4g\t7.5g',
  'Tuna Omelette\t86g\t108 kcal\t12.7g\t1.9g\t5.5g',
  'Hopia (Munggo or Baboy)\t1 pc (~45g)\t160 kcal\t3.0g\t22.0g\t6.0g',
  'Boy Bawang Cornick\t22g\t110 kcal\t2.2g\t13.9g\t5.1g',
  'Total\t\t746 kcal\t25.1g\t104.2g\t24.1g',
].join('\n')

export const SMART_MAX_TEXT_LENGTH = 5000