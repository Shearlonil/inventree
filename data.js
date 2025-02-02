const clientDetails = { 
	storeName: "Mr. Farouk", 
	address: "Mr. Farouk",
	phone: "",
}

const selectOption = [
	{ value: "Mr. Farouk", label: "Mr. Farouk" },
	{ value: "mrs", label: "Mrs" },
	{ value: "miss", label: "Miss" },
	{ value: "ms", label: "Ms" },
	{ value: "others", label: "Others" },
];

const customerName = [
	{ value: "olumide", label: "Olumide" },
	{ value: "olumide", label: "Olumide" },
	{ value: "olumide", label: "Olumide" },
	{ value: "olumide", label: "Olumide" },
	{ value: "olumide", label: "Olumide" },
];
const purchasesSubMenu = [
	{ label: "File", path: "/file" },
	{ label: "Edit", path: "/Edit" },
	{ label: "File", path: "/file" },
];
const sectionOption = [
	{ value: "pharmarcy", label: "Pharmarcy" },
	{ value: "hotel", label: "Hotel" },
	{ value: "superMarket", label: "SuperMarket" },
];
const packagingOptions = [
	{ value: "unit", label: "Unit" },
	{ value: "pack", label: "Packs" },
	{ value: "gram", label: "Gram(s)" },
];
const purchasesOptions = [
	{ value: true, label: "Cash" },
	{ value: false, label: "Credit" },
];

//	menus for the ellipse menu-button
const reactMenuItems = [
	{ name: 'Cut', onClickParams: {evtName: 'cut'} },
	{ name: 'Copy', onClickParams: {evtName: 'copy'} },
	{ name: 'Paste', onClickParams: {evtName: 'paste'} },
	{
		name: 'Edit',
		subMenuList: [
			{ name: 'Cut', onClickParams: {evtName: 'cut'} },
			{ name: 'Copy', onClickParams: {evtName: 'copy'} },
			{ name: 'Paste', onClickParams: {evtName: 'paste'} },
			{ name: 'Edit',
				subMenuList: [
					{ name: 'Find', onClickParams: {evtName: 'find'} },
					{ name: 'Find Next', onClickParams: {evtName: 'findNext'} },
					{ name: 'Previous', onClickParams: {evtName: 'previous'} },
				]
				},
		]
	},
];

const tableData = [
	{itemName: 'PREGMOM PLUS TABLETS (DARAVIT)', qty: 100, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
	{itemName: 'CEFIXIME SUSP 100ML (AQUIXIM)', qty: 9000, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
	{itemName: 'ERYTHROMYCIN TAB 500MG (ERYTHROCARE)', qty: 453322, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
	{itemName: 'CIPROTAB-TN TABLETS 500/600MG', qty: 1, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
	{itemName: 'METHYLATED SPIRIT 200MLS', qty: 1, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
	{itemName: 'ERYTHROMYCIN SUSP. 125MG (TUYIL)', qty: 1, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
	{itemName: 'GRIPE WATER 100MLS (WOODWARDS)', qty: 1, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
	{itemName: 'ASOMEX 5MG TAB (S-AMLODIPINE)', qty: 1, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
	{itemName: 'METOCLOPRAMIDE INJ 10MG (MAXOLON)', qty: 1, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
	{itemName: 'BROMAZEPAM (BROMATAN) 1.5MG', qty: 1, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
	{itemName: 'ERYTHROMYCIN 500MG TAB. (NEMEL)', qty: 1, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
	{itemName: 'STREPSIL LOZENGES (12TABS/BLISTER)', qty: 1, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
];

export {
	clientDetails,
	selectOption,
	customerName,
	purchasesSubMenu,
	sectionOption,
	packagingOptions,
	purchasesOptions,
	reactMenuItems,
};
