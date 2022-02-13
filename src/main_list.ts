import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import pLimit from 'p-limit';
import { parse as parseHtml } from 'node-html-parser';
import stringifyJson from 'json-stringify-pretty-compact';
import { BankDefinition } from './types';

// 새마을금고위치안내 페이지
// https://www.kfcc.co.kr/map/main.do 뜯어서 얻은 목록

const seoul = ["서울", "도봉구", "마포구", "관악구", "강북구", "용산구", "서초구", "노원구", "성동구", "강남구", "성북구", "광진구", "송파구", "은평구", "강서구",
	"강동구", "종로구", "양천구", "중랑구", "영등포구", "서대문구", "구로구", "동대문구", "동작구", "중구", "금천구"];
const incheon = ["인천", "강화군", "서구", "동구", "중구", "미추홀구", "연수구", "계양구", "부평구", "남동구"];
const kyeonggido = ["경기", "김포시", "파주시", "연천군", "고양시", "양주시", "동두천", "포천시", "의정부", "남양주시", "구리시", "가평군", "하남시", "부천시",
	"광명시", "시흥시", "안산시", "안양시", "과천시", "군포시", "의왕시", "성남시", "광주시", "양평군", "화성시", "수원시", "오산시", "용인시", "이천시", "여주시",
	"평택시", "안성시"];
const kangwondo = ["강원", "철원군", "화천군", "양구군", "춘천시", "인제군", "고성군", "속초시", "양양군", "홍천군", "강릉시", "원주시", "횡성군", "평창군",
	"영월군", "정선군", "동해시", "삼척시", "태백시"];
const chungcheongnamdo = ["충남", "태안군", "서산시", "당진시", "홍성군", "예산군", "아산시", "천안시", "보령시", "청양군", "공주시", "연기군", "서천군",
	"부여군", "논산시", "금산군"];
const chungcheongbukdo = ["충북", "청주시", "진천군", "음성군", "충주시", "제천시", "청원군", "괴산군", "단양군", "보은군", "옥천군", "영동군", "증평군"];
const daejeon = ["대전", "유성구", "대덕구", "서구", "중구", "동구"];
const kyeongsangbukdo = ["경북", "문경시", "예천군", "영주시", "봉화군", "울진군", "상주시", "의성군", "안동시", "영양군", "김천시", "구미시", "군위군",
	"청송군", "영덕군", "성주군", "칠곡군", "영천시", "포항시", "고령군", "경산시", "경주시", "청도군", "울릉군"];
const kyeongsangnamdo = ["경남", "함양군", "거창군", "산청군", "합천군", "하동군", "진주시", "의령군", "함안군", "창녕군", "남해군", "사천시", "고성군",
	"마산시", "창원시", "밀양시", "통영시", "거제시", "진해시", "김해시", "양산시"];
const daegu = ["대구", "서구", "북구", "동구", "달서구", "중구", "남구", "수성구", "달성군"];
const pusan = ["부산", "강서구", "북구", "금정구", "기장군", "사상구", "부산진구", "연제구", "동래구", "사하구", "서구", "중구", "동구", "남구", "수영구",
	"해운대구", "영도구"];
const ulsan = ["울산", "울주군", "북구", "중구", "남구", "동구"];
const geonrabukdo = ["전북", "군산시", "익산시", "부안군", "김제시", "완주군", "전주시", "고창군", "정읍시", "순창군", "임실군", "진안군", "무주군", "남원시",
	"장수군"];
const geonranamdo = ["전남", "영광군", "장성군", "담양군", "함평군", "신안군", "무안군", "나주시", "화순군", "곡성군", "구례군", "목포시", "영암군", "진도군",
	"해남군", "강진군", "장흥군", "보성군", "순천시", "완도군", "고흥군", "여수시", "광양시"];
const gwangju = ["광주", "광산구", "북구", "서구", "남구", "동구"];
const jejudo = ["제주", "제주시", "서귀포시"];
const sejong = ["세종", "세종시"];

const groups = [
	seoul,
	incheon,
	kyeonggido,
	kangwondo,
	chungcheongnamdo,
	chungcheongbukdo,
	daejeon,
	kyeongsangbukdo,
	kyeongsangnamdo,
	daegu,
	pusan,
	ulsan,
	geonrabukdo,
	geonranamdo,
	gwangju,
	jejudo,
	sejong,
];

async function main() {
	// http -> html
	// await stage_fetch();

	// html -> parse
	await stage_parse();
}

async function stage_parse() {
	const entries_tmp = [];

	for (const group of groups) {
		const [r1, ...rest] = group;
		for (const r2 of rest) {
			const filename = `list_${r1}_${r2}.html`;
			const fp = path.resolve(process.cwd(), '_cache_list', filename);
			const text = await fs.readFile(fp, 'utf8');

			const root = parseHtml(text);
			const elems_tr = root.querySelectorAll('tr');
			for (const elem_tr of elems_tr) {
				// id 없는건 맨 위에 있는 항목 (번호, 금고명,... 포시용)
				if (!elem_tr.id) { continue; }

				const data: { [key: string]: string } = {};

				const elem_td = elem_tr.querySelector('td')!;
				const elems_span = elem_td.querySelectorAll('span');
				for (const child of elems_span) {
					const title = child.attributes['title'];
					const content = child.innerText;
					data[title] = content;
				}

				// 관심있는 속성만 모아서 재구성
				const entry: BankDefinition = {
					gmgoCd: data.gmgoCd,
					gmgoNm: data.gmgoNm,
					divCd: data.divCd,
					divNm: data.divNm,
					r1: data.r1,
					r2: data.r2,
				}
				entries_tmp.push(entry);
			}
		}
	}

	const entries_sort = entries_tmp.sort((a, b) => {
		const fn_key = (def: BankDefinition) => `${def.gmgoCd}:${def.divCd}`;
		const key_a = fn_key(a);
		const key_b = fn_key(b);
		return key_a.localeCompare(key_b);
	});

	const filename = `data/banks.json`;
	const fp = path.resolve(process.cwd(), filename);
	await fs.writeFile(fp, stringifyJson(entries_sort, { maxLength: 120 }), 'utf8');
}

async function stage_fetch() {
	for (const group of groups) {
		await fetch_inner(group);
	}
}

async function fetch_inner(values: string[]) {
	const [r1, ...rest] = values;

	const limit = pLimit(5);
	const promises = rest.map(r2 => limit(async () => {
		// 세종은 하위 메뉴가 1개(세종시)뿐인데 이때 r2를 넣으면 올바른 검색 결과가 나오지 않더라
		const url = rest.length === 1
			? `https://www.kfcc.co.kr/map/list.do?r1=${r1}&r2=`
			: `https://www.kfcc.co.kr/map/list.do?r1=${r1}&r2=${r2}`;

		console.log(url);
		const resp = await fetch(url);
		const text = await resp.text();

		const filename = `list_${r1}_${r2}.html`;
		const fp = path.resolve(process.cwd(), '_cache_list', filename);
		await fs.writeFile(fp, text);
	}));
	await Promise.all(promises);
}

main()
	.then(x => process.exit())
	.catch(e => console.error(e));

