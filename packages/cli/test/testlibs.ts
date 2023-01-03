import path from "node:path";
import { promises as fs } from "node:fs";

export async function readTestCaseFile(filename: string): Promise<string> {
  const url = convertImportMetaUrlToLocalPath(import.meta.url);
  const dirname = path.dirname(url);
  const fp = path.join(dirname, "testcases", filename);
  const text = await fs.readFile(fp, "utf-8");
  return text;
}

// ESM을 사용하면 __dirname을 쓸수 없다. 적당히 우회
function convertImportMetaUrlToLocalPath(url: string) {
  // OS 신경 안써도 되도록 만들고 작업 시작
  // https://stackoverflow.com/a/63251716
  const converted = url.split(path.sep).join(path.posix.sep);
  const urlObj = new URL(converted);

  // 윈도우는 /D:/... 같이 경로가 나와서 첫글자를 제거해야된다.
  // 무식하지만 posix로 체크해도 대충 돌듯?
  const isPosix = path.sep === path.posix.sep;
  return isPosix ? urlObj.pathname : urlObj.pathname.substring(1);
}
