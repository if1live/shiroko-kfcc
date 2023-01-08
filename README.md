# shiroko-kfcc

새마을금고를 이자로 털!자

![내놔](https://raw.githubusercontent.com/if1live/shiroko-kfcc/main/document/shiroko-giveme.png)

| status | description |
|-------|---|
|[![ci](https://github.com/if1live/shiroko-kfcc/actions/workflows/ci.yml/badge.svg)](https://github.com/if1live/shiroko-kfcc/actions/workflows/ci.yml) | main branch |
|[![schedule](https://github.com/if1live/shiroko-kfcc/actions/workflows/schedule.yml/badge.svg)](https://github.com/if1live/shiroko-kfcc/actions/workflows/schedule.yml) | daily crawling |
|[![frontend](https://github.com/if1live/shiroko-kfcc/actions/workflows/frontend.yml/badge.svg)](https://github.com/if1live/shiroko-kfcc/actions/workflows/frontend.yml) | frontend |

새마을금고의 "내가 가입한 금고 및 다른 금고의 상품을 가입할 수 있는 비대면 전용상품"은 다음과 같다.
(2023/01/08 기준으로 MG더뱅킹 앱의 설명을 작성함)

* MG더뱅킹정기예금
    * 일정금액을 납부하면 MG가 울려주는 거치식예금
    * `#목돈굴리기` `#12개월` `#1백만원~5천만원`
    * **정기예금**
* MG더뱅킹정기적금
    * 매월 일정금액을 납입하고 MG와 함께 기초자산을 모으는 적립식예금
    * `#목돈모으기` `#6~12개월` `#최대 월 1백만원`
    * **정기적금**
* MG더뱅킹자유적금
    * 자유롭게 금액을 납입하고 MG와 함께 기초자산을 모으는 적립식예금
    * `#목돈모으기` `#12개월` `#최대 월 1백만원`
    * **자유적금**
* 상상모바일통장
    * 창구 방문 없이 비대면으로 개설 가능한 입출금 통장
    * `#무통장` `#최초가입시 우대금리` `#수수료 우대`
    * 예적금이 아니라서 제외

shiroko-kfcc는 계과 개설없이 가입 할수 있는 새마을금고 정기예금, 정기적금, 자유적금 상품을 취급한다.

## feature

* CLI 기반 새마을금고 금리 크롤러
    * directory: `./packages/cli`
* [새마을금고 금리 frontend](https://if1live.github.io/shiroko-kfcc/)
    * directory: `./packages/frontend`
    * MG더뱅킹정기예금, MG더뱅킹정기적금, MG더뱅킹자유적금
* git branch로 관리되는 새마을금고 금리 데이터
    * [interest-rate](https://github.com/if1live/shiroko-kfcc/tree/interest-rate)

## data

[금고위치안내](https://www.kfcc.co.kr/map/main.do)를 크롤링해서 데이터를 구성한다.

* 새마을금고 목록
    * [summary/banks.json](https://github.com/if1live/shiroko-kfcc/blob/interest-rate/summary/banks.json)
* MG더뱅킹정기예금, MG더뱅킹정기적금, MG더뱅킹자유적금 금리
    * csv: [summary/report_euckr.csv](https://github.com/if1live/shiroko-kfcc/blob/interest-rate/summary/report_euckr.csv)
    * json: [summary/report_mat.json](https://github.com/if1live/shiroko-kfcc/blob/interest-rate/summary/report_mat.json)
* 새마을금고별 거치식예탁금, 적립식예탁금 상품
    * [details/rate_0101.json](https://github.com/if1live/shiroko-kfcc/blob/interest-rate/details/rate_0101.json)
    * 금고코드는 `banks.json` 참고
