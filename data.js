const clientDetails = { 
	storeName: "P&P Mini Mart", //	HoneyVille Pharmay & Stores
	address: "42, Broadway, Obasanjo street, Ita-eko, Abk.",
	phone: "08000000000",
	invoiceWarning: 'GOODS SOLD IN GOOD CONDITION ARE NOT RETURNABLE',
	appreciation: 'THANKS FOR YOUR PATRONAGE',
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

/*	https://stackblitz.com/edit/disable-dates-datetime-react-app?file=src%2FApp.js
	// disable past dates
	const yesterday = moment().subtract(1, 'day');
	const disablePastDt = current => {
		return current.isAfter(yesterday);
	};

	// disable future dates
	const today = moment();
	const disableFutureDt = current => {
		return current.isBefore(today)
	}

	// disable weekends
	const disableWeekends = current => {
		return current.day() !== 0 && current.day() !== 6;
	}

	// disable the list of custom dates
	const customDates = ['2020-04-08', '2020-04-04', '2020-04-02'];
	const disableCustomDt = current => {
	return !customDates.includes(current.format('YYYY-MM-DD'));
	}

	return (
	<div className="App">
		<h2>Disable dates in react-datetime - <a href="https://www.cluemediator.com" target="_blank">Clue Mediator</a></h2>

		<p className="title">Disable past dates:</p>
		<DatePicker
			timeFormat={false}
			isValidDate={disablePastDt}
		/>

		<p className="title">Disable future dates:</p>
		<DatePicker
			timeFormat={false}
			isValidDate={disableFutureDt}
		/>

		<p className="title">Disable weekends:</p>
		<DatePicker
			timeFormat={false}
			isValidDate={disableWeekends}
		/>

		<p className="title">Disable the list of custom dates: <small>(2020-04-08, 2020-04-04, 2020-04-02)</small></p>
		<DatePicker
			timeFormat={false}
			isValidDate={disableCustomDt}
		/>
	</div>
	);
*/

export {
	clientDetails,
};
