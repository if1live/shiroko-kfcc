// 데이터 크기를 줄이려고 깡배열로 다룸
export type InterestRateRow = [
  // 금고 코드
  string,
  // 금고 이름
  string,
  // 지역
  string,
  // MG더뱅킹정기예금
  string | null,
  // MG더뱅킹정기적금
  string | null,
  // MG더뱅킹자유적금
  string | null,
  // 기준일
  string | null
];

export type ReportMatrix = InterestRateRow[];

export interface InterestRateEntry {
  gmgoCd: string;
  label: string;
  location: string;
  rateA: string | null;
  rateB: string | null;
  rateC: string | null;
  baseDate: string | null;
}

export interface CompactEntry {
  gmgoCd: string;
  label: string;
  location: string;
  rate: string;
  baseDate: string | null;
}

export function convertRowToEntry(row: InterestRateRow): InterestRateEntry {
  return {
    gmgoCd: row[0],
    label: row[1],
    location: row[2],
    rateA: row[3],
    rateB: row[4],
    rateC: row[5],
    baseDate: row[6],
  };
}

export function sanitizeEntry(
  input: InterestRateEntry,
  key: keyof InterestRateEntry
): CompactEntry {
  const { rateA, rateB, rateC, ...rest } = input;
  return { ...rest, rate: input[key]! };
}

export function filterByCategory(
  entries: InterestRateEntry[],
  key: keyof InterestRateEntry
): CompactEntry[] {
  return entries
    .filter((x) => x[key] != null)
    .map((x) => sanitizeEntry(x, key))
    .sort((a, b) => {
      const x = parseFloat(a.rate!);
      const y = parseFloat(b.rate!);
      return y - x;
    });
}
