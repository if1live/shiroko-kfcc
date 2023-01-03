import { expect } from "expect";
import { readTestCaseFile } from "./testlibs.js";
import {
  parseBaseDate,
  parseDuration,
  parseInterestRateHtml,
  parseListHtml,
  parseRate,
} from "../src/parser.js";
import { BankDefinition, InterestRateSnapshot } from "../src/types.js";

describe("parseListHtml", () => {
  it("ok", async () => {
    const filename = "list_서울_도봉구_20230103.html";
    const text = await readTestCaseFile(filename);
    const actual = parseListHtml(text);

    expect(actual).toHaveLength(4);

    const expected_hq: BankDefinition = {
      gmgoCd: "0651",
      gmgoNm: "도봉",
      divCd: "001",
      divNm: "본점",
      r1: "서울",
      r2: "도봉구",
    };
    expect(actual[0]).toEqual(expected_hq);
  });
});

describe("parseInterestRateHtml - 요구불예탁금", () => {
  const filename = "bank_1224_요구불예탁금_20230103.html";
  let subject: InterestRateSnapshot;

  before(async () => {
    const text = await readTestCaseFile(filename);
    subject = parseInterestRateHtml(text);
  });

  it("baesDate", () => {
    expect(subject.baseDate).toBe("2023/01/03");
  });
});

describe("parseInterestRateHtml - 거치식예탁금", () => {
  const filename = "bank_1224_거치식예탁금_20230103.html";
  let subject: InterestRateSnapshot;

  before(async () => {
    const text = await readTestCaseFile(filename);
    subject = parseInterestRateHtml(text);
  });

  it("MG더뱅킹정기예금", () => {
    const found = subject.products.find((x) => x.title === "MG더뱅킹정기예금")!;

    expect(found.entries).toHaveLength(1);
    const entry = found.entries[0]!;

    expect(entry.duration).toBe(12);
    expect(entry.rate).toBe("4.00");
  });
});

describe("parseInterestRateHtml - 적립식예탁금", () => {
  const filename = "bank_1224_적립식예탁금_20230103.html";
  let subject: InterestRateSnapshot;

  before(async () => {
    const text = await readTestCaseFile(filename);
    subject = parseInterestRateHtml(text);
  });

  it("MG더뱅킹정기적금", () => {
    const found = subject.products.find((x) => x.title === "MG더뱅킹정기적금");

    expect(found?.entries).toHaveLength(2);
    const entry = found?.entries[0]!;

    expect(entry.duration).toBe(6);
    expect(entry.rate).toBe("2.00");
  });

  it("MG더뱅킹자유적금", () => {
    const found = subject.products.find((x) => x.title === "MG더뱅킹자유적금")!;

    expect(found.entries).toHaveLength(1);
    const entry = found?.entries[0]!;

    expect(entry.duration).toBe(12);
    expect(entry.rate).toBe("3.70");
  });
});

describe("parseDuration", () => {
  it("ok", () => {
    const actual = parseDuration("6월 이상");
    expect(actual).toBe(6);
  });

  it("fail", () => {
    const actual = parseDuration("invalid");
    expect(actual).toBeNull();
  });
});

describe("parseRate", () => {
  it("1", () => {
    const actual = parseRate("연1%");
    expect(actual).toBe("1.00");
  });

  it("12", () => {
    const actual = parseRate("연12%");
    expect(actual).toBe("12.00");
  });

  it("1.2", () => {
    const actual = parseRate("연1.2%");
    expect(actual).toBe("1.20");
  });

  it("1.23", () => {
    const actual = parseRate("연1.23%");
    expect(actual).toBe("1.23");
  });

  it("fail", () => {
    const actual = parseRate("asdf");
    expect(actual).toBeNull();
  });
});

describe("parseBaseDate", () => {
  it("ok", () => {
    const actual = parseBaseDate("조회기준일(2023/01/03)");
    expect(actual).toBe("2023/01/03");
  });
});
