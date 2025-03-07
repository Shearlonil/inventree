import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from "date-fns";
import { Table } from 'rsuite';
const { Column, HeaderCell, Cell } = Table;

import { useAuth } from '../../app-context/auth-user-context';
import handleErrMsg from '../../Utils/error-handler';
import itemController from '../../Controllers/item-controller';
import { OribitalLoading, ThreeDotLoading } from '../../Components/react-loading-indicators/Indicator';
import qtyMgrController from '../../Controllers/qty-mgr-controller';
import { QuantityManager } from '../../Entities/QuantityManager';
import numeral from 'numeral';

const StoreItemQtyMgrView = () => {
    const navigate = useNavigate();
    const { id } = useParams();
                
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();
        
    const [networkRequest, setNetworkRequest] = useState(false);
    const [item, setItem] = useState(null);
    const [data, setData] = useState([]);

    const headerTitle = ['ID', 'Unit Qty', 'Pkg Qty', 'Qty/Package',"Unit Stock Price", "Pkg Stock Price", 'Exp. Date', 'Purchase Date'];
    const objProps = ["id", "unitStoreQty", "packStoreQty", "qtyPerPackage", "unitStockPrice", "packStockPrice", "expDate", "creationDate"];

    const columns = Array.from({ length: 7 }).map((_, index) => {
        return {
            HeaderCell: props => {
                return <HeaderCell {...props}>{headerTitle[index]}</HeaderCell>;
            },
            Cell: ({ rowData, depth, ...rest }) => {
                return (
                    <Cell
                        dataKey={objProps[index]}
                        {...rest}
                        rowData={rowData}
                        style={{ backgroundColor: rowData.faultFlag ? "red" : 'transparent', color: rowData.faultFlag ? 'white' : 'black' }}
                    />
                );
            }
        };
    });
                
    useEffect( () => {
        if(user.hasAuth('SECTIONS_WINDOW')){
            initialize();
        }else {
            toast.error("Account doesn't support viewing this page. Please contact your supervisor");
            navigate('/404');
        }
    }, []);

	const initialize = async () => {
        try {
            setNetworkRequest(true);
            let response = await itemController.findById(id);
            if(response && response.data){
                setItem(response.data);
            }
            response = await qtyMgrController.findItemStoreQtyMgr(id);
            if(response && response.data){
                const data = [];
                response.data.forEach(qtyManager => {
                    const qtyMgr = new QuantityManager();
                    qtyMgr.id = qtyManager.id;
                    qtyMgr.qtyPerPackage = qtyManager.qtyPerPkg;
                    qtyMgr.expDate = qtyManager.expDate;
                    qtyMgr.creationDate = format(qtyManager.creationDate, 'dd/MM/yyyy HH:mm:ss');
                    qtyMgr.unitStoreQty = qtyManager.totalUnitQty;
                    qtyMgr.packStockPrice = qtyManager.packStock;
                    qtyMgr.unitStockPrice = qtyManager.unitStock;

                    data.push(qtyMgr.toJSON());
                });
                setData(data);
            }
            setNetworkRequest(false);
		} catch (error) {
            setNetworkRequest(false);
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return initialize();
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
		}
    };

    return (
        <div className="container">
            <div className="container mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}> 
                            {networkRequest ? <ThreeDotLoading color='white' /> : item?.itemName} 
                        </span>
                    </h2>
                </div>
                <span className='text-center m-1'>
                    View Quantity Managers associated with a particular item
                </span>
            </div>
            
            <div className="shadow p-4 border border-light rounded-3 bg-warning-subtle">
                <h4>Item Details:- </h4>
                <div className="row g-4"> {/* Adds gap between sections */}
                    <div className="col-12 col-md-6">
                        <div className="p-3 shadow rounded-4 bg-light d-flex justify-content-between">
                            {/* TODO: Make a link and navigate to invoice page when clicked */}
                            <span className="fw-bold text-md-end h5">Section:</span>
                            <span className='pe-2 text-success h5 fw-bold'>{item?.tract.name}</span>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="p-3 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5">Packaging:</span>
                            <span className='pe-2 text-primary fw-bold'>{item?.packaging.name}</span>
                        </div>
                    </div>
                    <div className="col-12">
                        <span className='h6 text-danger'>Sales Prices:- </span>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="p-3 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5">Unit Sales:</span>
                            <span className='pe-2 text-primary fw-bold'>
                                {item?.salesPrice.unitSalesPrice}
                            </span>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="p-3 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5">Pkg Sales:</span>
                            <span className='pe-2 text-primary fw-bold'>{item?.salesPrice.packSalesPrice}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="justify-content-center d-flex">
                {networkRequest && <OribitalLoading color='red' />}
            </div>

            <div className={`container mt-4 p-3 shadow-sm border border-2 rounded-1 ${networkRequest ? 'disabledDiv' : ''}`}>
                <h4 className='fw-bold text-success'>Store Quantities</h4>
                <Table data={data} isTree rowKey="id" height={400} className='mt-3' bordered cellBordered >
                    {data.length > 0 && columns.map((column, index) => {
                        return (
                            <Column key={index} flexGrow={1}>
                                <column.HeaderCell className='fw-bold' />
                                <column.Cell />
                            </Column>
                        );
                    })}
                </Table>
            </div>
            
        </div>
    )
}

export default StoreItemQtyMgrView;