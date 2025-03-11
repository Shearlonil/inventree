import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from "date-fns";
import { VscEdit, VscSave, VscRemove } from 'react-icons/vsc';
import { Table, Button, IconButton, Input, DatePicker, InputNumber } from 'rsuite';
const { Column, HeaderCell, Cell } = Table;

import { useAuth } from '../../app-context/auth-user-context';
import handleErrMsg from '../../Utils/error-handler';
import itemController from '../../Controllers/item-controller';
import { OribitalLoading, ThreeDotLoading } from '../../Components/react-loading-indicators/Indicator';
import qtyMgrController from '../../Controllers/qty-mgr-controller';
import { QuantityManager } from '../../Entities/QuantityManager';
import numeral from 'numeral';
import ConfirmDialog from '../../Components/DialogBoxes/ConfirmDialog';

const styles = `
.table-cell-editing .rs-table-cell-content {
  padding: 4px;
}
.table-cell-editing .rs-input {
  width: 100%;
}
`;

const SalesItemQtyMgrView = () => {
    const navigate = useNavigate();
    const { id } = useParams();
                
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();
        
    const [networkRequest, setNetworkRequest] = useState(false);
    const [item, setItem] = useState(null);

    //	for confirmation dialog
    const [displayMsg, setDisplayMsg] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
    const [entityToEdit, setEntityToEdit] = useState(null);
    //  tree table data
    const [data, setData] = useState([]);

    const headerTitle = ['ID', 'Outpost', 'Unit Qty', 'Pkg Qty', 'Qty/Package', 'Exp. Date', 'Purchase Date'];
    const objProps = ["id", "outpostName", "unitSalesQty", "packSalesQty", "qtyPerPkg", "expDate", "creationDate"];

    const columns = Array.from({ length: 7 }).map((_, index) => {
        return {
            HeaderCell: props => {
                return <HeaderCell {...props}>{headerTitle[index]}</HeaderCell>;
            },
            Cell: ({ rowData, depth, ...rest }) => {
                if(rowData.outpostName && index === 2){
                    return <EditableCell dataKey={objProps[index]} dataType="number" onChange={handleChange} onEdit={handleEdit} rowData={rowData} {...rest} />
                }
                if(!rowData.outpostName && index === 4){
                    return (
                        <EditableCell 
                            dataKey={objProps[index]} 
                            dataType="number" 
                            onChange={handleChange} 
                            onEdit={handleEdit} 
                            rowData={rowData} 
                            {...rest} 
                            style={{ backgroundColor: rowData.faultFlag ? "red" : 'transparent', color: rowData.faultFlag ? 'white' : 'black' }}
                        />
                    )
                }
                if(!rowData.outpostName && index === 5){
                    return (
                        <EditableCell 
                            dataKey={objProps[index]} 
                            dataType="date" 
                            onChange={handleChange} 
                            onEdit={handleEdit} 
                            rowData={rowData} 
                            {...rest} 
                            style={{ backgroundColor: rowData.faultFlag ? "red" : 'transparent', color: rowData.faultFlag ? 'white' : 'black' }}
                        />
                    )
                }
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
        const arr = id.split("->");
        if(arr.length > 1){
            //  member child clicked. Unit Qty edit
            const parent = nextData.find(item => item.id.trim() === arr[0].trim() );
            const memberChild = parent.children.find(item => item.id === id);
        
            memberChild[key] = value;
        }else {
            nextData.find(item => item.id === id)[key] = value;
        }
        setData(nextData);
    };

    const handleEdit = id => {
        const nextData = Object.assign([], data);
        const arr = id.split("->");
        if(arr.length > 1){
            //  member child clicked. Unit Qty edit
            const parent = nextData.find(item => item.id.trim() === arr[0].trim() );
            const memberChild = parent.children.find(item => item.id === id);
        
            memberChild.status = memberChild.status ? null : 'EDIT';
        }else {
            const activeItem = nextData.find(item => item.id == id );
        
            activeItem.status = activeItem.status ? null : 'EDIT';
        }
        
        setData(nextData);
    };
  
    const handleRemove = async id => {
        const arr = id.split("->");
        if(arr.length > 1){
            //  saving member child, outpost sales qty
            const parent = data.find(item => item.id.trim() === arr[0].trim() );
            const memberChild = parent.children.find(item => item.id === id);
            const dtoOutpostSalesQty = {
                id: arr[1],
                outpostId: 0,
                qtyMgrId: arr[0],
                outpostName: memberChild.outpostName,
                unitSalesQty: memberChild.unitSalesQty
            }
            setEntityToEdit(dtoOutpostSalesQty);
            setDisplayMsg(`Delete outpost sales quantity with id ${arr[1]} and move it's quantity back to store?`);
            setConfirmDialogEvtName('deleteOutpostSalesQty');
            setShowConfirmModal(true);
        }
    };
  
    const handleSave = id => {
        const arr = id.split("->");
        if(arr.length > 1){
            //  saving member child, outpost sales qty
            const parent = data.find(item => item.id.trim() === arr[0].trim() );
            const memberChild = parent.children.find(item => item.id === id);
            const dtoOutpostSalesQty = {
                id: arr[1],
                outpostId: 0,
                qtyMgrId: arr[0],
                outpostName: memberChild.outpostName,
                unitSalesQty: memberChild.unitSalesQty
            }
            setEntityToEdit(dtoOutpostSalesQty);
            setDisplayMsg(`Update outpost sales quantity with id ${arr[1]} ?`);
            setConfirmDialogEvtName('outpostSalesQty');
            setShowConfirmModal(true);
        }else {
            const activeItem = data.find(item => item.id === id );
            //  saving qty mgr
            setEntityToEdit(activeItem);
            setDisplayMsg(`Update item with id ${id} ?`);
            setConfirmDialogEvtName('qtyMgr');
            setShowConfirmModal(true);
        }
    };
	
	const handleConfirmOK = async () => {
        setShowConfirmModal(false);
        switch (confirmDialogEvtName) {
            case 'outpostSalesQty':
                updateOutpostSalesQty();
                break;
            case 'qtyMgr':
                updateQtyMgr();
                break;
            case 'deleteOutpostSalesQty':
                deleteOutpostSalesQty();
                break;
        }
	};

	const deleteOutpostSalesQty = async () => {
        try {
            setNetworkRequest(true);
            await qtyMgrController.deleteOutpostSalesQty(entityToEdit.id, entityToEdit.qtyMgrId);
            const temp = Object.assign([], data);
            const parent = temp.find(item => item.id.trim() === entityToEdit.qtyMgrId.trim() );
            const arr = parent.children.filter(child => {
                const arr = child.id.split("->");
                return arr[1].trim() !== entityToEdit.id.trim();
            });
            parent.children = arr;

            setData(temp);

            toast.info('Delete successful');
            resetPage();
            setNetworkRequest(false);
		} catch (error) {
            setNetworkRequest(false);
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return deleteOutpostSalesQty();
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

	const updateOutpostSalesQty = async () => {
        try {
            setNetworkRequest(true);
            await qtyMgrController.updateOutpostSalesQty(entityToEdit);
            const temp = Object.assign([], data);
            const parent = temp.find(item => item.id.trim() === entityToEdit.qtyMgrId.trim() );
            const child = parent.children.find(item => {
                const arr = item.id.split("->");
                return arr[1].trim() === entityToEdit.id.trim();
            });

            child.packSalesQty = numeral(child.unitSalesQty).divide(child.qtyPerPkg).format('₦0,0.00')
            setData(temp);

            toast.info('Update successful');
            resetPage();
            setNetworkRequest(false);
		} catch (error) {
            setNetworkRequest(false);
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return updateOutpostSalesQty();
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
            //  set total unit sales qty
            temp.totalUnitSalesQty = entityToEdit.unitSalesQty;
            temp.packStockPrice = numeral(entityToEdit.packStockPrice).value();
            temp.unitStockPrice = numeral(entityToEdit.unitStockPrice).value();
            //  not needed but added for Spring validation
            temp.unitStoreQty = 0;
            await qtyMgrController.updateQtyMgr(temp);
            //  in case of qty/pkg, update all children
            const nextData = Object.assign([], data);
            const parent = nextData.find(item => item.id === entityToEdit.id );
            parent.children.forEach(child => {
                child.qtyPerPkg = entityToEdit.qtyPerPkg;
                child.packSalesQty = numeral(child.unitSalesQty).divide(child.qtyPerPkg).format('₦0,0.00');
            });
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

	const initialize = async () => {
        try {
            setNetworkRequest(true);
            let response = await itemController.findById(id);
            if(response && response.data){
                setItem(response.data);
            }
            response = await qtyMgrController.findItemSalesQtyMgr(id);
            if(response && response.data){
                const data = [];
                for (const key in response.data) {
                    const qtyMgr = new QuantityManager();
                    qtyMgr.id = key;
                    qtyMgr.qtyPerPkg = response.data[key][0].qtyPerPkg;
                    /*  setting a new Date instance here because of the DatePicker in rsuite used in table  */
                    qtyMgr.expDate = response.data[key][0].expDate ? new Date(response.data[key][0].expDate) : null;
                    qtyMgr.creationDate = format(response.data[key][0].creationDate, 'dd/MM/yyyy HH:mm:ss');
                    qtyMgr.unitSalesQty = response.data[key][0].totalUnitQty;
                    //  using stock prices in qtyMgr to represent sales prices :)
                    qtyMgr.packStockPrice = response.data[key][0].packStock;
                    qtyMgr.unitStockPrice = response.data[key][0].unitStock;

                    //  to serve as children prop of qtyMgr to display in rsuite tree table
                    const arr = [];
                    let total = 0;
                    response.data[key].forEach(child => {
                        const mgr = new QuantityManager();
                        mgr.id = key + ' -> ' + child.outpostSalesId;
                        mgr.qtyPerPkg = child.qtyPerPkg;
                        mgr.outpostName = child.outpostName;
                        mgr.unitSalesQty = child.outpostSalesQty;
                        total = numeral(total).add(child.outpostSalesQty).value();
                        arr.push(mgr.toJSON());
                    });
                    qtyMgr.children = arr;
                    if(numeral(total).difference(qtyMgr.unitSalesQty)){
                        qtyMgr.faultFlag = true;
                    }
                    data.push(qtyMgr.toJSON());
                }
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
                    View Quantity Managers associated with a particular item. <br />
                    NOTE: Deleting Outpost quantity moves the quantity back to store.
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
                <h4 className='fw-bold text-success'>Sales Quantities</h4>
                <Table data={data} isTree rowKey="id" height={400} className='mt-3' bordered cellBordered >
                    {data.length > 0 && columns.map((column, index) => {
                        return (
                            <Column key={index} flexGrow={1}>
                                <column.HeaderCell className='fw-bold' />
                                <column.Cell />
                            </Column>
                        );
                    })}
                    <Column flexGrow={1} >
                        <HeaderCell>...</HeaderCell>
                        <ActionCell dataKey="id" onEdit={handleEdit} onRemove={handleRemove} onSave={handleSave} />
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
            <IconButton appearance="subtle" icon={<VscRemove />} onClick={() => { onRemove(rowData.id); }}  />
            <IconButton icon={<VscSave color='green' />} onClick={() => { onSave(rowData.id); }}  />
        </Cell>
  );
};

export default SalesItemQtyMgrView;