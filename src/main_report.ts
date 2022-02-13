import _ from 'lodash';
import path from 'path';
import { promises as fs } from 'fs';
import { stringify as stringifyCsv } from 'csv-stringify/sync';
import { BankDefinition, BankModel } from './types';

async function load_db() {
	const fp = path.resolve(process.cwd(), 'data/banks.json');
	const text = await fs.readFile(fp, 'utf-8');
	const definitions = JSON.parse(text) as BankDefinition[];
	const ids = _.uniq(definitions.map(x => x.gmgoCd));

	const banks: BankModel[] = [];
	for (const id of ids) {
		const fp = path.resolve(process.cwd(), `data_bank/rate_${id}.json`);
		const text = await fs.readFile(fp, 'utf-8');
		const json = JSON.parse(text) as BankModel;
		banks.push(json);
	}

	return {
		definitions,
		banks,
	};
}

async function main() {
	const result = await load_db();
	const banks = result.banks;
	// 본점만 신경쓴다. 본점과 지점의 이자율은 똑같을것이다
	const definitions = result.definitions.filter(x => x.divCd === '001');

	const table_bank = new Map<string, BankModel>(banks.map(x => [x.gmgoCd, x]));
	const table_definition = new Map<string, BankDefinition>(definitions.map(x => [x.gmgoCd, x]));

	// MG더뱅킹정기예금 금리만 뽑아보고 싶다
	const mat: string[][] = [
		['gmgoCd', 'gmgoNm', 'rate'],
	];

	for (const def of definitions) {
		const { gmgoCd } = def;
		const bank = table_bank.get(gmgoCd)!;

		const found = bank.products.find(x => x.title === 'MG더뱅킹정기예금');
		if (!found) { continue; }

		const rate_text = found.entries_normal[0]!.rate!;
		const rate = rate_text.replace('연', '').replace('%', '');

		// csv로 보낼값
		const values: string[] = [
			gmgoCd,
			def.gmgoNm,
			rate,
		];
		mat.push(values);
	}

	const csv = stringifyCsv(mat);
	await fs.writeFile('report_rate.csv', csv);
}
main()
	.then(x => process.exit(0))
	.catch(e => console.error(e));
