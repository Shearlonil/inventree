import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { Table } from 'react-bootstrap';

import ConfirmDialog from '../../Components/DialogBoxes/ConfirmDialog';
import InputDialog from '../../Components/DialogBoxes/InputDialog';
import DropDownDialog from '../../Components/DialogBoxes/DropDownDialog';
import { useAuth } from '../../app-context/auth-user-context';
import handleErrMsg from '../../Utils/error-handler';
import { OribitalLoading } from '../../Components/react-loading-indicators/Indicator';
import OffcanvasMenu from '../../Components/OffcanvasMenu';
import SVG from '../../assets/Svg';
import financeController from '../../Controllers/finance-controller';
import genericController from '../../Controllers/generic-controller';

const GroupDisplay = () => {
    const navigate = useNavigate();
    const { id } = useParams();
		
	const { handleRefresh, logout, authUser } = useAuth();
	const user = authUser();

	const offCanvasMenu = [
		{ label: "Rename Group", onClickParams: {evtName: 'renameGroup'} },
		// { label: "Delete Group", onClickParams: {evtName: 'deleteGroup'} },
		{ label: "Move to Group", onClickParams: {evtName: 'moveToGroup'} },
		{ label: "Move to Chart", onClickParams: {evtName: 'moveToChart'} },
	];
      
    const [networkRequest, setNetworkRequest] = useState(false);
        
    const [showInputModal, setShowInputModal] = useState(false);
    const [displayMsg, setDisplayMsg] = useState("");
    const [dropDownMsg, setDropDownMsg] = useState("");
    const [inputStr, setInputStr] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState("");
    const [showDropDownModal, setShowDropDownModal] = useState(false);
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);

    //  for holding input string, parent group or chart
    const [content, setContent] = useState(null);
    
    const [group, setGroup] = useState(null);
    const [children, setChildren] = useState([]);

    //  for groups
    const [groupOptions, setGroupOptions] = useState([]);
    const [groupsLoading, setGroupsLoading] = useState(true);

    const [chartOptions, setChartOptions] = useState([]);
    const [chartsLoading, setChartsLoading] = useState(true);

    const [parentOptions, setParentOptions] = useState([]);

    useEffect( () => {
        if(user.hasAuth('FINANCE')){
            initialize();
        }else {
            toast.error("Account doesn't support viewing this page. Please contact your supervisor");
            navigate('/404');
        }
    }, [id]);
    
    const initialize = async () => {
        try {
            setNetworkRequest(true);
            //  find active groups and charts
            const urls = [ '/api/finance/groups', '/api/finance/charts', `/api/finance/groups/${id}` ];
            const response = await genericController.performGetRequests(urls);
            const { 0: groupsRequest, 1: chartsRequest, 2: groupRequest } = response;

            //	check if the request to fetch groups doesn't fail before setting values to display
            if(groupsRequest && groupsRequest.data){
                //  filter out the request group to avoid moving this group under itself.... Users are funny :)
                const groups = groupsRequest.data
                    //  not using strict equality operator here because id from useParams is string and group.id is number
                    .filter(group => group.id != id)
                    .sort( (a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0))
                setGroupOptions(groups.map(group => ({label: group.name, value: group})));
                setGroupsLoading(false);
            }

            //	check if the request to fetch charts doesn't fail before setting values to display
            if(chartsRequest && chartsRequest.data){
                setChartOptions(chartsRequest.data.map( chart => ({label: chart.name, value: chart})));
                setChartsLoading(false);
            }

            if (groupRequest && groupRequest.data) {
                setGroup(groupRequest.data);
                setChildren([...groupRequest.data.dtoGroups, ...groupRequest.data.dtoLedgers]);
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

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'deleteGroup':
                break;
            case 'renameGroup':
                setDisplayMsg("Enter unique group name");
                setConfirmDialogEvtName(onclickParams.evtName);
                setShowInputModal(true);
                break;
            case 'moveToGroup':
                setDropDownMsg(`Select new parent group`);
                setParentOptions(groupOptions);
                setConfirmDialogEvtName(onclickParams.evtName);
                setShowDropDownModal(true);
                break;
            case 'moveToChart':
                setDropDownMsg(`Select new parent chart`);
                setParentOptions(chartOptions);
                setConfirmDialogEvtName(onclickParams.evtName);
                setShowDropDownModal(true);
                break;
        }
	}

    const handleCloseModal = () => {
        setShowDropDownModal(false);
        setShowInputModal(false);
    };

    const handleCloseConfirmModal = () => {
        setShowConfirmModal(false);
    };

	const handleGroupSelected = async (parent) => {
        switch (confirmDialogEvtName) {
            case 'moveToChart':
                setDisplayMsg(`move group from ${group.parentName} to parent chart ${parent.name}?`);
                setContent(parent);
                setShowConfirmModal(true);
                break;
            case 'moveToGroup':
                setDisplayMsg(`move group from ${group.parentName} to parent group ${parent.name}?`);
                setContent(parent);
                setShowConfirmModal(true);
                break;
        }
    };
    
    const handleInputOK = async (str) => {
        switch (confirmDialogEvtName) {
            case 'renameGroup':
                setInputStr(str);
                setDisplayMsg(`set new group name from ${group.name} to ${str}?`);
                setContent(str);
                setShowConfirmModal(true);
                break;
        }
    };
	
	const handleConfirmOK = async () => {
		setShowConfirmModal(false);
		switch (confirmDialogEvtName) {
            case 'renameGroup':
				if(group.isDefault){
                    toast.error('Operation not allowed on default groups');
                    return;
                }
                renameGroup();
                break;
            case 'moveToGroup':
				if(group.isDefault){
                    toast.error('Operation not allowed on default groups');
                    return;
                }
                moveToGroup();
                break;
            case 'moveToChart':
				if(group.isDefault){
                    toast.error('Operation not allowed on default groups');
                    return;
                }
                moveToChart();
                break;
        }
	}

    const renameGroup = async () => {
        try {
            setNetworkRequest(true);
            const temp = {...group};
            temp.name = content;
            await financeController.renameGroup(temp);
            setGroup(temp);
            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
            //	Incase of 500 (Invalid Token received!), perform refresh
            try {
                if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                    await handleRefresh();
                    return renameGroup();
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

    const moveToGroup = async () => {
        try {
            setNetworkRequest(true);
            const temp = {...group};
            temp.parentName = content.name;
            temp.parentGroupId = content.id;
            temp.parentChartId = null;
            console.log(content);
            await financeController.moveAccGroupToGroup(temp);
            setGroup(temp);
            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
            //	Incase of 500 (Invalid Token received!), perform refresh
            try {
                if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                    await handleRefresh();
                    return moveToGroup();
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

    const moveToChart = async () => {
        try {
            setNetworkRequest(true);
            const temp = {...group};
            temp.parentName = content.name;
            temp.parentChartId = content.id;
            temp.parentGroupId = null;
            console.log(content);
            await financeController.moveAccGroupToChart(temp);
            setGroup(temp);
            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
            //	Incase of 500 (Invalid Token received!), perform refresh
            try {
                if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                    await handleRefresh();
                    return moveToChart();
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
        <div className='container my-4'>
            <div className="container-md mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 text-white align-items-center" >
				<div>
					<OffcanvasMenu menuItems={offCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant="danger" />
				</div>
				<div className="text-center d-flex">
					<h2 className="display-6 p-3 mb-0">
						<span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Account Group</span>
						<img src={SVG.group} style={{ width: "50px", height: "50px" }} />
					</h2>
				</div>
                <span className='text-center m-1'>
                    View group properties, ledgers and groups associated with a selected Account Group.
                    Please Note, this page requires FINANCE PERMISSION
                </span>
			</div>
            <div className="shadow p-4 border border-light rounded-3 bg-warning-subtle my-4">
                <div className="row g-4"> {/* Adds gap between sections */}
                    <div className="col-12 col-md-6">
                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5 me-2">Name:</span>
                            <span style={{overflow: 'scroll' }} className='pe-2 fw-bold text-primary'>{group?.name}</span>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5 me-2">Creator:</span>
                            <span style={{overflow: 'scroll', textAlign: "right" }} className='pe-2 text-primary fw-bold'>{group?.creatorName}</span>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5 me-2">Date:</span>
                            <span className='pe-2 text-primary fw-bold'>
                                { group && format(group?.creationDate, "dd/MM/yyyy")}
                            </span>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5 me-2">Parent:</span>
                            <span style={{overflow: 'scroll' }} className='pe-2 fw-bold text-primary'>
                                <Link to={`${group?.parentChartId ? `/finance/charts/${group?.parentChartId}/view` : `/finance/groups/${group?.parentGroupId}/view`}`}>
                                    {group?.parentName}
                                </Link>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="justify-content-center d-flex">
                {networkRequest && <OribitalLoading color='red' />}
            </div>
            
            <div className="p-3 rounded-3 p-3 overflow-md-auto bg-secondary-subtle my-4" style={{ minHeight: "700px" }}>
                <div className="border border rounded-3 p-1 bg-light my-3 shadow" style={{ maxHeight: "750px", minHeight: "750px", overflow: 'scroll' }}>
                    <Table id="myTable" className="rounded-2" striped hover responsive>
                        <thead>
                            <tr className="shadow-sm">
                                <th className='text-danger'>Description</th>
                                <th className='text-danger'>Date</th>
                                <th className='text-danger'>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {children.map((_datum, index) => (
                                <tr className='' key={index}>
                                    <td>
                                        <Link to={`/finance/${_datum.rep}s/${_datum.id}/view`}>
                                            {_datum.name}
                                        </Link>
                                    </td>
                                    <td>{format(_datum.creationDate, "dd/MM/yyyy")}</td>
                                    <td>{_datum.rep}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
            <DropDownDialog
                show={showDropDownModal}
                handleClose={handleCloseModal}
                handleConfirm={handleGroupSelected}
                message={dropDownMsg}
                optionsLoading={networkRequest}
                options={parentOptions}
            />
            <InputDialog
                show={showInputModal}
                handleClose={handleCloseModal}
                handleConfirm={handleInputOK}
                message={displayMsg}
            />
			<ConfirmDialog
				show={showConfirmModal}
				handleClose={handleCloseConfirmModal}
				handleConfirm={handleConfirmOK}
				message={displayMsg}
			/>
        </div>
    )
}

export default GroupDisplay;