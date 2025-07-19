import React, { useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { object, date, ref } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { format } from "date-fns";
import Datetime from 'react-datetime';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import numeral from 'numeral';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { applyPlugin, autoTable } from 'jspdf-autotable'

import OffcanvasMenu from '../../../Components/OffcanvasMenu';
import { useAuth } from '../../../app-context/auth-user-context';
import ErrorMessage from '../../../Components/ErrorMessage';
import userController from '../../../Controllers/user-controller';
import { ReceiptSalesItem } from '../../../Entities/DocExport/ReceiptSalesItem';
import SVG from '../../../assets/Svg';
import transactionsController from '../../../Controllers/transactions-controller';
import { ThreeDotLoading } from '../../../Components/react-loading-indicators/Indicator';
import handleErrMsg from '../../../Utils/error-handler';

const UserSalesRecord = () => {
    applyPlugin(jsPDF);
    const navigate = useNavigate();
        
    const { handleRefresh, logout } = useAuth();

    const schema = object().shape({
        user: object().required("Select a user"),
        startDate: date(),
        endDate: date().min(ref("startDate"), "please update start date"),
    });
    
    const {
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema)
    });
    
    const startDate = watch("startDate");

    const offCanvasMenu = [
        { label: "Export to PDF", onClickParams: {evtName: 'pdfExport'} },
        // { label: "Export to Excel", onClickParams: {evtName: 'xlsExport'} },
    ];
        
    const [networkRequest, setNetworkRequest] = useState(false);
    const [data, setData] = useState([]);

    const [userOptions, setUserOptions] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    
    const [filename, setFilename] = useState("");
    const [fileHeaderTitle, setFileHeaderTitle] = useState("");
    const [startDateString, setStartDateString] = useState("");
    const [endDateString, setEndDateString] = useState("");
    
    const [totalAmount, setTotalAmount] = useState(0);
        
    useEffect( () => {
        initialize();
    }, []);
      
    const initialize = async () => {
        try {
            const response = await userController.findAllActive();
    
            //  check if the request to fetch user doesn't fail before setting values to display
            if (response && response.data) {
                setUserOptions(response.data.map(user => ({label: user.username, value: user})));
                setUsersLoading(false);
            }
    
        } catch (error) {
            //	Incase of 500 (Invalid Token received!), perform refresh
            try {
                if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                    await handleRefresh();
                    return initialize();
                }
                //  Incase of 401 Unauthorized, navigate to 404
                if(error.response?.status === 401){
                    navigate('/404');
                }
                //  display error message
                toast.error(handleErrMsg(error).msg);
            } catch (error) {
                //  if error while refreshing, logout and delete all cookies
                logout();
            }
        }
    };

    const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
        switch (onclickParams.evtName) {
            case 'xlsExport':
                xlsxExport();
                break;
            case 'pdfExport':
                pdfExport();
                break;
        }
    }

    const xlsxExport = () => {
        //  ref: https://codesandbox.io/p/sandbox/react-export-excel-wrdew?file=%2Fsrc%2FApp.js

        const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const fileExtension = ".xlsx";
        
        const Heading = [ {itemName: "Description", qty: "Qty", totalAmount: 'Amount' } ];

        const temp = [];
        data.forEach(t => {
            const a = {...t.toJSON()};
            a.totalAmount = t.totalAmount;
            delete a.id;
            delete a.qtyType;
            delete a.qtyPerPkg;
            delete a.stockPrice;
            delete a.itemDiscount;
            delete a.stockPrice;
            temp.push(a);
        });
        const wscols = [
            { wch: 15 },
            { wch: Math.max(...data.map(datum => datum.itemName.length)) },
            { wch: 15 }
        ];
        const ws = XLSX.utils.json_to_sheet(Heading, {
            header: ["itemName", "qty", 'totalAmount'],
            skipHeader: true,
            origin: 0 //ok
        });
        ws["!cols"] = wscols;
        XLSX.utils.sheet_add_json(ws, temp, {
            header: ["itemName", "qty", 'totalAmount'],
            skipHeader: true,
            origin: -1 //ok
        });
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const finalData = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(finalData, `${filename}` + fileExtension);
    };

    const pdfExport = () => {
        /*  ref:
            *   https://stackoverflow.com/questions/56752113/export-to-pdf-in-react-table
            *   https://www.npmjs.com/package/jspdf-autotable
            *   https://www.npmjs.com/package/jspdf */
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "portrait"; // portrait or landscape
        const fileExtension = ".pdf";

        const marginLeft = 40;
        const doc = new jsPDF(orientation, unit, size);

        doc.setFontSize(15);

        const title = fileHeaderTitle;

        doc.text(title, marginLeft, 40);
        doc.text("Date: " + format(startDateString, 'dd/MM/yyyy') + " - " + format(endDateString, 'dd/MM/yyyy'), marginLeft, 60);
        autoTable(doc, {
            styles: { theme: 'striped' },
            margin: { top: 70 },
            // head: [['Name', 'Email']],
            body: data,
            columns: [
                { header: 'Description', dataKey: 'itemName' },
                { header: 'Qty', dataKey: 'qty' },
                { header: 'Amount', dataKey: 'totalAmount' },
            ],
        });
        doc.text(`Total Amount: ${numeral(totalAmount).format('₦0,0.00')}`, marginLeft, doc.lastAutoTable.finalY + 40);
        
        doc.save(`${filename}` + fileExtension);
    }

    const onsubmit = async (data) => {
        try {
            if (data.startDate && data.endDate) {
                setNetworkRequest(true);
                setData([]);
                setTotalAmount(0);

                data.startDate.setHours(0);
                data.startDate.setMinutes(0);
                data.startDate.setSeconds(0);
    
                data.endDate.setHours(23);
                data.endDate.setMinutes(59);
                data.endDate.setSeconds(59);

                setFilename(`sales_by_${data.user.value.username}_${data.startDate} - ${data.endDate}`);
                setFileHeaderTitle(`Sales by ${data.user.value.username}`);
                setStartDateString(data.startDate.toISOString());
                setEndDateString(data.endDate.toISOString());

                const response= await transactionsController.staffSalesRecordsSummaryByDate(data.startDate.toISOString(),data.endDate.toISOString(),data.user.value.username);
                if(response && response.data){
                    const arr = [];
                    
                    response.data.forEach(item => {
                        //  temporarily use id to hold item id
                        const salesRecord = new ReceiptSalesItem();
                        salesRecord.id = item.item_id;
                        salesRecord.qty = item.qty;
                        salesRecord.itemName = item.item_name;
                        salesRecord.price = item.amount;
                        
                        arr.push(salesRecord);
                    });
                    
                    let totalAmount = numeral(0);
                    
                    arr.forEach(item => {
                        totalAmount = numeral(totalAmount).add(item.price);
                    });
                    
                    setTotalAmount(totalAmount);
                    setData(arr);
                }
                setNetworkRequest(false);
            }
        } catch (error) {
            setNetworkRequest(false);
            //	Incase of 500 (Invalid Token received!), perform refresh
            try {
                if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                    await handleRefresh();
                    return onsubmit(data);
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
        <div className='container my-4'>
            <div className="container-md mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 text-white align-items-center" >
                <div>
                    <OffcanvasMenu menuItems={offCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant="danger" />
                </div>
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>User Sales Record</span>
                        <img src={SVG.report_colored} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    Generate sales record by user with custom dates and export to Excel/PDF and also monitor stock levels
                </span>
            </div>

            <div className="container row mx-auto my-3 p-3 rounded-3 bg-light" style={{ boxShadow: "black 3px 2px 5px" }}>
                <div className="col-md-3 col-12 mb-3">
                    <p className="h5 mb-2">Select User</p>
                    <Controller
                        name="user"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Select
                                required
                                name="user"
                                placeholder="Select..."
                                className="text-dark col-12"
                                isLoading={usersLoading}
                                options={userOptions}
                                value={value}
                                onChange={ (val) => onChange(val) }
                            />
                        )}
                    />
                    <ErrorMessage source={errors.user} />
                </div>
                {/*  */}

                <div className="col-md-3 col-12 mb-3">
                    <p className="h5 mb-2">Start Date:</p>
                    <Controller
                        name="startDate"
                        control={control}
                        render={({ field }) => (
                            <Datetime
                                {...field}
                                timeFormat={false}
                                closeOnSelect={true}
                                dateFormat="DD/MM/YYYY"
                                inputProps={{
                                    placeholder: "Choose start date",
                                    className: "form-control",
                                    readOnly: true, // Optional: makes input read-only
                                }}
                                onChange={(date) => {
                                    setValue("endDate", date.toDate());
                                    field.onChange(date ? date.toDate() : null);
                                }}
                                /*	react-hook-form is unable to reset the value in the Datetime component because of the below bug.
                                    refs:
                                        *	https://stackoverflow.com/questions/46053202/how-to-clear-the-value-entered-in-react-datetime
                                        *	https://stackoverflow.com/questions/69536272/reactjs-clear-date-input-after-clicking-clear-button
                                    there's clearly a rendering bug in component if you try to pass a null or empty value in controlled component mode: 
                                    the internal input still got the former value entered with the calendar (uncontrolled ?) despite the fact that that.state.value
                                    or field.value is null : I've been able to "patch" it with the renderInput prop :*/
                                renderInput={(props) => {
                                    return <input {...props} value={field.value ? props.value : ''} />
                                }}
                            />
                        )}
                    />
                </div>

                <div className="col-md-3 col-12 mb-3">
                    <p className="h5 mb-2">End Date:</p>
                    <Controller
                        name="endDate"
                        control={control}
                        render={({ field }) => (
                            <Datetime
                                {...field}
                                timeFormat={false}
                                closeOnSelect={true}
                                dateFormat="DD/MM/YYYY"
                                inputProps={{
                                    placeholder: "Choose end date",
                                    className: "form-control",
                                    readOnly: true, // Optional: makes input read-only
                                }}
                                onChange={(date) =>
                                    field.onChange(date ? date.toDate() : null)
                                }
                                isValidDate={(current) => {
                                    // Ensure end date is after start date
                                    return (
                                    !startDate || current.isSameOrAfter(startDate, "day")
                                    );
                                }}
                                /*	react-hook-form is unable to reset the value in the Datetime component because of the below bug.
                                    refs:
                                        *	https://stackoverflow.com/questions/46053202/how-to-clear-the-value-entered-in-react-datetime
                                        *	https://stackoverflow.com/questions/69536272/reactjs-clear-date-input-after-clicking-clear-button
                                    there's clearly a rendering bug in component if you try to pass a null or empty value in controlled component mode: 
                                    the internal input still got the former value entered with the calendar (uncontrolled ?) despite the fact that that.state.value
                                    or field.value is null : I've been able to "patch" it with the renderInput prop :*/
                                renderInput={(props) => {
                                    return <input {...props} value={field.value ? props.value : ''} />
                                }}
                            />
                        )}
                    />
                </div>
                
                <div className="col-md-3 col-12 mt-4">
                    <Button className="w-100 mt-2" onClick={handleSubmit(onsubmit)} disabled={networkRequest}>
                        { (networkRequest) && <ThreeDotLoading color="#ffffff" size="small" /> }
                        { (!networkRequest) && `Search` }
                    </Button>
                </div>
            </div>
            
            <div className="p-3 rounded-3 p-3 overflow-md-auto bg-secondary-subtle my-4" style={{ minHeight: "800px" }}>
                <div className="border border rounded-3 p-1 bg-light my-3 shadow" style={{ maxHeight: "750px", overflow: 'scroll' }}>
                    <Table id="myTable" className="rounded-2" striped hover responsive>
                        <thead>
                            <tr className="shadow-sm">
                                <th className='text-danger'>Description</th>
                                <th className='text-danger'>Qty</th>
                                <th className='text-danger'>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((_datum, index) => (
                                <tr className='' key={index}>
                                    <td>{_datum.itemName}</td>
                                    <td>{_datum.qty}</td>
                                    <td>{numeral(_datum.price).format('₦0,0.00')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
            <div className="row">
                <div className="col-12 text-center mb-3">
                    <p className="fw-bold text-primary h5">Total Sales Price</p>
                    <h3 className='text-danger'> {numeral(totalAmount).format('₦0,0.00')} </h3>
                </div>
            </div>
        </div>
    )
}

export default UserSalesRecord;