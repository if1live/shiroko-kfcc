import { default as _ } from "lodash-es";
import https from "node:https";
import { setTimeout } from "node:timers/promises";
import fs from "node:fs/promises";
import path from "node:path";
import pLimit from "p-limit";
import fetch from "node-fetch";
import { productCategories, ProductCategory, RegionSet } from "./constants.js";
import { BankDefinition } from "./types.js";

const agent = new https.Agent({ keepAlive: true });

type RegionCommand = {
  r1: string;
  r2: string;
  url: string;
};

function buildRegionCommands(region: RegionSet): RegionCommand[] {
  const [r1, ...rest] = region;
  const commands = rest.map((r2) => {
    // 세종은 하위 메뉴가 1개(세종시)뿐인데 이때 r2를 넣으면 올바른 검색 결과가 나오지 않더라
    const url =
      rest.length === 1
        ? `https://www.kfcc.co.kr/map/list.do?r1=${r1}&r2=`
        : `https://www.kfcc.co.kr/map/list.do?r1=${r1}&r2=${r2}`;
    const command: RegionCommand = { r1, r2, url };
    return command;
  });
  return commands;
}

type CommandOutput_Success<T> = {
  ok: true;
  value: T;
};

type CommandOutput_Failure = {
  ok: false;
  error: Error;
};

type RegionCommandOutput =
  | CommandOutput_Success<string>
  | CommandOutput_Failure;

async function executeRegionCommand(
  command: RegionCommand,
  destDir: string
): Promise<RegionCommandOutput> {
  const { r1, r2, url } = command;
  const filename = `list_${r1}_${r2}.html`;

  try {
    const resp = await fetch(url, {
      agent,
    });
    const text = await resp.text();

    const fp = path.resolve(destDir, filename);
    await fs.writeFile(fp, text);

    return { ok: true, value: filename };
  } catch (e) {
    return { ok: false, error: e as Error };
  }
}

export async function fetchRegions(
  regions: RegionSet[],
  concurrency: number,
  destDir: string
) {
  const commands = regions.flatMap((x) => buildRegionCommands(x));
  const limit = pLimit(concurrency);

  const tasks = commands.map((command) =>
    limit(async () => {
      const { r1, r2 } = command;

      const output = await executeRegionCommand(command, destDir);
      if (output.ok) {
        const { value: filename } = output;
        console.log(`OK: ${r1} ${r2} -> ${filename}`);
      } else {
        const { error } = output;
        console.error(`ERROR: ${r1} ${r2} -> ${error.name}: ${error.message}`);
      }
    })
  );
  await Promise.all(tasks);
}

export async function fetchRates(
  banks: BankDefinition[],
  concurrency: number,
  destDir: string
) {
  const entries = _.uniqBy(banks, (x) => x.gmgoCd);
  const limit = pLimit(concurrency);

  const tasks = entries.map((entry) => {
    limit(async () => {
      await fetchInterestRate(entry, destDir);
    });
  });
  await Promise.all(tasks);
}

async function fetchInterestRate(bank: BankDefinition, destDir: string) {
  const id = bank.gmgoCd;

  const execute = async (category: ProductCategory) => {
    const filename = `${id}_${category.hangul}.html`;
    const text = await fetchInterestRateByGubun(id, category.code);
    const fp = path.resolve(destDir, filename);
    await fs.writeFile(fp, text);
    console.log(`fetch ${filename}`);
  };

  // TODO: 멀쩡한 재시도? http 요청을 너무 많이 보내니까 가끔 실패한다
  // 무시한 방식으로 재시도 구현
  for (const cateogry of productCategories) {
    const maxRetry = 3;
    let ok = false;
    for (let attempt = 1; attempt <= maxRetry; attempt++) {
      try {
        await execute(cateogry);
        ok = true;
        break;
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message);
          console.log(`[${attempt}/${maxRetry}] retry after waiting....`);
          await setTimeout(3_000);
        }
      }
    }

    // 재시도로 복구할수 없을떄
    if (!ok) {
      console.error(
        `ERROR: ${bank.gmgoCd}, ${bank.r1} ${bank.r2}, ${cateogry.hangul}`
      );
    }
  }
}

async function fetchInterestRateByGubun(
  trmid: string,
  gubuncode: number
): Promise<string> {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.82 Safari/537.36",
  };

  const url = `https://www.kfcc.co.kr/map/goods_19.do?OPEN_TRMID=${trmid}&gubuncode=${gubuncode}`;
  const resp = await fetch(url, {
    headers,
    agent,
  });
  const text = await resp.text();

  if (resp.status >= 400) {
    throw new Error(resp.statusText);
  }

  const lines = text.split("\n");
  const line_alert = lines.find((x) => x.trim().startsWith("alert("));
  const re_alert = /alert\("(.+)"\);/;
  const match_alert = line_alert ? re_alert.exec(line_alert) : null;
  if (match_alert) {
    throw new Error(match_alert[1]);
  }

  return text;
}
