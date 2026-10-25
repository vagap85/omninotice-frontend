import type { StatCard, DailyDataPoint } from '@/types/shortener';

const DELIMITER = ';';
const BOM = '\uFEFF';

const escapeCell = (value: string | number): string => {
  const cell = String(value);
  const needsQuotes =
    cell.includes(DELIMITER) || cell.includes('"') || /[\r\n]/.test(cell);
  return needsQuotes ? `"${cell.replace(/"/g, '""')}"` : cell;
};

const toCsv = (rows: (string | number)[][]): string =>
  rows.map((row) => row.map(escapeCell).join(DELIMITER)).join('\r\n');

interface ExportStatsInput {
  shortUrl: string;
  targetUrl: string;
  period: string;
  statCards: StatCard[];
  byDay: DailyDataPoint[];
}

const buildReport = (input: ExportStatsInput): string => {
  const rows: (string | number)[][] = [
    ['Короткая ссылка', input.shortUrl],
    ['Целевой URL', input.targetUrl],
    ['Период', input.period],
    [],
    ['Показатель', 'Значение'],
    ...input.statCards.map((card) => [
      card.label,
      card.sub ? `${card.value} (${card.sub})` : card.value,
    ]),
    [],
    ['Дата', 'Клики'],
    ...input.byDay.map((point) => [point.date, point.value]),
  ];
  return toCsv(rows);
};

const triggerDownload = (content: string, filename: string): void => {
  const blob = new Blob([BOM + content], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export function exportStatsCsv(input: ExportStatsInput): void {
  const filename = `stats-${input.shortUrl.replace(/[^a-zA-Z0-9]/g, '-')}.csv`;
  triggerDownload(buildReport(input), filename);
}
