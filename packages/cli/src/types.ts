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
   * 파싱하지 않고 원본 데이터 유지.
   * 규격에 벗어난 데이터가 있을지 몰라서?
   * @example 12월 이상
   */
  durationStr: string;

  /**
   * @example 12
   */
  duration: number | null;

  /**
   * 파싱하지 않고 원본 데이터 유지.
   * 규격에 벗어난 데이터가 있을지 몰라서?
   * @example 연5.69%, 연2.4%
   */
  rateStr: string;

  /**
   * @summary 소수점 2자리로 고정
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
  /** @example "조회기준일(2023/01/03)" */
  baseDateRaw: string;

  /**
   * @summary 조회기준일
   * @example 2023/01/03
   */
  baseDate: string;

  products: Product[];
}
