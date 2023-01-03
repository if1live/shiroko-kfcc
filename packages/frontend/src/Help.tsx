import { Container, Icon } from "semantic-ui-react";
import { InterestRateEntry } from "./types";

interface Props {
  entries: InterestRateEntry[];
}

export const Help: React.FC<Props> = (props) => {
  return (
    <Container text>
      <dl>
        <dt>github</dt>
        <dd>
          <a href="https://github.com/if1live/shiroko-kfcc">
            <Icon name="github"></Icon> {`if1live/shiroko-kfcc`}
          </a>
        </dd>
        <dt>csv</dt>
        <dd>
          <a href="https://if1live.github.io/shiroko-kfcc/summary/report.csv">
            report.csv
          </a>
        </dd>
        <dt>json</dt>
        <dd>
          <a href="https://if1live.github.io/shiroko-kfcc/summary/report.json">
            report.json
          </a>
        </dd>
        <dt>데이터 구조</dt>
        <dd>
          코드, 이름, 지역, MG더뱅킹정기예금, MG더뱅킹정기적금, MG더뱅킹자유적금, 기준일
        </dd>
      </dl>
    </Container>
  );
};
