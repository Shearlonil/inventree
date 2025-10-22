import { useEffect, useState } from 'react'
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Table } from 'react-bootstrap';
import numeral from 'numeral';
import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable'
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

import { useAuth } from '../../app-context/auth-user-context';
import financeController from '../../Controllers/finance-controller';
import OffcanvasMenu from '../../Components/OffcanvasMenu';
import SVG from '../../assets/Svg';
import StartEndDateSearch from '../../Components/StartEndDateSearch';
import handleErrMsg from '../../Utils/error-handler';
import { useFinance } from '../../app-context/finance-context';
import { clientDetails } from '../../../data';

const TrialBalance = () => {
    applyPlugin(jsPDF);
    const navigate = useNavigate();
        
    const { handleRefresh, logout, authUser } = useAuth();
    const { addGroup, getGroup, grandTotal, clear } = useFinance();
    const user = authUser();
            
    const [networkRequest, setNetworkRequest] = useState(false);

    const [assets, setAssets] = useState({});
    const [liabilities, setLiabilities] = useState({});
    const [currentProfitLoss, setCurrentProfitLoss] = useState({});
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

	const offCanvasMenuItems = [
		{ label: "Export to PDF", onClickParams: {evtName: 'pdfExport'} },
		{ label: "Export to Excel", onClickParams: {evtName: 'xlsxExport'} },
	];
    
    useEffect( () => {
        if(user.hasAuth('FINANCE')){
            clear();
        }else {
            toast.error("Account doesn't support viewing this page. Please contact your supervisor");
            navigate('/');
        }
    }, []);

    const fnSearch = async (data) => {
        try {
            if (data.startDate && data.endDate) {
                clear();
                setAssets({});
                setLiabilities({});
                setCurrentProfitLoss({});
                //  Time isn't important here (Java will set the time to 23:59:59). Just setting to 12hr to avoid 1hr lag
                const startDate = format(data.startDate, "yyyy-MM-dd") + "T01:00:00.000Z";
                const endDate = format(data.endDate, "yyyy-MM-dd") + "T23:59:59.000Z";
                setStartDate(startDate);
                setEndDate(endDate);

                setNetworkRequest(true);

                const response = await financeController.trialBal(startDate, endDate);
                if(response && response.data){
                    setAssets(response.data.Assets);
                    const pl = response.data.currentProfitLoss;
                    delete pl.costOfSales;
                    setCurrentProfitLoss(pl);
                    const liabs = response.data.Liabilities
                    //  profit & loss opening balance
                    let val = profitLossCalc(response.data.accumulatedProfitLoss);
                    const profitLossOpeningBal = {
                        ledgerName: 'Opening Balance',
                        //  If profit, Cr. If loss, Dr
                        crAmount: val > 0 ? val : 0,
                        drAmount: val < 0 ? val : 0,
                        balance: 0
                    };
                    let profitLoss = "Profit & Loss Acc";
                    liabs[profitLoss] = [profitLossOpeningBal];
                    setLiabilities(liabs);
                }
                setNetworkRequest(false);
            }
        } catch (error) {
            setNetworkRequest(false);
            //	Incase of 500 (Invalid Token received!), perform refresh
            try {
                if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                    await handleRefresh();
                    return fnSearch(data);
                }
                // Incase of 401 Unauthorized, navigate to 404
                if(error.response?.status === 401){
                    navigate('/404');
                }
                // display error message
                toast.error(handleErrMsg(error).msg);
            } catch (error) {
                // if error while refreshing, logout and delete all cookies
                logout();
            }
            toast.error(handleErrMsg(error).msg);
        }
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
        const title = `Trial Balance ${period}`;
        const xCoordinate = doc.internal.pageSize.width / 2; // Calculate the center of the page

        doc.text(client, xCoordinate, 40, { align: 'center' }); // 40 is the Y-coordinate
        doc.setFontSize(14);
        doc.text("Trial Balance", xCoordinate, 60, { align: 'center' }); // 60 is the Y-coordinate
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(period, xCoordinate, 75, { align: 'center' }); // 70 is the Y-coordinate
        
        const arr = [];
        const boldRows = [0];
        {Object.keys(assets).forEach(key => {
            const temp = {
                ledgerName: key,
                drAmount: numeral(getGroup(key).drAmount).format('₦0,0.00'),
                crAmount: numeral(getGroup(key).crAmount).format('₦0,0.00'),
            }
            arr.push(temp);
            arr.push(...assets[key]);

            boldRows.push(arr.length);
        })}

        {Object.keys(currentProfitLoss).forEach(key => {
            const temp = {
                ledgerName: key,
                drAmount: numeral(getGroup(key).drAmount).format('₦0,0.00'),
                crAmount: numeral(getGroup(key).crAmount).format('₦0,0.00'),
            }
            arr.push(temp);
            arr.push(...currentProfitLoss[key]);

            boldRows.push(arr.length);
        })}

        {Object.keys(liabilities).forEach(key => {
            const temp = {
                ledgerName: key,
                drAmount: numeral(getGroup(key).drAmount).format('₦0,0.00'),
                crAmount: numeral(getGroup(key).crAmount).format('₦0,0.00'),
            }
            arr.push(temp);
            arr.push(...liabilities[key]);

            boldRows.push(arr.length);
        })}

        const gTotal = {
            ledgerName: "Grand Total",
            drAmount: numeral(grandTotal().drAmount).format('₦0,0.00'),
            crAmount: numeral(grandTotal().crAmount).format('₦0,0.00'),
        }
        arr.push(gTotal);

        doc.autoTable({
            styles: { theme: 'striped' },
            margin: { top: 80 },
            showHead: 'firstPage',
            body: arr,
            head: [['Description', 'Debit', 'Credit']],
            columns: [
                { header: 'Description', dataKey: 'ledgerName' },
                { header: 'Debit', dataKey: 'drAmount' },
                { header: 'Credit', dataKey: 'crAmount' },
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
        const title = `Trial Balance ${period}`;

        const Heading = [ {ledgerName: "Description", drAmount: "Debit", crAmount: "Credit" } ];

        const arr = [];
        const temp = [];
        {Object.keys(assets).forEach(key => {
            const temp = {
                ledgerName: key,
                drAmount: "",
                crAmount: "",
            }
            arr.push(temp);
            arr.push(...assets[key]);
        })}

        {Object.keys(currentProfitLoss).forEach(key => {
            const temp = {
                ledgerName: key,
                drAmount: "",
                crAmount: "",
            }
            arr.push(temp);
            arr.push(...currentProfitLoss[key]);
        })}

        {Object.keys(liabilities).forEach(key => {
            const temp = {
                ledgerName: key,
                drAmount: "",
                crAmount: "",
            }
            arr.push(temp);
            arr.push(...liabilities[key]);
        })}
        arr.forEach(d => {
            delete d.id;
            delete d.ledgerId;
            delete d.ledgerVchId;
            delete d.balance;
            delete d.date;
            delete d.description;
            temp.push(d);
        });
        const wscols = [
            { wch: Math.max(...temp.map(datum => datum.ledgerName.length)) },
            { wch: 15 },
            { wch: 15 }
        ];
        const ws = XLSX.utils.json_to_sheet(Heading, {
            header: ["ledgerName", "drAmount", "crAmount"
            ],
            skipHeader: true,
            origin: 0 //ok
        });
        ws["!cols"] = wscols;
        XLSX.utils.sheet_add_json(ws, temp, {
            header: ["ledgerName", "drAmount", "crAmount"
            ],
            skipHeader: true,
            origin: -1 //ok
        });
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const finalData = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(finalData, `${title}` + fileExtension);
    }

    const profitLossCalc = (obj) => {
        // cost of sales
        const costOfSalesArr = [...obj.costOfSales];
        // direct expenses
        const directExpData = obj.directExpenses;
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

        // direct income
        const directIncomeData = obj.directIncome;
        const directIncomeAmount = directIncomeData
            .map(obj => obj.balance)
            .reduce((currentVal, accumulator) => numeral(currentVal).add(accumulator).value(), 0);

        // indirect income
        const indirectIncomeData = obj.indirectIncome;
        const indirectIncomeAmount = indirectIncomeData
            .map(obj => obj.balance)
            .reduce((currentVal, accumulator) => numeral(currentVal).add(accumulator).value(), 0);

        // cost of sales
        costOfSalesArr.sort((a, b) => a.id - b.id);
        const costOfSalesAmount = numeral(costOfSalesArr[0].balance).add(costOfSalesArr[1].balance).subtract(costOfSalesArr[2].balance).value();

        // direct expenses
        const directExpAmount = directExpData
            .map(obj => obj.balance)
            .reduce((currentVal, accumulator) => numeral(currentVal).add(accumulator).value(), 0);

        // indirect expenses
        const indirectExpData = obj.indirectExpenses;
        const indirectExpAmount = indirectExpData
            .map(obj => obj.balance)
            .reduce((currentVal, accumulator) => numeral(currentVal).add(accumulator).value(), 0);

        // sales account
        const salesAccData = obj.salesAccounts;
        const salesAccAmount = salesAccData
            .map(obj => obj.balance)
            .reduce((currentVal, accumulator) => numeral(currentVal).add(accumulator).value(), 0);

        let totalIn = numeral(salesAccAmount).add(directIncomeAmount).add(indirectIncomeAmount).value();
        let totalExp = numeral(costOfSalesAmount).add(directExpAmount).add(indirectExpAmount).value();
        return numeral(totalIn).subtract(totalExp).value();
    }

	const buildAssetLiabSection = (key, i, type) => {
        return <div className="row p-3 mt-2" key={i + key}>
            <div className='mt-2 border py-4 px-5 bg-white-subtle rounded-4' style={{ boxShadow: "black 3px 2px 5px" }}>
                <div className="d-flex flex-row flex-wrap justify-content-between">
                    <h5 className="paytone-one fw-bold" style={{color: '#057415ff'}}>{key}</h5>
                    <div className="d-flex flex-column">
                        <h5>Debit</h5>
                        <h3>{numeral(getGroup(key).drAmount).format('₦0,0.00')}</h3>
                    </div>
                    <div className="d-flex flex-column">
                        <h5>Credit</h5>
                        <h3>{numeral(getGroup(key).crAmount).format('₦0,0.00')}</h3>
                    </div>
                </div>
                <div style={{ maxHeight: "350px", overflow: 'scroll' }}>
                    <Table id="myTable" className="rounded-2" striped hover responsive>
                        <thead>
                            <tr className="shadow-sm">
                                <th className='text-danger'>Description</th>
                                <th className='text-danger'>Debit</th>
                                <th className='text-danger'>Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {type === 'assets' ? assets[key]?.map((_datum, index) => (
                                <tr className='' key={index}>
                                    <td>{_datum.ledgerName}</td>
                                    <td>{numeral(_datum.drAmount).format('₦0,0.00')}</td>
                                    <td>{numeral(_datum.crAmount).format('₦0,0.00')}</td>
                                </tr>
                            )) : liabilities[key]?.map((_datum, index) => (
                                <tr className='' key={index}>
                                    <td>{_datum.ledgerName}</td>
                                    <td>{numeral(_datum.drAmount).format('₦0,0.00')}</td>
                                    <td>{numeral(_datum.crAmount).format('₦0,0.00')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    }

	const buildProfitLossSection = (key, i) => {
        return <div className="row p-3" key={i + key}>
            <div className='mt-2 border py-4 px-5 bg-white-subtle rounded-4' style={{ boxShadow: "black 3px 2px 5px" }}>
                <div className="d-flex flex-row flex-wrap justify-content-between">
                    <h5 className="paytone-one fw-bold" style={{color: '#057415ff'}}>{key}</h5>
                    <div className="d-flex flex-column">
                        <h5>Debit</h5>
                        <h3>{numeral(getGroup(key).drAmount).format('₦0,0.00')}</h3>
                    </div>
                    <div className="d-flex flex-column">
                        <h5>Credit</h5>
                        <h3>{numeral(getGroup(key).crAmount).format('₦0,0.00')}</h3>
                    </div>
                </div>
                <div style={{ maxHeight: "350px", overflow: 'scroll' }}>
                    <Table id="myTable" className="rounded-2" striped hover responsive>
                        <thead>
                            <tr className="shadow-sm">
                                <th className='text-danger'>Description</th>
                                <th className='text-danger'>Debit</th>
                                <th className='text-danger'>Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentProfitLoss[key]?.map((_datum, index) => (
                                <tr className='' key={index}>
                                    <td>{_datum.ledgerName}</td>
                                    <td>{numeral(_datum.drAmount).format('₦0,0.00')}</td>
                                    <td>{numeral(_datum.crAmount).format('₦0,0.00')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    }

    return (
        <div style={{minHeight: '75vh'}} className='container'>
            <div className="container-md mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
				<OffcanvasMenu menuItems={offCanvasMenuItems} menuItemClick={handleOffCanvasMenuItemClick} variant="danger" />
				<div className="text-center d-flex">
					<h2 className="display-6 p-3 mb-0">
						<span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Trial Balance</span>
						<img src={SVG.income_statement} style={{ width: "50px", height: "50px" }} />
					</h2>
				</div>
                <span className='text-center m-1'>
                    {/* https://www.financestrategists.com/accounting/final-accounts/trading-account/ */}
                    A financial report that summarizes a company's financial performance over a specific accounting period. 
                    It includes a company's revenue, expenses, and net income.
                </span>
			</div>

            <div className="row p-3">
                <StartEndDateSearch networkRequest={networkRequest} fnSearch={fnSearch} />
            </div>
            {Object.keys(assets).map((key, idx) => {
                addGroup(assets, key, 'assets');
                return buildAssetLiabSection(key, idx, 'assets');
            })}
            {Object.keys(currentProfitLoss).map((key, idx) => {
                addGroup(currentProfitLoss, key, 'currentProfitLoss');
                return buildProfitLossSection(key, idx);
            })}
            {Object.keys(liabilities).map((key, idx) => {
                addGroup(liabilities, key, 'liabilities');
                return buildAssetLiabSection(key, idx, 'liabilities');
            })}

            <hr />
            <div className="d-flex flex-row flex-wrap justify-content-between">
                <h3 className="paytone-one fw-bold" style={{color: '#8a2be2'}}>Grand Total</h3>
                <div className="d-flex flex-row flex-wrap gap-4">
                    <div className="d-flex flex-column">
                        <h5>Debit</h5>
                        <h3>{numeral(grandTotal().drAmount).format('₦0,0.00')}</h3>
                    </div>
                    <div className="d-flex flex-column">
                        <h5>Credit</h5>
                        <h3>{numeral(grandTotal().crAmount).format('₦0,0.00')}</h3>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TrialBalance;