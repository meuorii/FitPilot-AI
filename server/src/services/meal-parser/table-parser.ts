import { extractQuantity, type QuantityInfo } from './quantity.js';
import type { MacroValues, ParsedFood } from './types.js';
import { parseNumber, round1 } from './utils.js';

type MacroKey = keyof MacroValues;
type ColumnKey = MacroKey | 'name' | 'quantity';
type Delimiter = 'tab' | 'pipe' | 'comma' | 'spaces';
type ColumnMap = Partial<Record<ColumnKey, number>>;

const MACRO_KEYS: MacroKey[] = ['calories', 'protein', 'carbs', 'fat'];

// Order matters: the first rule that matches a header cell wins.
const HEADER_RULES: Array<[ColumnKey, RegExp]> = [
  ['calories', /kcal|calor|energy/],
  ['protein', /protein/],
  ['carbs', /carb|\bcho\b/],
  ['fat', /\bfats?\b|lipid/],
  ['quantity', /weight|qty|quantity|serving|amount|portion|size/],
  ['name', /food|item|meal|dish|name|description/],
];

const DELIMITERS: Delimiter[] = ['tab', 'pipe', 'comma', 'spaces'];

const splitCsv = (line: string): string[] => {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }

  cells.push(current.trim());
  return cells;
};

const splitLine = (line: string, delimiter: Delimiter): string[] => {
  switch (delimiter) {
    case 'tab':
      return line.split('\t').map((cell) => cell.trim());
    case 'pipe': {
      let trimmed = line.trim();
      if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
      if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);
      return trimmed.split('|').map((cell) => cell.trim());
    }
    case 'comma':
      return splitCsv(line);
    case 'spaces':
      return line.trim().split(/\s{2,}/).map((cell) => cell.trim());
  }
};

const mapHeader = (cells: string[]): ColumnMap | null => {
  const columns: ColumnMap = {};

  cells.forEach((cell, index) => {
    const label = cell.toLowerCase();

    for (const [key, pattern] of HEADER_RULES) {
      if (columns[key] === undefined && pattern.test(label)) {
        columns[key] = index;
        return;
      }
    }
  });

  const macroCount = MACRO_KEYS.filter((key) => columns[key] !== undefined).length;
  if (columns.calories === undefined || macroCount < 3) return null;

  if (columns.name === undefined) {
    const used = new Set<number | undefined>(Object.values(columns));
    if (used.has(0)) return null;
    columns.name = 0;
  }

  return columns;
};

interface HeaderInfo {
  index: number;
  delimiter: Delimiter;
  columns: ColumnMap;
  width: number;
}

const findHeader = (lines: string[]): HeaderInfo | null => {
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] ?? '';
    if (!line.trim()) continue;

    for (const delimiter of DELIMITERS) {
      const cells = splitLine(line, delimiter);
      if (cells.length < 4) continue;

      const columns = mapHeader(cells);
      if (columns) return { index, delimiter, columns, width: cells.length };
    }
  }

  return null;
};

const isSeparatorRow = (line: string): boolean =>
  /^[\s|:+-]+$/.test(line) && line.includes('-');

const cellAt = (cells: string[], index: number | undefined): string =>
  index === undefined ? '' : (cells[index] ?? '');

interface RawRow {
  nameCell: string;
  quantityCell: string;
  values: Record<MacroKey, number | null>;
}

const readRow = (
  cells: string[],
  width: number,
  columns: ColumnMap,
  macroKeys: MacroKey[],
): RawRow | null => {
  const values: Record<MacroKey, number | null> = {
    calories: null,
    protein: null,
    carbs: null,
    fat: null,
  };

  // Normal case: same number of cells as the header.
  if (cells.length === width) {
    for (const key of macroKeys) {
      values[key] = parseNumber(cellAt(cells, columns[key]));
    }

    return {
      nameCell: cellAt(cells, columns.name),
      quantityCell: cellAt(cells, columns.quantity),
      values,
    };
  }

  // Misaligned row (e.g. an empty cell got dropped): align numeric cells from the right.
  const numeric = cells.slice(1).filter((cell) => /\d/.test(cell));

  if (numeric.length >= macroKeys.length) {
    const macroCells = numeric.slice(-macroKeys.length);
    macroKeys.forEach((key, i) => {
      values[key] = parseNumber(macroCells[i]);
    });

    const extras = numeric.slice(0, numeric.length - macroKeys.length);
    return { nameCell: cells[0] ?? '', quantityCell: extras[0] ?? '', values };
  }

  // Not a data row (e.g. the description line of a multi-line cell).
  return null;
};

