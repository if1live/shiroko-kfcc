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

function buildDetailUrl(
  gmgoCd: string,
  name: string,
  tab: "sub_tab_rate" | "sub_tab_map"
) {
  const params = new URLSearchParams();
  params.set("gmgoCd", gmgoCd);
  params.set("name", name);
  params.set("divCd", "001");
  params.set("code1", gmgoCd);
  params.set("code2", "001");
  params.set("tab", tab);
  const url = `https://www.kfcc.co.kr/map/view.do?${params.toString()}`;
  return url;
}

function formatGmgo(_cell: string, row: Row) {
  const id = row.cells[0].data as string;
  const name = row.cells[1].data as string;
  const url = buildDetailUrl(id, name, "sub_tab_rate");
  return html(`<div>
    ${name}
    <a href=${url} target="_blank"><small>${id}</small></a>
  </div>`);
}

function formatLocation(cell: string, row: Row) {
  const id = row.cells[0].data as string;
  const name = row.cells[1].data as string;
  const url = buildDetailUrl(id, name, "sub_tab_map");
  return html(`<div>
    <a href=${url} target="_blank">${cell}</a>
  <div>`);
}

function formatRate(cell: string | null, _row: Row) {
  if (!cell) {
    return "";
  }

  return `${cell} %`;
}

function formatBaseDate(cell: string, row: Row) {
  const id = row.cells[0].data as string;
  const url = `https://github.com/if1live/shiroko-kfcc/blob/interest-rate/details/rate_${id}.json`;
  return html(`<div>
    <a href=${url} target="_blank">${cell}</a>
  </div>`);
}

function initializeGrid(entries: CompactEntry[]) {
  const grid = new Grid({
    columns: [
      {
        id: "gmgoCd",
        name: "금고ID",
        sort: false,
        width: "5%",
        hidden: true,
      },
      {
        id: "label",
        name: "이름",
        sort: false,
        formatter: formatGmgo,
      },
      { id: "location", name: "지역", sort: false, formatter: formatLocation },
      {
        id: "rate",
        name: "금리 (1년)",
        formatter: formatRate,
        width: "20%",
      },
      {
        // 크롤링이 고장났으면 과거 데이터가 노출될수 있다.문제 생긴거 잡을떄 쓸수 있을듯?
        id: "baseDate",
        name: "기준일",
        formatter: formatBaseDate,
        width: "5%",
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

// 빈데이터라도 상관없으니 일단 렌더링. 데이터 불러오면 이어서 작업
const grid = initializeGrid([]);

async function main() {
  const naiveEntries = await fetchReportJson();

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
      const label = element.dataset.label ?? "<BLANK>";
      renderPage(key, label);
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

main();
