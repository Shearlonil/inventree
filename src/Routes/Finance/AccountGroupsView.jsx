import React, { useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import { schema } from '../../Utils/yup-schema-validator/contact-schema';
import OffcanvasMenu from '../../Components/OffcanvasMenu';
import SVG from '../../assets/Svg';
import { OribitalLoading, ThreeDotLoading } from '../../Components/react-loading-indicators/Indicator';
import PaginationLite from '../../Components/PaginationLite';
import ConfirmDialog from '../../Components/DialogBoxes/ConfirmDialog';
import InputDialog from '../../Components/DialogBoxes/InputDialog';
import { Button, Col, Form, Row } from 'react-bootstrap';
import ErrorMessage from '../../Components/ErrorMessage';

const AccountGroupsView = () => {

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            //  Set default selection
            name: "",
            address: "",
            email: "",
            phone_no: "", 
        },
    });
    
    const [networkRequest, setNetworkRequest] = useState(false);

    //	for input dialog
    const [showInputModal, setShowInputModal] = useState(false);
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [entityToEdit, setEntityToEdit] = useState(null);
    //	for confirmation dialog
    const [displayMsg, setDisplayMsg] = useState("");
        
    //	for pagination
    const [pageSize] = useState(20);
    const [totalItemsCount, setTotalItemsCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const ledgersOffCanvasMenu = [
        { label: "Create", onClickParams: {evtName: 'create'} },
        { label: "Search By Name", onClickParams: {evtName: 'searchByName'} },
        { label: "Sort By Name", onClickParams: {evtName: 'sortByName'} },
        { label: "Show All", onClickParams: {evtName: 'showAll'} },
        { label: "Trash", onClickParams: {evtName: 'trash'} },
    ];

    const handleOffCanvasMenuItemClick = async (onclickParams, e) => {}

    const setPageChanged = async (pageNumber) => {
        setCurrentPage(pageNumber);
        const startIndex = (pageNumber - 1) * pageSize;
        // setPagedData(filteredLedgers.slice(startIndex, startIndex + pageSize));
    };

    const handleCloseModal = () => {
        setDisplayMsg("");
        setShowConfirmModal(false);
        setShowInputModal(false);
    };
    
    const handleInputOK = async (str) => {
        let arr = [];
        switch (confirmDialogEvtName) {
            case 'searchByName':
                break;
            case 'create':
                break;
            case 'rename':
                break;
        }
    }
    
    const handleConfirmOK = async () => {
        setShowConfirmModal(false);
        switch (confirmDialogEvtName) {
            case 'delete':
                break;
        }
    }

    const onSubmit = async (data) => {}

    return (
        <div style={{minHeight: '70vh'}} className="container">
            <div className="container mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                <div>
                    <OffcanvasMenu menuItems={ledgersOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant='danger' />
                </div>
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Account Groups</span>
                        <img src={SVG.ledger} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    Create, View and modify accounting Legers. View ledger transactions by custom dates
                </span>
            </div>
            
            <div className="container row mx-auto my-3 rounded bg-light shadow border py-4 px-2 bg-white-subtle" style={{ boxShadow: "black 3px 2px 5px" }} >
                <h4 className="mb-4 text-primary">Create Group:-</h4>
                <Row className="align-items-center">
                    <Col sm lg="3" className="mt-3 mt-md-0">
                        <Form.Label className="fw-bold">Start Date</Form.Label>
                        <input
                            type="text"
                            className="form-control mb-2 shadow-sm"
                            placeholder="Customer Name"
                            {...register("name")}
                        />
                        <ErrorMessage source={errors.startDate} />
                    </Col>
                    <Col sm lg="3" className="mt-3 mt-md-0">
                        <Form.Label className="fw-bold">End Date</Form.Label>
                        <input
                            type="text"
                            className="form-control mb-2 shadow-sm"
                            placeholder="Customer Name"
                            {...register("name")}
                        />
                        <ErrorMessage source={errors.endDate} />
                    </Col>
                    <Col sm lg="3" className="mt-3 mt-md-0">
                        <Form.Label className="fw-bold">End Date</Form.Label>
                        <input
                            type="text"
                            className="form-control mb-2 shadow-sm"
                            placeholder="Customer Name"
                            {...register("name")}
                        />
                        <ErrorMessage source={errors.endDate} />
                    </Col>
                    <Col sm lg="3" className="align-self-center text-center mt-4">
                        <Button className="w-100" onClick={handleSubmit(onsubmit)} disabled={networkRequest}>
                            { (networkRequest) && <ThreeDotLoading color="#ffffff" size="small" /> }
                            { (!networkRequest) && `Search` }
                        </Button>
                    </Col>
                </Row>
            </div>

            <div className="container row mx-auto my-3 p-3 rounded bg-light shadow border">
                <h4 className="mb-4 text-primary">Create Group:-</h4>

                <div className="col-md-3 col-12 mb-3">
                    <p className="h5">Group Name:</p>
                    <input
                        type="text"
                        className="form-control mb-2 shadow-sm"
                        placeholder="Customer Name"
                        {...register("name")}
                    />
                    <small className="text-danger">{errors.name?.message}</small>
                </div>

                <div className="col-md-3 col-12 mb-3">
                    <p className="h5">Parent Group:</p>
                    <input
                        type="tel"
                        className="form-control mb-2 shadow-sm"
                        placeholder="Phone Number"
                        {...register("phone_no")}
                    />
                    <small className="text-danger">{errors.phone_no?.message}</small>
                </div>

                <div className="col-md-3 col-12 mb-3">
                    <p className="h5">Parent Chart:</p>
                    <input
                        type="text"
                        className="form-control mb-2 shadow-sm"
                        placeholder="Address here"
                        {...register("address")}
                    />
                    <small className="text-danger">{errors.address?.message}</small>
                </div>

                <div className="col-md-3 col-12 mb-3">
                    <p className="h5">{' '}</p>
                    <button type="reset" className="btn btn-outline-danger ms-auto" onClick={() => resetForm()}>
                        <span className="d-flex gap-2 align-items-center px-4">
                            <span className="fs-5">Reset</span>
                        </span>
                    </button>
                </div>

                <div className="d-flex gap-3">
                    <button type="reset" className="btn btn-outline-danger ms-auto" onClick={() => resetForm()}>
                        <span className="d-flex gap-2 align-items-center px-4">
                            <span className="fs-5">Reset</span>
                        </span>
                    </button>

                    <button className="btn btn-outline-success" onClick={handleSubmit(onSubmit)}>
                        <span className="d-flex gap-2 align-items-center px-4">
                            <span className="fs-5">Save</span>
                        </span>
                    </button>
                </div>
            </div>

            <div className="justify-content-center d-flex">
                {networkRequest && <OribitalLoading color='red' />}
            </div>

            <div className={`container mt-4 p-3 shadow-sm border border-2 rounded-1 ${networkRequest ? 'disabledDiv' : ''}`}>
                <div className="border bg-light my-3">
                    {/* <TableM tableProps={tableProps} tableData={pagedData} /> */}
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
            <InputDialog
                show={showInputModal}
                handleClose={handleCloseModal}
                handleConfirm={handleInputOK}
                message={displayMsg}
            />
        </div>
    );
}

export default AccountGroupsView;