const clientDetails = { 
	storeName: "P&P Mini Mart", //	HoneyVille Pharmay & Stores
	address: "42, Broadway, Obasanjo street, Ita-eko, Abk.",
	phone: "08000000000",
	invoiceWarning: 'GOODS SOLD IN GOOD CONDITION ARE NOT RETURNABLE',
	appreciation: 'THANKS FOR YOUR PATRONAGE',
	poweredBy: 'Genius Computer Technologies',
	gctContact: '08034262759'
}

const faqs = [
	{ 
		q: 'What is Inventree app?', 
		a: `Inventree is a fully custom network-based POS software, developed to manage and augment the operations of departmental stores. 
		It consists of basically four modules, namely: The Sales Point, The Stocking Point, The Admin Point and Finance.`,
		list: [
			'THE SALES POINT: This is the POS point where customers\' orders are taken, through the use of a barcode reader and transaction invoice printed afterwards.',
			'THE STOCKING POINT: This is the in-house point where newly bought goods are registered and made available for sale in THE SALES POINT module; hence, selling prices are as well determined at this point',
			'THE ADMIN POINT: This is the overseer module where every activity is being monitored on a real-time basis, be it sales, stock etc. Also, all comprehensive reports and that of other points could also be generated.',
			'FINANCE: This module gives financial reports like balance sheet, Trial Balance, Profit & Loss etc'
		],
	},
	{ 
		q: 'How can i create an account for a staff/sales representative?', 
		a: `You must have necessary administrative privileges to add staff/sales rep. To add staff/sales representative, follow these steps:`,
		list: [
			'Click DASHBOARD on the Nav bar',
			'Select USERS under QUICK MENU. This takes you to the USERS page',
			'Fill necessary/required fields',
			'click SAVE'
		],
		note: 'You will be able to see the added user in the table.'
	},
	{ 
		q: 'How can i edit staff/sales representative privileges?', 
		a: `You must first have administrative priviledges to edit or update staff/sales rep priviledges. To update staff/sales representative privileges, follow these steps:`,
		list: [
			'Click DASHBOARD on the Nav bar',
			'Select USERS under Quick Menu. This takes you to the USERS page',
			'Locate the account of interest from the table',
			'click the Menu button in the Options column in the table',
			'Select View. This takes you to the PERMISSIONS page',
			'Grant/Revoke permissions as you see fit'
		],
	},
	{ 
		q: 'What is the purpose of adding customers to your Inventree app?', 
		a: `The purpose of adding customers is to track customer transactions including which customers you owe money to or customers owing` 
	},
	{ 
		q: 'How can i create a customer\s account?', 
		a: `You must have necessary admin privileges to create account. Follow these simple steps`,
		list: [
			'Click CONTACTS',
			'Select CUSTOMERS',
			'Fill necessary/required fields',
			'click SAVE'
		],
		note: 'You will be able to see the added customer in the table.'
	},
	{ 
		q: 'How can i create a vendor\'s account?', 
		a: `You must have necessary admin privileges to create account. Follow these simple steps`,
		list: [
			'Click CONTACTS',
			'Select VENDORS',
			'Fill necessary/required fields',
			'click SAVE'
		],
		note: 'You will be able to see the added vendor in the table.'
	},
    { 
		q: 'How can i add new product?', 
		a: 'To add new products into your inventory, ',
		list: [
			'Click INVENTORY on the Nav bar',
			'Select NEW ENTRY. This takes you to the PRODUCT REGISTRATION page',
			'If using a mobile device, click the stock icon at the bottom right to open a form.',
			'Fill necessary/required fields',
			'click SAVE to add the product to the table',
			'When all products are added, click the round menu button (red button) at the bottom right corner of the screen to open a drawer menu.',
			'Select SAVE TO SALES/SHELF to add the items as well as there quantities to SALES POINT module and ready for sales',
			'Select SAVE TO STORE if you do not intend to get them ready to be added to SALES POINT module. This can later be made ready to sales by using the DISPENSARY page'
		],
		note: 'You will be able to see the added vendor in the table.'
	},
    { 
		q: 'How can I credit a customer\'s account?',
		a: `Crediting a customer\'s account/ledger is a simple process. On the Nav bar, Finance -> Account Vouchers -> Create. 
		Select the customer\'s ledger, enter description & amount and select the CREDIT option. Click Next to add the information to the table. 
		Next, select the receiving ledger (Cash, Bank, etc) to complete the two-legged transaction. Enter the description and same amount as before. Click Next to add this also to the table.
		Click OK to submit the transaction.`,
		note: 'CUSTOMERS maintain negative balance.'
	},
    { 
		q: 'How can i record upfront payment made to a vendor?', 
		a: 'This is similar to creditng customer\'s account',
		list: [
			'Click FINANCE on the Nav bar.',
			'Select ACCOUNT VOUCHERS',
			'Select CREATE',
			'Select the vendor\'s ledger, enter description and amount and select the DEBIT option',
			'Click Next to add the information to the table.',
			'Select the donor ledger (Cash, Bank, etc) to complete the two-legged transaction. Enter the description and same amount as before',
			'Click Next to add this also to the table.',
			'Click OK to submit the transaction.'
		],
		note: 'VENDOR maintain positive balance.'
	},
    { 
		q: 'How can i sell to customers on credit?', 
		a: 'You must have necessary admin privileges to update the CREDIT SALES feature.',
		list: [
			'Click CONTACTS',
			'Select CUSTOMERS',
			'find the customer of interest in the table of customers',
			'click the Menu button in the Options column in the table',
			'Select LEDGER. This takes you to the ACCOUNT LEDGER page',
			'Switch CREDIT SALES button from REVOKED to GRANTED',
		]
	},
    { 
		q: 'How can i record/monitor my expenses?', 
		a: 'You must have necessary admin privileges to record expenses.',
		list: [
			'On your DASHBOARD, Select EXPENSES under QUICK MENU. This takes you to the EXPENSES VOUCHER CREATION page',
			'Select the ledger of interest e.g utilities, advertising, transport, etc',
			'Enter DESCRIPTION, AMOUNT, DATE',
			'Click SAVE',
		] 
	},
    { 
		q: 'How can i record/monitor my income?', 
		a: 'You must have necessary admin privileges to record expenses.' ,
		list: [
			'On your DASHBOARD, Select INCOME under QUICK MENU. This takes you to the INCOME VOUCHER CREATION page',
			'Select the ledger of interest e.g tips, discount, etc',
			'Enter DESCRIPTION, AMOUNT, DATE',
			'Click SAVE',
		]
	},
    // { q: 'Where is my data stored and how secure is it?', a: 'Yes, we provide a range of vaccination services including flu shots, COVID-19 vaccines, and travel vaccinations. Walk-ins are welcome.' },
];

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
	faqs,
};
