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
  id: string;
  name: string;
  location: string;
  rateA: string | null;
  rateB: string | null;
  rateC: string | null;
  baseDate: string | null;
}

export function convertRowToEntry(row: InterestRateRow): InterestRateEntry {
  return {
    id: row[0],
    name: row[1],
    location: row[2],
    rateA: row[3],
    rateB: row[4],
    rateC: row[5],
    baseDate: row[6],
  };
}
