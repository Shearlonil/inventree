import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import numeral from "numeral";
import { format } from "date-fns";
import { Table } from "react-bootstrap";

import { useAuth } from "../../app-context/auth-user-context";
import financeController from "../../Controllers/finance-controller";
import handleErrMsg from "../../Utils/error-handler";
import OffcanvasMenu from "../../Components/OffcanvasMenu";
import SVG from "../../assets/Svg";
import StartEndDateSearch from "../../Components/StartEndDateSearch";

const BalSheet = () => {
    const navigate = useNavigate();
    
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();
            
    const [networkRequest, setNetworkRequest] = useState(false);

    const [assets, setAssets] = useState({});
    const [liabilities, setLiabilities] = useState({});

    const [nettProfit, setNettProfit] = useState(0);

    const offCanvasMenuItems = [
        { label: "Export to PDF", onClickParams: {evtName: 'pdfExport'} },
        { label: "Export to Excel", onClickParams: {evtName: 'xlsxExport'} },
    ];


    const fnSearch = async (data) => {
        try {
            if (data.startDate && data.endDate) {
                setAssets([]);
                setLiabilities([]);
                const startDate = format(data.startDate, "yyyy-MM-dd") + "T01:00:00.000Z";
                const endDate = format(data.endDate, "yyyy-MM-dd") + "T23:59:59.000Z";

                setNetworkRequest(true);

                const response = await financeController.balSheet(startDate, endDate);
                if(response && response.data){
                    setAssets(response.data.Assets);
                    const liabs = response.data.Liabilities
                    //  profit & loss opening balance
                    const profitLossOpeningBal = {
                        ledgerName: 'Opening Balance',
                        balance: profitLossCalc(response.data.accumulatedProfitLoss)
                    };
                    //  profit & loss opening balance
                    const profitLossCurrentBal = {
                        ledgerName: 'Current Period',
                        balance: profitLossCalc(response.data.currentProfitLoss)
                    };
                    let profitLoss = "Profit & Loss Acc";
                    liabs[profitLoss] = [profitLossOpeningBal, profitLossCurrentBal];
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
                break;
            case 'xlsxExport':
                break;
        }
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
            .reduce((currentVal, accumulator) => numeral(currentVal).add(accumulator).value(), 0)

        // indirect expenses
        const indirectExpData = obj.indirectExpenses;
        const indirectExpAmount = indirectExpData
            .map(obj => obj.balance)
            .reduce((currentVal, accumulator) => numeral(currentVal).add(accumulator).value(), 0)

        // sales account
        const salesAccData = obj.salesAccounts;
        const salesAccAmount = salesAccData
            .map(obj => obj.balance)
            .reduce((currentVal, accumulator) => numeral(currentVal).add(accumulator).value(), 0)

        let totalIn = numeral(salesAccAmount).add(directIncomeAmount).add(indirectIncomeAmount).value();
        let totalExp = numeral(costOfSalesAmount).add(directExpAmount).add(indirectExpAmount).value();
        return numeral(totalIn).subtract(totalExp).value();
    }

	const buildSection = (key, i, type) => {
        let amount = 0;
        if(type === 'assets'){
            amount = assets[key]
                .map(obj => obj.balance)
                .reduce((currentVal, accumulator) => numeral(currentVal).add(accumulator).value(), 0);
        }else if(type === 'liabilities'){
            amount = liabilities[key]
                .map(obj => obj.balance)
                .reduce((currentVal, accumulator) => numeral(currentVal).add(accumulator).value(), 0);
        }
        
        return <div className="row p-3 mt-2" key={i + key}>
            <div className="d-flex flex-row flex-wrap justify-content-between">
                <h5 className="paytone-one fw-bold" style={{color: '#057415ff'}}>{key}</h5>
                <h2>{numeral(amount).format('₦0,0.00')}</h2>
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
                        {type === 'assets' ? assets[key]?.map((_datum, index) => (
                            <tr className='' key={index}>
                                <td>{_datum.ledgerName}</td>
                                <td>{numeral(_datum.balance).format('₦0,0.00')}</td>
                            </tr>
                        )) : liabilities[key]?.map((_datum, index) => (
                            <tr className='' key={index}>
                                <td>{_datum.ledgerName}</td>
                                <td>{numeral(_datum.balance).format('₦0,0.00')}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </div>
    }

    return (
        <div style={{minHeight: '75vh'}} className='container'>
            <div className="container-md mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
				<OffcanvasMenu menuItems={offCanvasMenuItems} menuItemClick={handleOffCanvasMenuItemClick} variant="danger" />
				<div className="text-center d-flex">
					<h2 className="display-6 p-3 mb-0">
						<span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Balance Sheet</span>
						<img src={SVG.balance_sheet_white} style={{ width: "50px", height: "50px" }} />
					</h2>
				</div>
                <span className='text-center m-1'>
                    {/* https://www.financestrategists.com/accounting/final-accounts/trading-account/ */}
                    It provides a snapshot of a company's finances (what it owns and owes) for a past operating period
                </span>
			</div>

            <div className="row p-3">
                <StartEndDateSearch networkRequest={networkRequest} fnSearch={fnSearch} />
            </div>

            <div className="d-flex flex-row flex-wrap justify-content-between mt-3">
                <h3 className="paytone-one fw-bold" style={{color: '#8a2be2'}}>Assets</h3>
            </div>
            {Object.keys(assets).map((key, idx) => buildSection(key, idx, 'assets'))}

            <div className="d-flex flex-row flex-wrap justify-content-between mt-3">
                <h3 className="paytone-one fw-bold" style={{color: '#8a2be2'}}>Liabilities</h3>
            </div>
            {Object.keys(liabilities).map((key, idx) => buildSection(key, idx, 'liabilities'))}
        </div>
    )
}

export default BalSheet;