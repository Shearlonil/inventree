import { format } from 'date-fns';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import financeController from '../../Controllers/finance-controller';
import handleErrMsg from '../../Utils/error-handler';
import OffcanvasMenu from '../../Components/OffcanvasMenu';
import SVG from '../../assets/Svg';
import StartEndDateSearch from '../../Components/StartEndDateSearch';
import { useAuth } from '../../app-context/auth-user-context';

const ProfitLossAcc = () => {
    const navigate = useNavigate();
        
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();
            
    const [networkRequest, setNetworkRequest] = useState(false);

    const [salesAccAmount, setSalesAccAmount] = useState(0);
    const [directIncomeAmount, setDirectIncomeAmount] = useState(0);
    const [costOfSalesAmount, setCostOfSalesAmount] = useState(0);
    const [directExpAmount, setDirectExpAmount] = useState(0);
    const [indirectIncomeAmount, setIndirectIncomeAmount] = useState(0);
    const [indirectExpAmount, setIndirectExpAmount] = useState(0);
    const [nettProfit, setNettProfit] = useState(0);

	const offCanvasMenuItems = [
		{ label: "Export to PDF", onClickParams: {evtName: 'pdfExport'} },
		{ label: "Export to Excel", onClickParams: {evtName: 'xlsxExport'} },
	];


    const fnSearch = async () => {
        try {
            if (data.startDate && data.endDate) {
                const startDate = format(data.startDate, "yyyy-MM-dd") + "T01:00:00.000Z";
                const endDate = format(data.endDate, "yyyy-MM-dd") + "T23:59:59.000Z";

                setNetworkRequest(true);

                const response = await financeController.getIncomeExpVoucherDetails('Revenue', startDate, endDate);
                if(response && response.data){
                    const arr = [];

                    let totalCash = numeral(0);
                    response.data.forEach(datum => {
                    });
                }
                setNetworkRequest(false);
            }
        } catch (error) {
            setNetworkRequest(false);
            //	Incase of 500 (Invalid Token received!), perform refresh
            try {
                if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                    await handleRefresh();
                    return fnSearch();
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

    return (
        <div style={{minHeight: '75vh'}} className='container'>
            <div className="container-md mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
				<OffcanvasMenu menuItems={offCanvasMenuItems} menuItemClick={handleOffCanvasMenuItemClick} variant="danger" />
				<div className="text-center d-flex">
					<h2 className="display-6 p-3 mb-0">
						<span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Profit & Loss Account</span>
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

            <div className="d-flex flex-row flex-wrap justify-content-between mt-3">
                <h3 className="paytone-one fw-bold" style={{color: '#8a2be2'}}>Trading Account</h3>
            </div>
            <div className="row p-3 mt-2">
                <div className="d-flex flex-row flex-wrap justify-content-between">
                    <h5 className="paytone-one fw-bold" style={{color: '#057415ff'}}>Sales Account</h5>
                    <h2>{salesAccAmount}</h2>
                </div>
                <div style={{ maxHeight: "350px", overflow: 'scroll' }}>
                    {/* <TableMain tableProps={tableProps} tableData={ledgerTransactions} /> */}
                </div>
            </div>

            <div className="row p-3 mt-2">
                <div className="d-flex flex-row flex-wrap justify-content-between">
                    <h5 className="paytone-one fw-bold" style={{color: '#057415ff'}}>Direct Incomes</h5>
                    <h2>{directIncomeAmount}</h2>
                </div>
                <div style={{ maxHeight: "350px", overflow: 'scroll' }}>
                    {/* <TableMain tableProps={tableProps} tableData={ledgerTransactions} /> */}
                </div>
            </div>

            <div className="row p-3 mt-2">
                <div className="d-flex flex-row flex-wrap justify-content-between">
                    <h5 className="paytone-one fw-bold" style={{color: '#057415ff'}}>Cost Of Sales</h5>
                    <h2>{costOfSalesAmount}</h2>
                </div>
                <div style={{ maxHeight: "350px", overflow: 'scroll' }}>
                    {/* <TableMain tableProps={tableProps} tableData={ledgerTransactions} /> */}
                </div>
            </div>

            <div className="row p-3 mt-2">
                <div className="d-flex flex-row flex-wrap justify-content-between">
                    <h5 className="paytone-one fw-bold" style={{color: '#057415ff'}}>Direct Expenses</h5>
                    <h2>{directExpAmount}</h2>
                </div>
                <div style={{ maxHeight: "350px", overflow: 'scroll' }}>
                    {/* <TableMain tableProps={tableProps} tableData={ledgerTransactions} /> */}
                </div>
            </div>

            <hr />
            <div className="d-flex flex-row flex-wrap justify-content-between mt-3">
                <h3 className="paytone-one fw-bold" style={{color: '#8a2be2'}}>Income Statement</h3>
            </div>
            <div className="row p-3 mt-2">
                <div className="d-flex flex-row flex-wrap justify-content-between">
                    <h5 className="paytone-one fw-bold" style={{color: '#057415ff'}}>Indirect Incomes</h5>
                    <h2>{indirectIncomeAmount}</h2>
                </div>
                <div style={{ maxHeight: "350px", overflow: 'scroll' }}>
                    {/* <TableMain tableProps={tableProps} tableData={ledgerTransactions} /> */}
                </div>
            </div>

            <div className="row p-3 mt-2">
                <div className="d-flex flex-row flex-wrap justify-content-between">
                    <h5 className="paytone-one fw-bold" style={{color: '#057415ff'}}>Indirect Expenses</h5>
                    <h2>{indirectExpAmount}</h2>
                </div>
                <div style={{ maxHeight: "350px", overflow: 'scroll' }}>
                    {/* <TableMain tableProps={tableProps} tableData={ledgerTransactions} /> */}
                </div>
            </div>

            <hr />
            <div className="d-flex flex-row flex-wrap justify-content-between">
                <h3 className="paytone-one fw-bold" style={{color: '#8a2be2'}}>Nett Profit</h3>
                <h2>{nettProfit}</h2>
            </div>
        </div>
    )
}

export default ProfitLossAcc;