import { Grid, html, Row } from "gridjs";
import "./style.css";
import "gridjs/dist/theme/mermaid.css";
import {
  CompactEntry,
  convertRowToEntry,
  filterByCategory,
  InterestRateEntry,
  ReportMatrix,
} from "./types";

// import { setupCounter } from './counter'
// <button id="counter" type="button"></button>
// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

async function fetchReportJson(): Promise<InterestRateEntry[]> {
  const url =
    "https://raw.githubusercontent.com/if1live/shiroko-kfcc/interest-rate/summary/report_mat.json";
  const resp = await fetch(url);
  const list = await resp.json();
  const mat = list as ReportMatrix;
  const [_fields, ...rows] = mat;
  const entries = rows.map(convertRowToEntry);
  return entries;
}

function formatGmgoId(cell: string, row: Row) {
  const id = cell;
  const name = row.cells[1].data as string;

  const params = new URLSearchParams();
  params.set("gmgoCd", id);
  params.set("name", name);
  params.set("divCd", "001");
  params.set("code1", id);
  params.set("code2", "001");
  params.set("tab", "sub_tab_rate");
  const url = `https://www.kfcc.co.kr/map/view.do?${params.toString()}`;

  return html(`<a href=${url} target="_blank">${id}</a>`);
}

function formatRate(cell: string | null) {
  return cell ? `${cell} %` : "";
}

async function main() {
  const naiveEntries = await fetchReportJson();
  const grid = initializeGrid([]);

  const renderPage = (key: keyof InterestRateEntry, hangul: string) => {
    const entries = filterByCategory(naiveEntries, key);
    grid.updateConfig({ data: entries as any });
    grid.forceRender();

    const headerElement = document.querySelector<HTMLElement>("#header-name")!;
    headerElement.textContent = hangul;

    const menuItemElements = document.querySelectorAll(".menu a.item");
    for (const elem of Array.from(menuItemElements)) {
      elem.classList.remove("active");
    }
    const activeMenuItem = document.querySelector(`.button-${key}`);
    activeMenuItem?.classList.add("active");
  };

  const setupCategoryButton = (
    element: HTMLElement,
    key: keyof InterestRateEntry
  ) => {
    element.addEventListener("click", () => {
      renderPage(key, element.textContent ?? "<BLANK>");
    });
  };

  setupCategoryButton(
    document.querySelector<HTMLElement>(".button-rateA")!,
    "rateA"
  );

  setupCategoryButton(
    document.querySelector<HTMLElement>(".button-rateB")!,
    "rateB"
  );

  setupCategoryButton(
    document.querySelector<HTMLElement>(".button-rateC")!,
    "rateC"
  );

  // 초기 화면
  renderPage("rateA", "MG더뱅킹정기예금");
}

function initializeGrid(entries: CompactEntry[]) {
  const grid = new Grid({
    columns: [
      {
        id: "gmgoCd",
        name: "금고ID",
        sort: false,
        width: "5%",
        formatter: (cell, row) => formatGmgoId(cell as any, row),
      },
      { id: "label", name: "이름", sort: false },
      { id: "location", name: "지역", sort: false },
      {
        id: "rate",
        name: "금리 (1년)",
        formatter: formatRate,
        width: "20%",
        hidden: false,
      },
      {
        id: "baseDate",
        name: "기준일",
        width: "5%",
        sort: false,
      },
    ],
    sort: true,
    data: entries as any,
    pagination: {
      enabled: true,
      limit: 20,
      summary: false,
    },
    style: {
      td: {
        padding: "5px 24px",
      },
    },
  });
  grid.render(document.getElementById("wrapper")!);
  return grid;
}
main();
