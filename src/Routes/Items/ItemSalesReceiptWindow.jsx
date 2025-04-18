import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Row, Table } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { object, date, ref } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Datetime from 'react-datetime';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import numeral from 'numeral';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { applyPlugin, autoTable } from 'jspdf-autotable'

import SVG from '../../assets/Svg';
import OffcanvasMenu from '../../Components/OffcanvasMenu';
import { useAuth } from '../../app-context/auth-user-context';
import handleErrMsg from '../../Utils/error-handler';
import transactionsController from '../../Controllers/transactions-controller';
import itemController from '../../Controllers/item-controller';
import { ThreeDotLoading } from '../../Components/react-loading-indicators/Indicator';
import ErrorMessage from '../../Components/ErrorMessage';
import { ReceiptSalesItem } from '../../Entities/DocExport/ReceiptSalesItem';

const ItemSalesReceiptWindow = () => {
    applyPlugin(jsPDF);
    const navigate = useNavigate();
        
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();

    const schema = object().shape({
        product: object().required("Select a product"),
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

    const dispensaryOffCanvasMenu = [
        { label: "Export to PDF", onClickParams: {evtName: 'pdfExport'} },
        { label: "Export to Excel", onClickParams: {evtName: 'xlsExport'} },
    ];
        
    const [networkRequest, setNetworkRequest] = useState(false);
    const [data, setData] = useState([]);

    const [itemOptions, setItemOptions] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(true);
    
    const [filename, setFilename] = useState("");
        
    useEffect( () => {
        initialize();
    }, []);
      
    const initialize = async () => {
        try {
            const response = await itemController.findItemsForMonoTransaction();
    
            //  check if the request to fetch item doesn't fail before setting values to display
            if (response && response.data) {
                setItemOptions(response.data.map(item => ({label: item.itemName, value: item})));
                setItemsLoading(false);
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
                if(user.hasAuth('PROFIT_VIEW')){
                    xlsxProfitExport();
                }else {
                    xlsxExport();
                }
                break;
            case 'pdfExport':
                if(user.hasAuth('PROFIT_VIEW')){
                    pdfProfitExport();
                }else {
                    pdfExport();
                }
                break;
        }
    }

    const xlsxExport = () => {
        //  ref: https://codesandbox.io/p/sandbox/react-export-excel-wrdew?file=%2Fsrc%2FApp.js

        const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const fileExtension = ".xlsx";
        
        const Heading = [ {id: "Receipt No.", itemName: "Description", qty: "Qty", qtyType: "Qty Type", price: "Sales Price (x1)", itemDiscount: "Discount (x1)", 
            totalAmount: 'Amount' } ];

        const temp = [];
        data.forEach(t => {
			const a = {...t.toJSON()};
            a.totalAmount = t.totalAmount;
			//  delete a.pkgStockPrice;
			delete a.stockPrice;
			temp.push(a);
		});
        const wscols = [
            { wch: 15 },
            { wch: Math.max(...data.map(datum => datum.itemName.length)) },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 }
        ];
        const ws = XLSX.utils.json_to_sheet(Heading, {
            header: ['id', "itemName", "qty", "qtyType", "price", "itemDiscount", 'totalAmount'],
            skipHeader: true,
            origin: 0 //ok
        });
        ws["!cols"] = wscols;
        XLSX.utils.sheet_add_json(ws, temp, {
            header: ['id', "itemName", "qty", "qtyType", "price", "itemDiscount", 'totalAmount'],
            skipHeader: true,
            origin: -1 //ok
        });
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const finalData = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(finalData, `${filename}` + fileExtension);
    };

    const xlsxProfitExport = () => {
        //  ref: https://codesandbox.io/p/sandbox/react-export-excel-wrdew?file=%2Fsrc%2FApp.js

        const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const fileExtension = ".xlsx";
        
        const Heading = [ {id: "Receipt No.", itemName: "Description", qty: "Qty", qtyType: "Qty Type", stockPrice: 'Stock Price (x1)', price: "Sales Price (x1)", 
            itemDiscount: "Discount (x1)", totalAmount: 'Amount', profit: 'Profit Margin' } ];

        const temp = [];
        data.forEach(t => {
			const a = {...t.toJSON()};
            a.totalAmount = t.totalAmount;
			a.profit = t.profit;
            //  delete a.pkgStockPrice;
			temp.push(a);
		});
        const wscols = [
            { wch: 15 },
            { wch: Math.max(...data.map(datum => datum.itemName.length)) },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 }
        ];
        const ws = XLSX.utils.json_to_sheet(Heading, {
            header: ['id', "itemName", "qty", "qtyType", 'stockPrice', "price", "itemDiscount", 'totalAmount', 'profit'],
            skipHeader: true,
            origin: 0 //ok
        });
        ws["!cols"] = wscols;
        XLSX.utils.sheet_add_json(ws, temp, {
            header: ['id', "itemName", "qty", "qtyType", 'stockPrice', "price", "itemDiscount", 'totalAmount', 'profit'],
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

        const title = "Sales Record";

        doc.text(title, marginLeft, 40);
        autoTable(doc, {
            styles: { theme: 'striped' },
            margin: { top: 50 },
            // head: [['Name', 'Email']],
            body: data,
            columns: [
                { header: 'Receipt No.', dataKey: 'id' },
                { header: 'Description', dataKey: 'itemName' },
                { header: 'Qty', dataKey: 'qty' },
                { header: 'Qty Type', dataKey: 'qtyType' },
                { header: 'Sales Price', dataKey: 'price' },
                { header: 'Discount (x1)', dataKey: 'itemDiscount' },
                { header: 'Amount', dataKey: 'totalAmount' },
            ],
        });
        
        doc.save(`${filename}` + fileExtension);
    }

    const pdfProfitExport = () => {
        /*  ref:
            *   https://stackoverflow.com/questions/56752113/export-to-pdf-in-react-table
            *   https://www.npmjs.com/package/jspdf-autotable
            *   https://www.npmjs.com/package/jspdf */
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape
        const fileExtension = ".pdf";

        const marginLeft = 40;
        const doc = new jsPDF(orientation, unit, size);

        doc.setFontSize(15);

        const title = "Sales Record";

        doc.text(title, marginLeft, 40);

        let totalAmount = numeral(0);
        let totalProfit = numeral(0);
        data.forEach(salesRecord => {
            totalAmount = numeral(totalAmount).add(salesRecord.totalAmount);
            totalProfit = numeral(totalProfit).add(salesRecord.profit);
        });

        doc.autoTable({
            styles: { theme: 'striped' },
            margin: { top: 50 },
            // head: [['Name', 'Email']],
            body: data,
            columns: [
                { header: 'Receipt No.', dataKey: 'id' },
                { header: 'Description', dataKey: 'itemName' },
                { header: 'Qty', dataKey: 'qty' },
                { header: 'Qty Type', dataKey: 'qtyType' },
                { header: 'Stock Price (x1)', dataKey: 'stockPrice' },
                { header: 'Sales Price', dataKey: 'price' },
                { header: 'Discount (x1)', dataKey: 'itemDiscount' },
                { header: 'Amount', dataKey: 'totalAmount' },
                { header: 'Profit Margin', dataKey: 'profit' },
            ],
        });
        doc.text(`Total Amount: ${numeral(totalAmount).format('₦0,0.00')} | Total Profit: ${numeral(totalProfit).format('₦0,0.00')}`, marginLeft, doc.lastAutoTable.finalY + 40);
        
        doc.save(`${filename}` + fileExtension);
    }

    const onsubmit = async (data) => {
        try {
            if (data.startDate && data.endDate) {
                setNetworkRequest(true);
                setData([]);
                data.startDate.setHours(0);
                data.startDate.setMinutes(0);
                data.startDate.setSeconds(0);
    
                data.endDate.setHours(23);
                data.endDate.setMinutes(59);
                data.endDate.setSeconds(59);

                setFilename(`sales_summary_${data.product.value.itemName}_${data.startDate} - ${data.endDate}`);

                const response = await transactionsController.itemSalesReceiptsByDate(data.startDate.toISOString(), data.endDate.toISOString(), data.product.value.id);
                if(response && response.data){
                    const arr = [];
                    for (const key in response.data) {
                        response.data[key].forEach(item => {
                            //  temporarily use id to hold receipt id
                            const salesRecord = new ReceiptSalesItem();
                            salesRecord.id = item.receipt_id;
                            salesRecord.qty = item.qty;
                            salesRecord.qtyType = item.qty_type;
                            salesRecord.itemDiscount = item.item_discount ? item.item_discount : 0;
                            salesRecord.itemName = item.item_name;
                            //  salesRecord.pkgStockPrice = item.pack_stock;
                            salesRecord.stockPrice = item.unit_stock;
                            salesRecord.price = item.price;
                            arr.push(salesRecord);
                        });
                    }
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
                    <OffcanvasMenu menuItems={dispensaryOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant="danger" />
                </div>
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Item Sales Record</span>
                        <img src={SVG.report_colored} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    Generate sales report for a particular item with custom dates and export to Excel/PDF and also monitor stock levels
                </span>
            </div>

            <div className="container row mx-auto my-3 p-3 rounded-3 bg-light" style={{ boxShadow: "black 3px 2px 5px" }}>
                <div className="col-md-3 col-12 mb-3">
                    <p className="h5 mb-2">Select Item</p>
                    <Controller
                        name="product"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Select
                                required
                                name="product"
                                placeholder="Select..."
                                className="text-dark col-12"
                                isLoading={itemsLoading}
                                options={itemOptions}
                                value={value}
                                onChange={ (val) => onChange(val) }
                            />
                        )}
                    />
                    <ErrorMessage source={errors.product} />
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
                                <th className='text-danger'>Receipt No.</th>
                                <th className='text-danger'>Description</th>
                                <th className='text-danger'>Qty</th>
                                <th className='text-danger'>Qty Type</th>
                                {/* <th className='text-danger'>Stock Price (x1)</th> */}
                                <th className='text-danger'>Sales Price (x1)</th>
                                <th className='text-danger'>Discount (x1)</th>
                                <th className='text-danger'>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((_datum, index) => (
                                <tr className='' key={index}>
                                    <td>{_datum.id}</td>
                                    <td>{_datum.itemName}</td>
                                    <td>{_datum.qty}</td>
                                    <td>{_datum.qtyType}</td>
                                    <td>{numeral(_datum.price).format('₦0,0.00')}</td>
                                    <td>{numeral(_datum.itemDiscount).format('₦0,0.00')}</td>
                                    <td>{numeral(_datum.totalAmount).format('₦0,0.00')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

export default ItemSalesReceiptWindow;