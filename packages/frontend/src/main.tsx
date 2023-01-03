import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { convertRowToEntry, InterestRateEntry, ReportMatrix } from "./types";

async function fetchReportJson(): Promise<InterestRateEntry[]> {
  const url = "https://if1live.github.io/shiroko-kfcc/summary/report.json";
  const resp = await fetch(url);
  const list = await resp.json();
  const mat = list as ReportMatrix;
  const [...rows] = mat;

  const entries = rows.map(convertRowToEntry);
  return entries;
}

async function main() {
  const entries = await fetchReportJson();

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App tableData={entries} />
    </React.StrictMode>
  );
}

main();
