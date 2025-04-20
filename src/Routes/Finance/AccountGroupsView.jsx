import React, { useEffect, useState } from 'react'
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import Select from "react-select";
import { format } from 'date-fns';
import { Button, Col, Form, Row, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';

import SVG from '../../assets/Svg';
import { OribitalLoading, ThreeDotLoading } from '../../Components/react-loading-indicators/Indicator';
import PaginationLite from '../../Components/PaginationLite';
import ConfirmDialog from '../../Components/DialogBoxes/ConfirmDialog';
import ErrorMessage from '../../Components/ErrorMessage';
import { useAuth } from '../../app-context/auth-user-context';
import handleErrMsg from '../../Utils/error-handler';
import genericController from '../../Controllers/generic-controller';
import financeController from '../../Controllers/finance-controller';

const AccountGroupsView = () => {
        
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();

    const schema = yup.object().shape({
        name: yup.string().required("Name is required"),
        group: yup.object().nullable(),
        chart: yup.object().nullable(),
    });

    const {
        register,
        handleSubmit,
        control,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            //  Set default selection
            name: "",
            group: null,
            chart: null,
        },
    });
    
    const [networkRequest, setNetworkRequest] = useState(false);

    //	for input dialog
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    //	for confirmation dialog
    const [displayMsg, setDisplayMsg] = useState("");

    const [groupOptions, setGroupOptions] = useState([]);
    const [groupsLoading, setGroupsLoading] = useState(true);

    const [chartOptions, setChartOptions] = useState([]);
    const [chartsLoading, setChartsLoading] = useState(true);

    const [groups, setGroups] = useState([]);
    const [newGroup, setNewGroup] = useState(null);
        
    //	for pagination
    const [pageSize] = useState(20);
    const [totalItemsCount, setTotalItemsCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    //  data returned from DataPagination
    const [pagedData, setPagedData] = useState([]);
    
    useEffect( () => {
        if(user.hasAuth('FINANCE')){
            initialize();
        }else {
            toast.error("Account doesn't support viewing this page. Please contact your supervisor");
            navigate('/404');
        }
    }, []);

	const initialize = async () => {
		try {
            setNetworkRequest(true);
            //  find active groups and charts
            const urls = [ '/api/finance/groups', '/api/finance/charts' ];
            const response = await genericController.performGetRequests(urls);
            const { 0: groupsRequest, 1: chartsRequest } = response;

            //	check if the request to fetch groups doesn't fail before setting values to display
            if(groupsRequest){
				setGroupOptions(groupsRequest.data.map(group => ({label: group.name, value: group})));
                groupsRequest.data.sort(
                    (a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0)
                )
                setGroups(groupsRequest.data);
                setGroupsLoading(false);
                setTotalItemsCount(groupsRequest.data.length);
            }

            //	check if the request to fetch charts doesn't fail before setting values to display
            if(chartsRequest){
				setChartOptions(chartsRequest.data.map( chart => ({label: chart.name, value: chart})));
				setChartsLoading(false);
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

    const setPageChanged = async (pageNumber) => {
        setCurrentPage(pageNumber);
        const startIndex = (pageNumber - 1) * pageSize;
        setPagedData(groups.slice(startIndex, startIndex + pageSize));
    };

    const handleCloseModal = () => {
        setDisplayMsg("");
        setShowConfirmModal(false);
    };
    
    const handleConfirmOK = async () => {
        setShowConfirmModal(false);
        switch (confirmDialogEvtName) {
            case 'create':
                await createGroup();
                break;
        }
    }

    //  Handle item selection change
    const handleChartChange = (chart) => {
        setValue('group', null);
    };

    //  Handle item selection change
    const handleGroupChange = (group) => {
        setValue('chart', null);
    };

    const onSubmit = async (data) => {
        setConfirmDialogEvtName('create');
        const dtoAccGroup = {
            name: data.name,
            parentChartId: data.chart?.value.id,
            parentGroupId: data.group?.value.id
        };
        setDisplayMsg(`Create new account group with name ${dtoAccGroup.name} ?`)
        setNewGroup(dtoAccGroup);
        setShowConfirmModal(true);
    }

    const createGroup = async () => {
        try {
            setNetworkRequest(true);
            
            const response = await financeController.createGroup(newGroup);
            const arr = [...groups, response.data];
            arr.sort(
                (a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0)
            )
            setGroups(arr);
            setNetworkRequest(false);
            toast.info("Group created");
        } catch (error) {
            setNetworkRequest(false);
            //	Incase of 500 (Invalid Token received!), perform refresh
            try {
                if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                    await handleRefresh();
                    return createGroup();
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
    }

    return (
        <div style={{minHeight: '70vh'}} className="container">
            <div className="container mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Account Groups</span>
                        <img src={SVG.group} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    Create, View and modify accounting Legers. View ledger transactions by custom dates
                </span>
            </div>
            
            <div className="container row mx-auto my-3 p-4 rounded bg-light shadow">
                <h4 className="mb-4 text-primary">Create Group:-</h4>
                <div className="col-md-3 col-12 mb-3">
                    <p className="h5 mb-2">Group Name</p>
                    <input
                        type="text"
                        className="form-control mb-2 shadow-sm"
                        placeholder="Group Name"
                        {...register("name")}
                    />
                    <ErrorMessage source={errors.name} />
                </div>
                <div className="col-md-3 col-12 mb-3">
                    <p className="h5 mb-2">Parent Group</p>
                    <Controller
                        name="group"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Select
                                required
                                name="group"
                                placeholder="Select Parent Group..."
                                className="text-dark"
                                isLoading={groupsLoading}
                                options={groupOptions}
                                value={value}
                                onChange={(val) => {
                                    onChange(val);
                                    handleGroupChange(val);
                                }}
                            />
                        )}
                    />
                    <ErrorMessage source={errors.group} />
                </div>
                {/*  */}

                <div className="col-md-3 col-12 mb-3">
                    <p className="h5 mb-2">Parent Chart</p>
                    <Controller
                        name="chart"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Select
                                required
                                name="chart"
                                placeholder="Select Parent Chart..."
                                className="text-dark"
                                isLoading={chartsLoading}
                                options={chartOptions}
                                value={value}
                                onChange={(val) => {
                                    onChange(val);
                                    handleChartChange(val);
                                }}
                            />
                        )}
                    />
                    <ErrorMessage source={errors.chart} />
                </div>

                <div className="col-md-3 col-12 mt-4">
                    <Button className="w-100 mt-2" onClick={handleSubmit(onSubmit)} disabled={networkRequest}>
                        { (networkRequest) && <ThreeDotLoading color="#ffffff" size="small" /> }
                        { (!networkRequest) && `Create` }
                    </Button>
                </div>
            </div>

            <div className="justify-content-center d-flex">
                {networkRequest && <OribitalLoading color='red' />}
            </div>

            <div className={`container mt-4 p-3 shadow-sm border border-2 rounded-1 ${networkRequest ? 'disabledDiv' : ''}`}>
                <div className="border bg-light my-3">
                    <Table id="myTable" className="rounded-2" striped hover responsive>
                        <thead>
                            <tr className="shadow-sm">
                                <th className='text-danger'>Name</th>
                                <th className='text-danger'>Date</th>
                                <th className='text-danger'>Creator</th>
                                <th className='text-danger'>Option</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedData.map((group, index) => (
                                <tr className='' key={index}>
                                    <td>{group.name}</td>
                                    <td>{format(group.creationDate, "dd/MM/yyyy")}</td>
                                    <td>{group.creatorName}</td>
                                    <td>
                                        <Link to={`${group.id}/view`}>View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
                <div className="mt-3">
                    <PaginationLite
                        itemCount={totalItemsCount}
                        pageSize={pageSize}
                        setPageChanged={setPageChanged}
                        pageNumber={currentPage}
                    />
                </div>
            </div>
            <ConfirmDialog
                show={showConfirmModal}
                handleClose={handleCloseModal}
                handleConfirm={handleConfirmOK}
                message={displayMsg}
            />
        </div>
    );
}

export default AccountGroupsView;