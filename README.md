# kfcc-interest-rate

## 작업 순서

## 준비

작업용 임시 디렉토리에는 `.gitkeep` 이외에는 없어야한다.
이전에 작업했던 데이터와 뒤섞이는거 방지

* `_cache_list`
* `_cache_bank`
* `data_bank`
* `data`

### 새마을금고 목록 (banks.json)

오랜만에 작업하면 새마을금고 목록이 바뀔수 있다
```
http://spmoney.pe.kr/kfcc/so/kfcc0447.php
2022년 마포동부새마을금고와 공덕새마을금고가 합병되어 마포공덕새마을금고로 명칭이 변경되었습니다.
[0422] 마포동부본점 : 마포공덕새마을금고 아현본점
[0425] 공덕본점 : 마포공덕새마을금고 공덕지점
```

1. `main_list.ts` 수정해서 `stage_fetch` 활성화 + `pnpm start:list`
2. `main_list.ts` 수정해서 `stage_parse` 활성화 + `pnpm start:list`
3. 작업이 끝나면 `data/banks.json` 이 생성된다.

### 은행별 금리 크롤링

1. `main_bank.ts` 수정해서 `stage_fetch` 활성화 + `pnpm start:bank`
2. `main_bank.ts` 수정해서 `stage_parse` 활성화 + `pnpm start:bank`
3. 작업이 끝나면 `data_bank/rate_xxxx.json` 이 생성된다

### 통합

`MG더뱅킹정기예금` 이외에는 관심없어서 해당 항목만으로 리포트를 구성한다

1. `pnpm start:report`
2. 작업이 끝나면 `report_rate.csv`가 생성된다.

