import _ from 'lodash';
import path from 'path';
import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import pLimit from 'p-limit';
import stringifyJson from 'json-stringify-pretty-compact';
import { NodeType, parse as parseHtml } from 'node-html-parser';
import {
	BankDefinition,
	BankModel,
	Product,
	InterestRateEntry,
} from './types';

/** @summary 요구불예탁금 */
const gubuncode_a = 12;

/** @summary 거치식예탁금 */
const gubuncode_deposit = 13;

/** @summary 적립식예탁금 */
const gubuncode_installment_savings = 14;

async function main() {
	const fp = path.resolve(process.cwd(), 'data/banks.json');
	const text = await fs.readFile(fp, 'utf-8');
	const banks = JSON.parse(text) as BankDefinition[];
	const ids = _.uniq(banks.map(x => x.gmgoCd));

	// await stage_fetch(banks);
	await stage_parse(ids);
}

async function stage_parse(ids: string[]) {
	for (const id of ids) {
		const filename = `${id}_예금.html`;
		const fp = path.resolve(process.cwd(), '_cache_bank', filename);
		const text = await fs.readFile(fp, 'utf-8');
		const root = parseHtml(text);

		const products: Product[] = [];

		// 조회 기준일
		const elem_baseDate = root.querySelector('.base-date');
		const baseDate = elem_baseDate?.textContent ?? '<blank>';
		// "조회기준일(2022/02/13)"
		// console.log(baseDate_text);

		const elems_table = root.querySelectorAll('.tblWrap');
		for (const elem_table of elems_table) {
			const elem_title = elem_table.querySelector('.tbl-tit');
			const title = elem_title?.textContent ?? '<blank>';

			// 기본 이율: divTmp1
			const entries_normal: InterestRateEntry[] = [];
			const elems_tr = elem_table.querySelectorAll('#divTmp1 tbody tr')!;
			for (const elem of elems_tr) {
				const elem_tds = elem.childNodes.filter(x => x.nodeType === NodeType.ELEMENT_NODE);
				const td_key = elem_tds[elem_tds.length - 2];
				const td_value = elem_tds[elem_tds.length - 1];

				const key = td_key.innerText;
				const value = td_value.innerText;
				const entry: InterestRateEntry = {
					duration: key,
					rate: value,
				};
				entries_normal.push(entry);
			}

			const product: Product = {
				title,
				entries_normal,
			};
			products.push(product);
		}

		const bank: BankModel = {
			gmgoCd: id,
			baseDate,
			products,
		};

		const fp_output = path.resolve(process.cwd(), 'data_bank', `rate_${id}.json`);
		const text_output = stringifyJson(bank, { maxLength: 60 });
		await fs.writeFile(fp_output, text_output);
		console.log(`parse ${id}`);
	}
}

async function stage_fetch(ids: string[]) {
	const fn_deposit = async (trmid: string) => {
		try {
			const text = await fetch_info(trmid, gubuncode_deposit);
			const filename = `${trmid}_예금.html`;
			const fp = path.resolve(process.cwd(), '_cache_bank', filename);
			await fs.writeFile(fp, text);
			console.log(`fetch ${filename}`);

		} catch (e) {
			if (e instanceof Error) {
				console.error(e.message);
			}
		}
	};

	const limit = pLimit(10);
	const promises = ids.map(id => limit(() => fn_deposit(id)));
	await Promise.all(promises);
}

async function fetch_info(
	trmid: string,
	gubuncode: number,
): Promise<string> {
	const headers = {
		'Content-Type': 'application/x-www-form-urlencoded',
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.82 Safari/537.36',
	};

	const url = `https://www.kfcc.co.kr/map/goods_19.do?OPEN_TRMID=${trmid}&gubuncode=${gubuncode}`;
	const resp = await fetch(url, { headers });
	const text = await resp.text();

	if (resp.status >= 400) {
		throw new Error(resp.statusText);
	}

	const lines = text.split('\n');
	const line_alert = lines.find(x => x.trim().startsWith('alert('));
	const re_alert = /alert\("(.+)"\);/
	const match_alert = line_alert ? re_alert.exec(line_alert) : null;
	if (match_alert) {
		throw new Error(match_alert[1]);
	}

	return text;
}

main()
	.then(x => process.exit(0))
	.catch(e => console.error(e));
