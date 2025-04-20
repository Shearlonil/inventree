import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import * as yup from "yup";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import fileDownload from "js-file-download";

import SVG from '../assets/Svg';
import { Button, Col, Form, FormControl, Row } from 'react-bootstrap';
import dbController from '../Controllers/db-controller';
import handleErrMsg from '../Utils/error-handler';
import ErrorMessage from '../Components/ErrorMessage';
import { ThreeDotLoading } from '../Components/react-loading-indicators/Indicator';
import AppConstants from '../Utils/AppConstants';

const Settings = () => {

    const [networkRequest, setNetworkRequest] = useState(false);

	const restoreFileSchema = yup.object().shape({
        db_file: yup
            .mixed()
            .test("fileFormat", "Unsupported file format. Please upload a backup (.bak) file", (value) => {
                if (value.length > 0) {
                    const supportedFormats = ["bak", "sql"];
                    return supportedFormats.includes(value['0'].name.split(".").pop());
                }
                return true;
            })
            .test("required", "Please upload a backup file", (value) => {
                return value.length > 0;
            }),
	});
	const {
		register: bakFileRegister,
		handleSubmit: handleBakFileSubmit,
		formState: { errors: bakFileErrors },
	} = useForm({
		resolver: yupResolver(restoreFileSchema),
	});

	const printerNameSchema = yup.object().shape({
        name: yup.string().required("printer name is required"),
	});
	const {
		register: printerNameRegister,
        setValue: setPrinterNameVal,
		handleSubmit: handlePrinterNameSubmit,
		formState: { errors: printerNameErrors },
	} = useForm({
		resolver: yupResolver(printerNameSchema),
	});

	const printerUrlSchema = yup.object().shape({
        url: yup.string().required("printer url is required"),
	});
	const {
		register: printerUrlRegister,
        setValue: setPrinterUrlVal,
		handleSubmit: handlePrinterUrlSubmit,
		formState: { errors: printerUrlErrors },
	} = useForm({
		resolver: yupResolver(printerUrlSchema),
	});
    
    useEffect( () => {
        setPrinterNameVal('name', localStorage.getItem(AppConstants.printerName));
        setPrinterUrlVal('url', localStorage.getItem(AppConstants.printerURL));
    }, []);

    const backupDB = async () => {
        try {
			setNetworkRequest(true);
            const response = await dbController.backup();
            if(response && response.data){
                fileDownload(response.data, `inventree.bak`);
            }
			setNetworkRequest(false);
        } catch (error) {
            toast.error(handleErrMsg(error).msg);
        }
    }

    const onSubmit = async (file) => {
        try {
			setNetworkRequest(true);
            const response = await dbController.restore(file.db_file[0]);
            toast.info("Database decryption successful")
			setNetworkRequest(false);
        } catch (error) {
            toast.error(handleErrMsg(error).msg);
        }
    }

    const onPrinterNameSubmit = async (data) => {
        localStorage.setItem(AppConstants.printerName, data.name);
    }

    const onPrinterUrlSubmit = async (data) => {
        localStorage.setItem(AppConstants.printerURL, data.url);
    }

    return (
        <div style={{minHeight: '70vh'}} className="container">
            <div className="container mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Settings</span>
                        <img src={SVG.settings} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
            </div>

            <div className="mt-4">
                <Row className="mb-3">
                    <Col md="3" className="mb-3">
                        <Form.Label>Printer Name</Form.Label>
                    </Col>
                    <Col md="6" className="mb-3">
                        <Form.Control required type="text" placeholder="Printer name..." {...printerNameRegister("name")} />
						<ErrorMessage source={printerNameErrors.name} />
                    </Col>
                    <Col className="my-2 my-md-0 mb-3" md={"3"}>
                        <Button className="w-100" variant='outline-danger' onClick={handlePrinterNameSubmit(onPrinterNameSubmit)} >
                            Save
                        </Button>
                    </Col>
                </Row>
            </div>

            <div className="mt-4">
                <Row className="mb-3">
                    <Col md="3" className="mb-3">
                        <Form.Label>Printer Server URL</Form.Label>
                    </Col>
                    <Col md="6" className="mb-3">
                        <Form.Control required type="text" placeholder="Printer Server URL..." {...printerUrlRegister("url")} />
						<ErrorMessage source={printerUrlErrors.url} />
                    </Col>
                    <Col className="my-2 my-md-0 mb-3" md={"3"}>
                        <Button className="w-100" variant='outline-danger' onClick={handlePrinterUrlSubmit(onPrinterUrlSubmit)} >
                            Save
                        </Button>
                    </Col>
                </Row>
            </div>
            <hr className='mt-4' />

            <h2 className='text-success'>Database</h2>

            <div className="mt-4">
                <Row className="mb-3">
                    <Col md="3" className=" d-flex align-items-center">
                        <Form.Label>Database backup</Form.Label>
                    </Col>
                    <Col className="mb-4 my-2 my-md-0 d-flex justify-content-center justify-content-md-start border-end border-primary border-4" md={"3"}>
                        <Button className="w-75" variant='outline-danger' onClick={() => { backupDB() }} >
                            { (networkRequest) && <ThreeDotLoading color="#ffffff" size="small" /> }
                            { (!networkRequest) && `Back Up` }
                        </Button>
                    </Col>

                    <Col md="4" className=" d-flex align-items-center flex-column">
                        <FormControl name="db_file" type="file" accept=".bak,.sql" {...bakFileRegister("db_file")} />
						<ErrorMessage source={bakFileErrors.db_file} />
                    </Col>
                    <Col className="my-2 my-md-0 d-flex justify-content-center justify-content-md-start" md={"2"}>
                        <Button className="w-75" variant='outline-danger' onClick={handleBakFileSubmit(onSubmit)} >
                            { (networkRequest) && <ThreeDotLoading color="#ffffff" size="small" /> }
                            { (!networkRequest) && `Restore` }
                        </Button>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default Settings;