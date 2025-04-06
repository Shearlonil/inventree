import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from "date-fns";
import numeral from 'numeral';
import { VscEdit, VscSave } from 'react-icons/vsc';
import { Table, IconButton, Input, DatePicker, InputNumber } from 'rsuite';
const { Column, HeaderCell, Cell } = Table;

import { useAuth } from '../../app-context/auth-user-context';
import handleErrMsg from '../../Utils/error-handler';
import itemController from '../../Controllers/item-controller';
import { OribitalLoading, ThreeDotLoading } from '../../Components/react-loading-indicators/Indicator';
import qtyMgrController from '../../Controllers/qty-mgr-controller';
import { QuantityManager } from '../../Entities/QuantityManager';
import ConfirmDialog from '../../Components/DialogBoxes/ConfirmDialog';

const styles = `
.table-cell-editing .rs-table-cell-content {
  padding: 4px;
}
.table-cell-editing .rs-input {
  width: 100%;
}
`;

const StoreItemQtyMgrView = () => {
    const navigate = useNavigate();
    const { id } = useParams();
                
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();
        
    const [networkRequest, setNetworkRequest] = useState(false);
    const [item, setItem] = useState(null);
    const [data, setData] = useState([]);
    
    //	for confirmation dialog
    const [displayMsg, setDisplayMsg] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
    const [entityToEdit, setEntityToEdit] = useState(null);
                
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
                    qtyMgr.qtyPerPkg = qtyManager.qtyPerPkg;
                    qtyMgr.expDate = qtyManager.expDate ? new Date(qtyManager.expDate) : null;
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

	const updateQtyMgr = async () => {
        try {
            setNetworkRequest(true);
            const temp = Object.assign({}, entityToEdit);
            //  remove the creation date to avoid cast error from string to LocalDateTime on the backend... i no get time for wahala abeg :)
            temp.creationDate = null;
            //  set unit unitStoreQty qty
            temp.unitStoreQty = entityToEdit.unitStoreQty;
            temp.unitStockPrice = entityToEdit.unitStockPrice;
            temp.packStockPrice = numeral(entityToEdit.packStockPrice).value();
            //  not needed but added for Spring validation
            temp.totalUnitSalesQty = 0;
            await qtyMgrController.updateStoreQtyMgr(temp);
            //  in case of qty/pkg, pkg stock price
            const nextData = Object.assign([], data);
            const qtyMgr = nextData.find(item => item.id === entityToEdit.id );
            qtyMgr.packStoreQty = numeral(qtyMgr.unitStoreQty).divide(qtyMgr.qtyPerPkg).format('₦0,0.00');
            qtyMgr.packStockPrice = numeral(qtyMgr.unitStockPrice).multiply(qtyMgr.qtyPerPkg).format('₦0,0.00');
            setData(nextData);

            toast.info('Update successful');
            resetPage();
            setNetworkRequest(false);
		} catch (error) {
            setNetworkRequest(false);
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return updateQtyMgr();
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

    const resetPage = () => {
		setEntityToEdit(null);
        setConfirmDialogEvtName(null);
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setDisplayMsg("");
        setShowConfirmModal(false);
    };

    const handleChange = (id, key, value) => {
        const nextData = Object.assign([], data);
        nextData.find(item => item.id === id)[key] = value;
        setData(nextData);
    };

    const handleEdit = id => {
        const nextData = Object.assign([], data);
        const activeItem = nextData.find(item => item.id == id );
    
        activeItem.status = activeItem.status ? null : 'EDIT';
        
        setData(nextData);
    };
  
    const handleSave = id => {
        const activeItem = data.find(item => item.id === id );
        //  saving qty mgr
        setEntityToEdit(activeItem);
        setDisplayMsg(`Update item with id ${id} ?`);
        setConfirmDialogEvtName('qtyMgr');
        setShowConfirmModal(true);
    };
	
	const handleConfirmOK = async () => {
        setShowConfirmModal(false);
        switch (confirmDialogEvtName) {
            case 'qtyMgr':
                updateQtyMgr();
                break;
        }
	};

    return (
        <div className="container">
            <style>{styles}</style>
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
                    <Column flexGrow={1}>
                        <HeaderCell>ID</HeaderCell>
                        <Cell dataKey="id" />
                    </Column>

                    <Column flexGrow={1}>
                        <HeaderCell>Unit Qty</HeaderCell>
                        <EditableCell
                            dataKey="unitStoreQty"
                            dataType="number"
                            onChange={handleChange}
                            onEdit={handleEdit}
                        />
                        {/* <Cell dataKey="unitStoreQty" /> */}
                    </Column>

                    <Column flexGrow={1}>
                        <HeaderCell>Pkg Qty</HeaderCell>
                        <Cell dataKey="packStoreQty" />
                    </Column>

                    <Column flexGrow={1}>
                        <HeaderCell>Qty/Pkg</HeaderCell>
                        <EditableCell
                            dataKey="qtyPerPkg"
                            dataType="number"
                            onChange={handleChange}
                            onEdit={handleEdit}
                        />
                    </Column>

                    <Column flexGrow={1}>
                        <HeaderCell>Unit Stock Price</HeaderCell>
                        <EditableCell
                            dataKey="unitStockPrice"
                            dataType="number"
                            onChange={handleChange}
                            onEdit={handleEdit}
                        />
                    </Column>

                    <Column flexGrow={1}>
                        <HeaderCell>Pkg Stock Price</HeaderCell>
                        <Cell dataKey="packStockPrice" />
                    </Column>

                    <Column flexGrow={1}>
                        <HeaderCell>Exp. Date</HeaderCell>
                        <EditableCell
                            dataKey="expDate"
                            dataType="date"
                            onChange={handleChange}
                            onEdit={handleEdit}
                        />
                    </Column>

                    <Column flexGrow={1} >
                        <HeaderCell>...</HeaderCell>
                        <ActionCell dataKey="id" onEdit={handleEdit} onSave={handleSave} />
                    </Column>
                </Table>
            </div>
            <ConfirmDialog
                show={showConfirmModal}
                handleClose={handleCloseModal}
                handleConfirm={handleConfirmOK}
                message={displayMsg}
            />
        </div>
    )
}

function toValueString(value, dataType) {
    return (dataType === 'date') ? value?.toLocaleDateString() : value;
}

const fieldMap = {
    string: Input,
    number: InputNumber,
    date: DatePicker
};

const EditableCell = ({ rowData, dataType, dataKey, onChange, onEdit, ...props }) => {
    const editing = rowData.status === 'EDIT';

    const Field = fieldMap[dataType];
    const value = rowData[dataKey];
    const text = toValueString(value, dataType);

    return (
        <Cell {...props} className={editing ? 'table-cell-editing' : ''} onDoubleClick={() => { onEdit?.(rowData.id); }}  >
            {editing ? ( <Field defaultValue={dataType === 'date' ? new Date(value) : value} onChange={value => { onChange?.(rowData.id, dataKey, value);  }} /> ) : ( text )}
        </Cell>
  );
};

const ActionCell = ({ rowData, dataKey, onEdit, onRemove, onSave, ...props }) => {
    return (
        <Cell {...props} style={{ padding: '6px', display: 'flex', gap: '4px' }}>
            <IconButton appearance="subtle" icon={rowData.status === 'EDIT' ? <VscSave /> : <VscEdit />} onClick={() => { onEdit(rowData.id); }}/>
            <IconButton icon={<VscSave color='green' />} onClick={() => { onSave(rowData.id); }}  />
        </Cell>
  );
};


export default StoreItemQtyMgrView;