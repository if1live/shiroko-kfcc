# cli

## 준비

작업용 임시 디렉토리에는 `.gitkeep` 이외에는 없어야한다.
이전에 작업했던 데이터와 뒤섞이는거 방지

* `_cache_region`
* `_cache_rate`
* `data_region`
* `data_rate`

## 새마을금고 목록

1. `pnpm cli -- region:fetch`: 새마을금고 목록 HTML 받기
    * `_cache_region/list_강원_강릉시.html` 같은게 잔뜩 생김
2. `pnpm cli -- region:parse`: 새마을금고 목록을 JSON 하나로 뭉침
    * `data_region/banks.json` 생성
3. `pnpm cli -- rate:fetch`: 각각의 새마을금고별 금리 HTML 받기
    * `_cache_rate/0101_요구불예탁금.html` 같은게 잔뜩 생김
4. `pnpm cli -- rate:parse`: 각각의 새마을금고 금기를 JSON으로 변환
    * `data_rate/rate_0101.json` 같은게 잔뜩 생김
5. `pnpm cli -- report:write`: 전국의 MG더뱅킹정기예금, MG더뱅킹정기적금, MG더뱅킹자유적금 결과
    * `data_region/report.csv`
    * `data_region/report.json`

## 주의

오랜만에 작업하면 새마을금고 목록이 바뀔수 있다.
새마을금고는 없어질 수 있다.
```
http://spmoney.pe.kr/kfcc/so/kfcc0447.php
2022년 마포동부새마을금고와 공덕새마을금고가 합병되어 마포공덕새마을금고로 명칭이 변경되었습니다.
[0422] 마포동부본점 : 마포공덕새마을금고 아현본점
[0425] 공덕본점 : 마포공덕새마을금고 공덕지점
```

MG더뱅킹정기예금, MG더뱅킹정기적금, MG더뱅킹자유적금이 열려있지 않은 새마을 금고도 있다. 항목이 없으면 `report.csv`, `report.json` 에서 빈값이 된다.

[금고위치안내](https://www.kfcc.co.kr/map/main.do)에는 있지만 MG더뱅킹 으로 접근할수 없는 금고도 있다. 2023/01/04 기준으로 인터넷으로 조회하면 동촌 금고가 검색되지만 MG더뱅킹에서 금고명으로 "동촌"을 검색하면 아무것도 나오지 않는다.
