import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import numeral from 'numeral';
import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable'
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

import SVG from '../../assets/Svg';
import StartEndDateSearch from '../../Components/StartEndDateSearch';
import handleErrMsg from '../../Utils/error-handler';
import OffcanvasMenu from '../../Components/OffcanvasMenu';
import { clientDetails } from '../../../data';
import { useAuthUser } from '../../app-context/user-context';
import useFinanceController from '../../Controllers/finance-controller-hook';

const TradingAcc = () => {
    applyPlugin(jsPDF);
    
    const controllerRef = useRef(new AbortController());
    const navigate = useNavigate();
    const location = useLocation();
    
    const { tradingAcc } = useFinanceController();
    const { authUser } = useAuthUser();
    const user = authUser();
            
    const [networkRequest, setNetworkRequest] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const [salesAcc, setSalesAcc] = useState([]);
    const [salesAccAmount, setSalesAccAmount] = useState(0);

    const [directIncome, setDirectIncome] = useState([]);
    const [directIncomeAmount, setDirectIncomeAmount] = useState(0);

    const [costOfSales, setCostOfSales] = useState([]);
    const [costOfSalesAmount, setCostOfSalesAmount] = useState(0);

    const [directExp, setDirectExp] = useState([]);
    const [directExpAmount, setDirectExpAmount] = useState(0);

    const [grossProfit, setGrossProfit] = useState(0);
    const [boldRows, setBoldRows] = useState([]);
    const [pdfContent, setPdfContent] = useState([]);

	const offCanvasMenuItems = [
		{ label: "Export to PDF", onClickParams: {evtName: 'pdfExport'} },
		{ label: "Export to Excel", onClickParams: {evtName: 'xlsxExport'} },
	];
    
    useEffect( () => {
        if(user.hasAuth('FINANCE')){
            //  do nothing, continue
        }else {
            toast.error("Account doesn't support viewing this page. Please contact your supervisor");
            navigate('/404');
        }
        return () => {
            // This cleanup function runs when the component unmounts or when the dependencies of useEffect change (e.g., route change)
            controllerRef.current.abort();
        };
    }, [location.pathname]);


    const fnSearch = async (data) => {
        try {
            if (data.startDate && data.endDate) {
                reset();
                resetAbortController();
                //  Time isn't important here (Java will set the time to 23:59:59). Just setting to 12hr to avoid 1hr lag
                const startDate = format(data.startDate, "yyyy-MM-dd") + "T01:00:00.000Z";
                const endDate = format(data.endDate, "yyyy-MM-dd") + "T23:59:59.000Z";
                setStartDate(startDate);
                setEndDate(endDate);


                setNetworkRequest(true);

                const response = await tradingAcc(startDate, endDate, controllerRef.current.signal);
                if(response && response.data){
                    const arr = [];
                    const boldRows = [0];
                    // cost of sales
                    const costOfSalesArr = [...response.data.costOfSales];
                    // direct expenses
                    const directExpData = response.data.directExpenses;
                    // remove purchases from direct expenses and add to cost of sales
                    const purchasesIndexPos = directExpData.findIndex(i => i.ledgerName.toLowerCase() === 'purchases');
                    if(purchasesIndexPos > -1){
                        /*  cut out purchases found at index position. splice returns a new array with cut out element in it
                            NOTE: assignment of id for items in costOfSales arr
                            openingStock if present, id = 1
                            purchases if found, id = 2
                            closingStock from server, id = 3
                        */
				        const purchases = directExpData.splice(purchasesIndexPos, 1);
                        purchases[0].id = 2;
                        purchases[0].ledgerName = "Add: Purchases";
                        costOfSalesArr.push(purchases[0]);
                    }else {
                        //  purchases not found, probably due to no purchases. Add purchases obj manually coz it will used in calculations later
                        const purchases = {
                            id : 1,
                            ledgerName: "Add: Purchases",
                            balance: 0
                        }
                        costOfSalesArr.push(purchases);
                    }

                    // sales account
                    const salesAccData = response.data.salesAccounts;
                    setSalesAcc([...salesAccData]);
                    const salesAccAmount = salesAccData
                        .map(obj => obj.balance)
                        .reduce((currentVal, accumulator) => numeral(currentVal).add(accumulator).value(), 0);
                    setSalesAccAmount(salesAccAmount);
                    const tempSalesAcc = {
                        ledgerName: "Sales Accounts",
                        drAmount: "",
                        crAmount: numeral(salesAccAmount).format('₦0,0.00'),
                    }
                    arr.push(tempSalesAcc);
                    arr.push(...salesAccData);

                    boldRows.push(arr.length);

                    // direct income
                    const directIncomeData = response.data.directIncome;
                    const directIncomeAmount = directIncomeData
                        .map(obj => obj.balance)
                        .reduce((currentVal, accumulator) => numeral(currentVal).add(accumulator).value(), 0);
                    setDirectIncome([...directIncomeData]);
                    setDirectIncomeAmount(directIncomeAmount);
                    const tempDirectIncome = {
                        ledgerName: "Direct Income",
                        drAmount: "",
                        crAmount: numeral(directIncomeAmount).format('₦0,0.00'),
                    }
                    arr.push(tempDirectIncome);
                    arr.push(...directIncomeData);

                    boldRows.push(arr.length);

                    // cost of sales
                    costOfSalesArr.sort((a, b) => a.id - b.id);
                    setCostOfSales(costOfSalesArr);
                    const costOfSalesAmount = numeral(costOfSalesArr[0].balance).add(costOfSalesArr[1].balance).subtract(costOfSalesArr[2].balance).value();
                    setCostOfSalesAmount(costOfSalesAmount);
                    const tempCostOfSales = {
                        ledgerName: "Cost Of Sales",
                        drAmount: "",
                        crAmount: numeral(costOfSalesAmount).format('₦0,0.00'),
                    }
                    arr.push(tempCostOfSales);
                    arr.push(...costOfSalesArr);

                    boldRows.push(arr.length);

                    // direct expenses
                    setDirectExp([...directExpData]);
                    const directExpAmount = directExpData
                        .map(obj => obj.balance)
                        .reduce((currentVal, accumulator) => numeral(currentVal).add(accumulator).value(), 0);
                    setDirectExpAmount(directExpAmount);
                    const tempDirectExp = {
                        ledgerName: "Direct Expenses",
                        drAmount: "",
                        crAmount: numeral(directExpAmount).format('₦0,0.00'),
                    }
                    arr.push(tempDirectExp);
                    arr.push(...directExpData);

                    boldRows.push(arr.length);

                    let totalIn = numeral(salesAccAmount).add(directIncomeAmount).value();
                    let totalExp = numeral(costOfSalesAmount).add(directExpAmount).value();
                    const gp = numeral(totalIn).subtract(totalExp).value();
                    setGrossProfit(gp);
                    
                    const grossProfit = {
                        ledgerName: "Gross Profit",
                        drAmount: "",
                        crAmount: numeral(gp).format('₦0,0.00'),
                    }
                    arr.push(grossProfit);
                    setBoldRows(boldRows);
                    setPdfContent(arr);
                }
                setNetworkRequest(false);
            }
        } catch (error) {
            setNetworkRequest(false);
            // Incase of 401 Unauthorized, navigate to 404
            if(error.response?.status === 401){
                navigate('/404');
                return;
            }
            // display error message
            toast.error(handleErrMsg(error).msg);
        }
    }

	const reset = () => {
        setSalesAccAmount(0);
        setSalesAcc([]);
        setDirectIncome([]);
        setDirectIncomeAmount(0);
        setCostOfSales([]);
        setCostOfSalesAmount(0);
        setDirectExp([]);
        setDirectExpAmount(0);
        setGrossProfit(0);
	}

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'pdfExport':
                exportPDF();
                break;
            case 'xlsxExport':
                exportXLXS();
                break;
        }
	}

    const exportPDF = () => {
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "portrait"; // portrait or landscape
        const fileExtension = ".pdf";

        const doc = new jsPDF(orientation, unit, size);

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');

        const client = `${clientDetails.storeName}`;
        const period = `${format(new Date(startDate), "dd/MM/yyyy")} - ${format(new Date(endDate), "dd/MM/yyyy")}`;
        const title = `Trading Account ${period}`;
        const xCoordinate = doc.internal.pageSize.width / 2; // Calculate the center of the page

        doc.text(client, xCoordinate, 40, { align: 'center' }); // 40 is the Y-coordinate
        doc.setFontSize(14);
        doc.text("Trading Account", xCoordinate, 60, { align: 'center' }); // 60 is the Y-coordinate
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(period, xCoordinate, 75, { align: 'center' }); // 70 is the Y-coordinate

        doc.autoTable({
            styles: { theme: 'striped' },
            margin: { top: 80 },
            showHead: 'firstPage',
            body: pdfContent,
            // head: [['Description', 'Debit', 'Credit']],
            columns: [
                { dataKey: 'ledgerName' },
                { dataKey: 'balance' },
                { dataKey: 'crAmount' },
            ],
            didParseCell: (data) => {
                if (boldRows.includes(data.row.index)) {
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });
            
        doc.save(`${title}` + fileExtension);
    }

    const exportXLXS = () => {
        //  ref: https://codesandbox.io/p/sandbox/react-export-excel-wrdew?file=%2Fsrc%2FApp.js

        const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const fileExtension = ".xlsx";
        const period = `${format(new Date(startDate), "dd/MM/yyyy")} - ${format(new Date(endDate), "dd/MM/yyyy")}`;
        const title = `Trading Account ${period}`;

        const Heading = [ {ledgerName: "", balance: "", crAmount: "" } ];

        const temp = [];
        pdfContent.forEach(d => {
            delete d.id;
            delete d.ledgerId;
            delete d.ledgerVchId;
            delete d.date;
            delete d.description;
            delete d.drAmount;
            temp.push(d);
        });
        const wscols = [
            { wch: Math.max(...temp.map(datum => datum.ledgerName.length)) },
            { wch: 15 },
            { wch: 15 }
        ];
        const ws = XLSX.utils.json_to_sheet(Heading, {
            header: ["ledgerName", "balance", "crAmount"
            ],
            skipHeader: true,
            origin: 0 //ok
        });
        ws["!cols"] = wscols;
        XLSX.utils.sheet_add_json(ws, temp, {
            header: ["ledgerName", "balance", "crAmount"
            ],
            skipHeader: true,
            origin: -1 //ok
        });
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const finalData = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(finalData, `${title}` + fileExtension);
    }

    const resetAbortController = () => {
        // Cancel previous request if it exists
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
        controllerRef.current = new AbortController();
    };

    return (
        <div style={{minHeight: '75vh'}} className='container'>
            <div className="container-md mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
				<OffcanvasMenu menuItems={offCanvasMenuItems} menuItemClick={handleOffCanvasMenuItemClick} variant="danger" />
				<div className="text-center d-flex">
					<h2 className="display-6 p-3 mb-0">
						<span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Trading Account</span>
						<img src={SVG.trading_account} style={{ width: "50px", height: "50px" }} />
					</h2>
				</div>
                <span className='text-center m-1'>
                    {/* https://www.financestrategists.com/accounting/final-accounts/trading-account/ */}
                    This account comprises items directly related to trading, i.e., net sales + closing stock minus opening stock + net purchases + 
                    direct expenses = gross profit or gross loss.
                </span>
			</div>

            <div className="row p-3">
                <StartEndDateSearch networkRequest={networkRequest} fnSearch={fnSearch} />
            </div>

            <div className="row p-3 mt-2">
                <div className="d-flex flex-row flex-wrap justify-content-between">
                    <h3 className="paytone-one fw-bold" style={{color: '#8a2be2'}}>Sales Account</h3>
                    <h2 className='fw-bold'>{numeral(salesAccAmount).format('₦0,0.00')}</h2>
                </div>
                <div style={{ maxHeight: "350px", overflow: 'scroll' }}>
                    <Table id="myTable" className="rounded-2" striped hover responsive>
                        <thead>
                            <tr className="shadow-sm">
                                <th className='text-danger'>Description</th>
                                <th className='text-danger'>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesAcc.map((_datum, index) => (
                                <tr className='' key={index}>
                                    <td>{_datum.ledgerName}</td>
                                    <td>{numeral(_datum.balance).format('₦0,0.00')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>

            <div className="row p-3 mt-2">
                <div className="d-flex flex-row flex-wrap justify-content-between">
                    <h3 className="paytone-one fw-bold" style={{color: '#8a2be2'}}>Direct Incomes</h3>
                    <h2 className='fw-bold'>{numeral(directIncomeAmount).format('₦0,0.00')}</h2>
                </div>
                <div style={{ maxHeight: "350px", overflow: 'scroll' }}>
                    <Table id="myTable" className="rounded-2" striped hover responsive>
                        <thead>
                            <tr className="shadow-sm">
                                <th className='text-danger'>Description</th>
                                <th className='text-danger'>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {directIncome.map((_datum, index) => (
                                <tr className='' key={index}>
                                    <td>{_datum.ledgerName}</td>
                                    <td>{numeral(_datum.balance).format('₦0,0.00')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>

            <div className="row p-3 mt-2">
                <div className="d-flex flex-row flex-wrap justify-content-between">
                    <h3 className="paytone-one fw-bold" style={{color: '#8a2be2'}}>Cost Of Sales</h3>
                    <h2 className='fw-bold'>{numeral(costOfSalesAmount).format('₦0,0.00')}</h2>
                </div>
                <div style={{ maxHeight: "350px", overflow: 'scroll' }}>
                    <Table id="myTable" className="rounded-2" striped hover responsive>
                        <thead>
                            <tr className="shadow-sm">
                                <th className='text-danger'>Description</th>
                                <th className='text-danger'>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {costOfSales.map((_datum, index) => (
                                <tr className='' key={index}>
                                    <td>{_datum.ledgerName}</td>
                                    <td>{numeral(_datum.balance).format('₦0,0.00')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>

            <div className="row p-3 mt-2">
                <div className="d-flex flex-row flex-wrap justify-content-between">
                    <h3 className="paytone-one fw-bold" style={{color: '#8a2be2'}}>Direct Expenses</h3>
                    <h2 className='fw-bold'>{numeral(directExpAmount).format('₦0,0.00')}</h2>
                </div>
                <div style={{ maxHeight: "350px", overflow: 'scroll' }}>
                    <Table id="myTable" className="rounded-2" striped hover responsive>
                        <thead>
                            <tr className="shadow-sm">
                                <th className='text-danger'>Description</th>
                                <th className='text-danger'>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {directExp.map((_datum, index) => (
                                <tr className='' key={index}>
                                    <td>{_datum.ledgerName}</td>
                                    <td>{numeral(_datum.balance).format('₦0,0.00')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>

            <hr />
            <div className="d-flex flex-row flex-wrap justify-content-between">
                <h3 className="paytone-one fw-bold" style={{color: '#8a2be2'}}>Gross Profit</h3>
                <h2 className='fw-bold'>{numeral(grossProfit).format('₦0,0.00')}</h2>
            </div>
        </div>
    )
}

export default TradingAcc;