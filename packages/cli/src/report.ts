import path from "node:path";
import fs from "node:fs/promises";
import iconv from "iconv-lite";
import stringifyJson from "json-stringify-pretty-compact";
import { stringify as stringifyCsv } from "csv-stringify/sync";
import { BankSnapshot, InterestRateRow, Product } from "./types.js";

// MG더뱅킹정기예금, MG더뱅킹정기적금 금리만 뽑아보고 싶다
// 계좌 안만들고 언제나 가입할수 있는건 이거 두개
export function buildReportRows(snapshots: BankSnapshot[]): InterestRateRow[] {
  const rows = snapshots.map((snapshot) => {
    const { bank } = snapshot;
    const location = `${bank.r1} ${bank.r2}`;

    const deferredDeposit = snapshot.deferredDeposit?.products.find(
      (x) => x.title === "MG더뱅킹정기예금"
    );

    const deferredDepositRate = deferredDeposit
      ? extractMainRate(deferredDeposit)
      : null;

    const installmentSavings = snapshot.installmentSavings?.products.find(
      (x) => x.title === "MG더뱅킹정기적금"
    );

    const installmentSavingsRate = installmentSavings
      ? extractMainRate(installmentSavings)
      : null;

    const freeSavings = snapshot.installmentSavings?.products.find(
      (x) => x.title === "MG더뱅킹자유적금"
    );

    const freeSavingsRate = freeSavings ? extractMainRate(freeSavings) : null;

    const row: InterestRateRow = [
      bank.gmgoCd,
      bank.gmgoNm,
      location,
      deferredDepositRate,
      installmentSavingsRate,
      freeSavingsRate,
      snapshot.baseDate,
    ];
    return row;
  });
  return rows;
}

// 12개월 = 기준
function extractMainRate(product: Product): string | null {
  const entry = product.entries.find((x) => x.duration === 12);
  return entry?.rate ?? null;
}

export async function writeReportJson(
  rows: InterestRateRow[],
  destDir: string
) {
  const filename = "report.json";
  const fp = path.join(destDir, filename);
  const text = stringifyJson(rows, { maxLength: 80 });
  await fs.writeFile(fp, text, "utf-8");
}

export async function writeReportCsv(rows: InterestRateRow[], destDir: string) {
  const fields = [
    "gmgoCd",
    "gmgoNm",
    "location",
    "MG더뱅킹정기예금",
    "MG더뱅킹정기적금",
    "MG더뱅킹자유적금",
    "기준일",
  ];

  const mat = [fields, ...rows];
  const csv = stringifyCsv(mat);

  const filename = "report.csv";
  const fp = path.join(destDir, filename);

  // 엑셀이 utf-8 csv를 못알아먹어서 인코딩 적당히 건드림
  // euc-kr일때만 엑셀이 csv를 제대로 연다. utf16le일떄는 한글은 나오는데 필드 쪼개는걸 다시 해야됨
  const text_euckr = iconv.encode(csv, "euc-kr");
  await fs.writeFile(fp, text_euckr);
}
