import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import numeral from 'numeral';

import SVG from '../../assets/Svg';
import StartEndDateSearch from '../../Components/StartEndDateSearch';
import { useAuth } from '../../app-context/auth-user-context';
import handleErrMsg from '../../Utils/error-handler';
import financeController from '../../Controllers/finance-controller';
import OffcanvasMenu from '../../Components/OffcanvasMenu';

const TradingAcc = () => {
    const navigate = useNavigate();
        
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();
            
    const [networkRequest, setNetworkRequest] = useState(false);

    const [salesAcc, setSalesAcc] = useState([]);
    const [salesAccAmount, setSalesAccAmount] = useState(0);

    const [directIncome, setDirectIncome] = useState([]);
    const [directIncomeAmount, setDirectIncomeAmount] = useState(0);

    const [costOfSales, setCostOfSales] = useState([]);
    const [costOfSalesAmount, setCostOfSalesAmount] = useState(0);

    const [directExp, setDirectExp] = useState([]);
    const [directExpAmount, setDirectExpAmount] = useState(0);

    const [grossProfit, setGrossProfit] = useState(0);

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
    }, []);


    const fnSearch = async (data) => {
        try {
            if (data.startDate && data.endDate) {
                reset();
                const startDate = format(data.startDate, "yyyy-MM-dd") + "T01:00:00.000Z";
                const endDate = format(data.endDate, "yyyy-MM-dd") + "T23:59:59.000Z";

                setNetworkRequest(true);

                const response = await financeController.tradingAcc(startDate, endDate);
                if(response && response.data){
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

                    // direct income
                    const directIncomeData = response.data.directIncome;
                    const directIncomeAmount = directIncomeData
                        .map(obj => obj.balance)
                        .reduce((currentVal, accumulator) => numeral(currentVal).add(accumulator).value(), 0);
                    setDirectIncome([...directIncomeData]);
                    setDirectIncomeAmount(directIncomeAmount);

                    // cost of sales
                    costOfSalesArr.sort((a, b) => a.id - b.id);
                    setCostOfSales(costOfSalesArr);
                    const costOfSalesAmount = numeral(costOfSalesArr[0].balance).add(costOfSalesArr[1].balance).subtract(costOfSalesArr[2].balance).value();
                    setCostOfSalesAmount(costOfSalesAmount);

                    // direct expenses
                    setDirectExp([...directExpData]);
                    const directExpAmount = directExpData
                        .map(obj => obj.balance)
                        .reduce((currentVal, accumulator) => numeral(currentVal).add(accumulator).value(), 0)
                    setDirectExpAmount(directExpAmount);

                    // sales account
                    const salesAccData = response.data.salesAccounts;
                    setSalesAcc([...salesAccData]);
                    const salesAccAmount = salesAccData
                        .map(obj => obj.balance)
                        .reduce((currentVal, accumulator) => numeral(currentVal).add(accumulator).value(), 0)
                    setSalesAccAmount(salesAccAmount);

                    let totalIn = numeral(salesAccAmount).add(directIncomeAmount).value();
                    let totalExp = numeral(costOfSalesAmount).add(directExpAmount).value();
                    setGrossProfit(numeral(totalIn).subtract(totalExp).value());
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
                break;
            case 'xlsxExport':
                break;
        }
	}

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