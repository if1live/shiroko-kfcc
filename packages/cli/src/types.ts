/**
 * 새마을금고 상세 정보.
 * 필드 이름은 크롤링 결과를 그대로 사용한다.
 */
export interface BankDefinition {
  /**
   * @example 0101
   */
  gmgoCd: string;

  /**
   * @example 청운효자동
   */
  gmgoNm: string;

  /**
   * @summary 본점=001, 분점=002, 003, ...
   * @example 001, 002
   */
  divCd: string;

  /**
   * @example 본점, 안국
   */
  divNm: string;

  /**
   * @example 서울
   */
  r1: string;

  /**
   * @example 종로구
   */
  r2: string;
}

export interface InterestRateEntry {
  /**
   * @summary "12월 이상"
   * @example 12
   */
  duration: number | null;

  /**
   * @summary "연2.4%", 소수점 2자리로 고정
   * @example 5.69, 2.40
   */
  rate: string | null;
}

export interface Product {
  /** @example MG더뱅킹정기예금 */
  title: string;

  entries: InterestRateEntry[];
}

export interface InterestRateSnapshot {
  /**
   * @summary 조회기준일
   * @example 2023/01/03
   */
  baseDate: string;

  products: Product[];
}

export interface BankSnapshot {
  id: string;

  /**
   * 분점 정보는 필요 없어서 생략
   * 부평은 인천에도 있고 부산에도 있다. 금고 이름과 지역 이름이 동시에 필요하다
   */
  bank: Pick<BankDefinition, "gmgoCd" | "gmgoNm" | "r1" | "r2">;

  baseDate: string | null;

  /** @summary 거치식예탁금 */
  deferredDeposit: InterestRateSnapshot | null;

  /** @summary 적립식예탁금 */
  installmentSavings: InterestRateSnapshot | null;
}

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
