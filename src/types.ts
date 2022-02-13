export interface BankDefinition {
	gmgoCd: string;
	gmgoNm: string;
	divCd: string;
	divNm: string;
	r1: string;
	r2: string;
}

export interface InterestRateEntry {
	duration: string;
	rate: string;
}

export interface Product {
	title: string;
	entries_normal: InterestRateEntry[];
}

export interface BankModel {
	gmgoCd: string;
	baseDate: string;
	products: Product[];
}
