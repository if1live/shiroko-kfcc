import path from "node:path";
import { allRegions, RegionSet } from "./constants.js";


// 테스트 목적으로 범위를 좁게 설정하고 싶을때
// export const targetRegions: RegionSet[] = [allRegions[allRegions.length - 1]];
export const targetRegions: RegionSet[] = allRegions;

/**
 * @summary html cache dir for region data
 */
export const regionCachePath = path.resolve(process.cwd(), "_cache_region");

/**
 * @summary html cache dir for interest rate
 */
export const rateCachePath = path.resolve(process.cwd(), "_cache_rate");

/**
 * @summary 금고목록, 금리요약, ...
 */
export const summaryDataPath = path.resolve(process.cwd(), "data_summary");

/**
 * @summary interest rete
 */
export const rateDataPath = path.resolve(process.cwd(), "data_rate");

export const bankJsonFilePath = path.resolve(summaryDataPath, "banks.json");

export function createListHtmlFilePath(r1: string, r2: string): string {
  const filename = `list_${r1}_${r2}.html`;
  const fp = path.resolve(regionCachePath, filename);
  return fp;
}

export function createInterestRateHtmlFilePath(
  id: string,
  hangul: string
): string {
  const filename = `${id}_${hangul}.html`;
  const fp = path.resolve(rateCachePath, filename);
  return fp;
}

export function createInterestRateJsonFilePath(id: string): string {
  const filename = `rate_${id}.json`;
  const fp = path.resolve(rateDataPath, filename);
  return fp;
}