const quantityFromParentheses = (name: string): QuantityInfo | null => {
  const pattern = /\(([^)]*)\)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(name)) !== null) {
    const info = extractQuantity(match[1] ?? '');
    if (info.weightG !== null || info.unit !== null) return info;
  }

  return null;
};

export interface TableParseResult {
  foods: ParsedFood[];
  warnings: string[];
  confidence: number;
}

/**
 * Parses pasted tables such as:
 *   Food Item <tab> Weight/Qty <tab> Calories <tab> Protein <tab> Carbs <tab> Fat
 * Columns are mapped by header name, so column order does not matter.
 * Returns null when the text does not look like a table.
 */
export const parseTable = (text: string): TableParseResult | null => {
  const lines = text.split('\n');
  const header = findHeader(lines);
  if (!header) return null;

  const { columns, delimiter, width } = header;
  const macroKeys = MACRO_KEYS.filter((key) => columns[key] !== undefined).sort(
    (a, b) => (columns[a] ?? 0) - (columns[b] ?? 0),
  );

  const foods: ParsedFood[] = [];
  const warnings: string[] = [];
  let statedTotals: Record<MacroKey, number | null> | null = null;
  let pending: string[] = [];

  for (let i = header.index + 1; i < lines.length; i++) {
    const line = (lines[i] ?? '').trim();
    if (!line || isSeparatorRow(line)) continue;

    const row = readRow(splitLine(line, delimiter), width, columns, macroKeys);

    if (!row) {
      pending.push(line);
      continue;
    }

    const pendingLines = pending;
    pending = [];

    if (pendingLines.length === 0 && /^total\b/i.test(row.nameCell.trim())) {
      statedTotals = row.values;
      continue;
    }

    // Multi-line food cell: first line is the name, the rest are notes.
    let name = row.nameCell.trim();
    let notes: string | null = null;

    if (pendingLines.length > 0) {
      name = (pendingLines[0] ?? '').trim();
      notes =
        [...pendingLines.slice(1), row.nameCell]
          .map((part) => part.trim())
          .filter(Boolean)
          .join(' ') || null;
    }

    if (!name) {
      warnings.push(`Skipped a row without a food name (line ${i + 1}).`);
      continue;
    }

    let { calories } = row.values;
    const protein = row.values.protein ?? 0;
    const carbs = row.values.carbs ?? 0;
    const fat = row.values.fat ?? 0;

    if (calories === null) {
      if (protein + carbs + fat === 0) {
        warnings.push(`Skipped "${name}": no calorie or macro values found.`);
        continue;
      }

      calories = protein * 4 + carbs * 4 + fat * 9;
      warnings.push(`"${name}" had no calories, so they were estimated from its macros.`);
    }

    const fromCell = extractQuantity(row.quantityCell);
    const fromParens = quantityFromParentheses(name);
    const fromName = extractQuantity(name);

    const weightG = fromCell.weightG ?? fromParens?.weightG ?? fromName.weightG ?? null;
    const count = fromCell.count ?? fromParens?.count ?? null;
    const unit = fromCell.unit ?? fromParens?.unit ?? null;

    foods.push({
      name,
      quantity: count ?? 1,
      unit: unit ?? 'serving',
      weight_g: weightG === null ? null : round1(weightG),
      calories: Math.round(calories),
      protein: round1(protein),
      carbs: round1(carbs),
      fat: round1(fat),
      source: 'table',
      confidence: 0.95,
      notes,
      raw_text: null,
    });
  }

  if (foods.length === 0) return null;

  // Sanity check: do the item rows add up to the stated Total row?
  let mismatch = false;

  if (statedTotals) {
    const labels: Record<MacroKey, [string, string]> = {
      calories: ['calories', 'kcal'],
      protein: ['protein', 'g'],
      carbs: ['carbs', 'g'],
      fat: ['fat', 'g'],
    };

    for (const key of macroKeys) {
      const stated = statedTotals[key];
      if (stated === null) continue;

      const sum = foods.reduce((total, item) => total + item[key], 0);
      const tolerance =
        key === 'calories' ? Math.max(5, stated * 0.03) : Math.max(1.5, stated * 0.05);

      if (Math.abs(sum - stated) > tolerance) {
        const [label, unit] = labels[key];
        warnings.push(
          `Stated total ${label} (${stated} ${unit}) doesn't match the sum of the items (${round1(sum)} ${unit}). Using the sum of the items.`,
        );
        mismatch = true;
      }
    }
  }

  return { foods, warnings, confidence: mismatch ? 0.8 : 0.95 };
};
