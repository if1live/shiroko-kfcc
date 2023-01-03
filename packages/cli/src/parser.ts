import { parse as parseHtml, NodeType } from "node-html-parser";
import {
  BankDefinition,
  InterestRateSnapshot,
  Product,
  InterestRateEntry,
} from "./types.js";

export function parseListHtml(text: string): BankDefinition[] {
  const root = parseHtml(text);
  const elems_tr = root.querySelectorAll("tr");

  const entries = [];
  for (const elem_tr of elems_tr) {
    // id 없는건 맨 위에 있는 항목 (번호, 금고명,... 포시용)
    if (!elem_tr.id) {
      continue;
    }

    const data: { [key: string]: string } = {};

    const elem_td = elem_tr.querySelector("td")!;
    const elems_span = elem_td.querySelectorAll("span");
    for (const child of elems_span) {
      const title = child.attributes["title"];
      const content = child.innerText;
      data[title] = content;
    }

    // 관심있는 속성만 모아서 재구성
    const entry: BankDefinition = {
      gmgoCd: data.gmgoCd,
      gmgoNm: data.gmgoNm,
      divCd: data.divCd,
      divNm: data.divNm,
      r1: data.r1,
      r2: data.r2,
    };
    entries.push(entry);
  }

  return entries;
}

export function parseInterestRateHtml(text: string): InterestRateSnapshot {
  const root = parseHtml(text);

  const products: Product[] = [];

  // 조회 기준일
  const elem_baseDate = root.querySelector(".base-date");
  const baseDateRaw = elem_baseDate?.textContent ?? "<blank>";
  // "조회기준일(2022/02/13)"
  // console.log(baseDate_text);

  const elems_table = root.querySelectorAll(".tblWrap");
  for (const elem_table of elems_table) {
    const elem_title = elem_table.querySelector(".tbl-tit");
    const title = elem_title?.textContent ?? "<blank>";

    // 기본 이율: divTmp1
    const entries: InterestRateEntry[] = [];
    const elems_tr = elem_table.querySelectorAll("#divTmp1 tbody tr")!;
    for (const elem of elems_tr) {
      const elem_tds = elem.childNodes.filter(
        (x) => x.nodeType === NodeType.ELEMENT_NODE
      );
      const td_key = elem_tds[elem_tds.length - 2];
      const td_value = elem_tds[elem_tds.length - 1];

      const key = td_key.innerText;
      const value = td_value.innerText;
      const entry: InterestRateEntry = {
        duration: parseDuration(key),
        rate: parseRate(value),
      };
      entries.push(entry);
    }

    const product: Product = {
      title,
      entries,
    };
    products.push(product);
  }

  return {
    baseDate: parseBaseDate(baseDateRaw),
    products,
  };
}

export function parseDuration(input: string): number | null {
  const numStr = input.replace("월 이상", "");
  const value = parseInt(numStr, 10);
  return isNaN(value) ? null : value;
}

/**
 * 부동소수 자릿수를 고정하고 싶다.
 */
export function parseRate(input: string): string | null {
  const numStr = input.replace("연", "").replace("%", "");
  const num = parseFloat(numStr);
  return isNaN(num) ? null : num.toFixed(2);
}

export function parseBaseDate(input: string): string {
  return input.replace("조회기준일", "").replace("(", "").replace(")", "");
}
