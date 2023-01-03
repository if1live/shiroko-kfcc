import { default as _ } from "lodash-es";
import fs from "node:fs/promises";
import path from "node:path";
import stringifyJson from "json-stringify-pretty-compact";
import {
  allRegions,
  RegionSet,
  productCategories,
  category_deferredDeposit,
  category_installmentSavings,
} from "./constants.js";
import { fetchRates, fetchRegions } from "./fetcher.js";
import { parseListHtml, parseInterestRateHtml } from "./parser.js";
import { BankDefinition } from "./types.js";

/*
usage:
pnpm cli -- fetch_region
pnpm cli -- parse_region
pnpm cli -- fetch_rate
pnpm cli -- parse_rate
*/

const regionCacheDir = path.resolve(process.cwd(), "_cache_region");
const rateCacheDir = path.resolve(process.cwd(), "_cache_rate");

const regionDataDir = path.resolve(process.cwd(), "data_region");
const rateDataDir = path.resolve(process.cwd(), "data_rate");

// 테스트 목적으로 범위를 좁게 설정하고 싶을때
// const targets: RegionSet[] = [allRegions[allRegions.length - 1]];
const targets: RegionSet[] = allRegions;

async function main() {
  const action = process.argv[process.argv.length - 1];

  switch (action) {
    case "fetch_region": {
      await fetchRegions(targets, 10, regionCacheDir);
      break;
    }
    case "parse_region": {
      await parseRegion();
      break;
    }
    case "fetch_rate": {
      const banks = await loadBanks();
      await fetchRates(banks, 10, rateCacheDir);
      break;
    }
    case "parse_rate": {
      const banks = await loadBanks();
      await parseRate(banks);
      break;
    }
    default:
      throw new Error(`unknown action: ${action}`);
  }
}
await main();

async function loadBanks(): Promise<BankDefinition[]> {
  const fp = path.resolve(regionDataDir, "banks.json");
  const text = await fs.readFile(fp, "utf-8");
  const banks = JSON.parse(text) as BankDefinition[];
  return banks;
}

async function parseRegion() {
  let banks_tmp: BankDefinition[] = [];

  for (const group of targets) {
    const [r1, ...rest] = group;
    for (const r2 of rest) {
      const filename = `list_${r1}_${r2}.html`;
      const fp = path.resolve(regionCacheDir, filename);
      const text = await fs.readFile(fp, "utf8");

      const results = parseListHtml(text);
      banks_tmp = [...banks_tmp, ...results];
    }
  }

  const banks = banks_tmp.sort((a, b) => {
    const fn_key = (def: BankDefinition) => `${def.gmgoCd}:${def.divCd}`;
    const key_a = fn_key(a);
    const key_b = fn_key(b);
    return key_a.localeCompare(key_b);
  });

  const fp = path.resolve(regionDataDir, "banks.json");
  await fs.writeFile(fp, stringifyJson(banks, { maxLength: 120 }), "utf-8");
}

async function parseRate(banks: BankDefinition[]) {
  const entries = _.uniqBy(banks, (x) => x.gmgoCd);
  for (const entry of entries) {
    const filename = await parseRateInner(entry);
    console.log(`parse ${entry.gmgoCd} -> ${filename}`);
  }
}

async function parseRateInner(bank: BankDefinition) {
  const id = bank.gmgoCd;

  const tasks = productCategories.map(async (x) => {
    const fp = path.resolve(rateCacheDir, `${id}_${x.hangul}.html`);
    const text = await fs.readFile(fp, "utf-8");
    return { code: x.code, text };
  });
  const results = await Promise.all(tasks);

  const text_demandDeposit = results.find(
    (x) => x.code === category_deferredDeposit.code
  )?.text;

  const text_deferredDeposit = results.find(
    (x) => x.code === category_deferredDeposit.code
  )?.text;

  const text_installmentSavings = results.find(
    (x) => x.code === category_installmentSavings.code
  )?.text;

  const demandDeposit = parseInterestRateHtml(text_demandDeposit!);
  const deferredDeposit = parseInterestRateHtml(text_deferredDeposit!);
  const installmentSavings = parseInterestRateHtml(text_installmentSavings!);

  const data = {
    gmgoCd: id,
    demandDeposit,
    deferredDeposit,
    installmentSavings,
  };

  const filename = `rate_${id}.json`;
  const fp_output = path.resolve(rateDataDir, filename);
  const text_output = stringifyJson(data, { maxLength: 60 });
  await fs.writeFile(fp_output, text_output);

  return filename;
}
