const clientDetails = { 
	storeName: "P&P Mini Mart", 
	address: "Mr. Farouk",
	phone: "",
	invoiceWarning: 'GOODS SOLD IN GOOD CONDITION ARE NOT RETURNABLE',
	poweredBy: 'Genius Computer Technologies',
	gctContact: '08034262759'
}

/*
	jsPDF reference
	https://github.com/simonbengtsson/jsPDF-AutoTable/blob/main/examples/examples.js
	https://simonbengtsson.github.io/jsPDF-AutoTable/
*/

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
};
