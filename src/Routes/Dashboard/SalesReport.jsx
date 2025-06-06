import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Row, Table } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { object, date, ref } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Datetime from 'react-datetime';
import numeral from 'numeral';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'

import SVG from '../../assets/Svg';
import OffcanvasMenu from '../../Components/OffcanvasMenu';
import { useAuth } from '../../app-context/auth-user-context';
import handleErrMsg from '../../Utils/error-handler';
import transactionsController from '../../Controllers/transactions-controller';
import { ThreeDotLoading } from '../../Components/react-loading-indicators/Indicator';
import ErrorMessage from '../../Components/ErrorMessage';
import { SalesSummary } from '../../Entities/SalesSummary';

const SalesReport = () => {
    const navigate = useNavigate();
        
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();

    const schema = object().shape({
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
    
    const [filename, setFilename] = useState("");

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'xlsExport':
                if (user.hasAuth('PROFIT_VIEW')) {
                    profitXlsxExport();
                }else {
                    xlsxExport();
                }
                break;
            case 'pdfExport':
                if (user.hasAuth('PROFIT_VIEW')) {
                    profitPdfExport();
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

        const Heading = [ {itemName: "Item Name", storeQty: "Store Qty", salesQty: "Shelf Qty", totalQty: "Total Qty", soldOutQty: "Sold Qty", 
            avgUnitSalesPrice: "Unit Sales Price (AVG)", totalSalesPrice: "Total Sales Price" } ];

        const temp = [];
        data.forEach(datum => {
            const d = {...datum.toJSON()};
            delete d.id;
            delete d.unitProfit;
            delete d.avgUnitStockPrice;
            delete d.totalStockPrice;
            delete d.grossProfit;
            temp.push(d);
        });
        const wscols = [
            { wch: Math.max(...data.map(datum => datum.itemName.length)) },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 },
            { wch: 15 },
        ];
        const ws = XLSX.utils.json_to_sheet(Heading, {
            header: ["itemName", "storeQty", "salesQty", "totalQty", "soldOutQty", "avgUnitSalesPrice", "totalSalesPrice"],
            skipHeader: true,
            origin: 0 //ok
        });
        ws["!cols"] = wscols;
        XLSX.utils.sheet_add_json(ws, temp, {
            header: ["itemName", "storeQty", "salesQty", "totalQty", "soldOutQty", "avgUnitSalesPrice", "totalSalesPrice"],
            skipHeader: true,
            origin: -1 //ok
        });
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const finalData = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(finalData, `${filename}` + fileExtension);
    };

    const profitXlsxExport = () => {
        //  ref: https://codesandbox.io/p/sandbox/react-export-excel-wrdew?file=%2Fsrc%2FApp.js

        const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const fileExtension = ".xlsx";

        const Heading = [ {itemName: "Item Name", storeQty: "Store Qty", salesQty: "Shelf Qty", totalQty: "Total Qty", soldOutQty: "Sold Qty", 
            avgUnitStockPrice: "Unit Stock Price (AVG)", totalStockPrice: "Total Stock Price", avgUnitSalesPrice: "Unit Sales Price (AVG)", 
            totalSalesPrice: "Total Sales Price", grossProfit: "Gross Profit" } ];

        const temp = [];
        data.forEach(datum => {
            const d = {...datum.toJSON()};
            delete d.id;
            delete d.unitProfit;
            temp.push(d);
        });
        const wscols = [
            { wch: Math.max(...data.map(datum => datum.itemName.length)) },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 },
            { wch: 15 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 }
        ];
        const ws = XLSX.utils.json_to_sheet(Heading, {
            header: ["itemName", "storeQty", "salesQty", "totalQty", "soldOutQty", "avgUnitStockPrice", "totalStockPrice", "avgUnitSalesPrice", "totalSalesPrice", "grossProfit"],
            skipHeader: true,
            origin: 0 //ok
        });
        ws["!cols"] = wscols;
        XLSX.utils.sheet_add_json(ws, temp, {
            header: ["itemName", "storeQty", "salesQty", "totalQty", "soldOutQty", "avgUnitStockPrice", "totalStockPrice", "avgUnitSalesPrice", "totalSalesPrice", "grossProfit"],
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

        const title = "Sales Summary";

        let totalStockPrice = numeral(0);
        let totalSalesPrice = numeral(0);
        let totalGrossProfit = numeral(0);
        data.forEach(datum => {
            totalStockPrice = numeral(totalStockPrice).add(datum.totalStockPrice);
            totalSalesPrice = numeral(totalSalesPrice).add(datum.totalSalesPrice);
            totalGrossProfit = numeral(totalGrossProfit).add(datum.grossProfit);
        });
        
        doc.text(title, marginLeft, 40);
        autoTable(doc, {
            styles: { theme: 'striped' },
            margin: { top: 50 },
            // head: [['Name', 'Email']],
            body: data,
            columns: [
                { header: 'Item Name', dataKey: 'itemName' },
                { header: 'Store Qty', dataKey: 'storeQty' },
                { header: 'Shelf Qty', dataKey: 'salesQty' },
                { header: 'Total Qty', dataKey: 'totalQty' },
                { header: 'Qty Sold', dataKey: 'soldOutQty' },
                { header: 'Unit Sales Price (AVG)', dataKey: 'avgUnitSalesPrice' },
                { header: 'Total Sales Price', dataKey: 'totalSalesPrice' },
            ],
        });
        doc.text(`Total Sales Price: ${numeral(totalSalesPrice).format('₦0,0.00')}`, marginLeft, doc.lastAutoTable.finalY + 40);

        doc.save(`${filename}` + fileExtension);
    }

    const profitPdfExport = () => {
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

        const title = "Sales Summary";

        let totalStockPrice = numeral(0);
        let totalSalesPrice = numeral(0);
        let totalGrossProfit = numeral(0);
        data.forEach(datum => {
            totalStockPrice = numeral(totalStockPrice).add(datum.totalStockPrice);
            totalSalesPrice = numeral(totalSalesPrice).add(datum.totalSalesPrice);
            totalGrossProfit = numeral(totalGrossProfit).add(datum.grossProfit);
        });
        
        doc.text(title, marginLeft, 40);
        autoTable(doc, {
            styles: { theme: 'striped' },
            margin: { top: 50 },
            // head: [['Name', 'Email']],
            body: data,
            columns: [
                { header: 'Item Name', dataKey: 'itemName' },
                { header: 'Store Qty', dataKey: 'storeQty' },
                { header: 'Shelf Qty', dataKey: 'salesQty' },
                { header: 'Total Qty', dataKey: 'totalQty' },
                { header: 'Qty Sold', dataKey: 'soldOutQty' },
                { header: 'Unit Stock Price (AVG)', dataKey: 'avgUnitStockPrice' },
                { header: 'Total Stock Price', dataKey: 'totalStockPrice' },
                { header: 'Unit Sales Price (AVG)', dataKey: 'avgUnitSalesPrice' },
                { header: 'Total Sales Price', dataKey: 'totalSalesPrice' },
                { header: 'Gross Profit', dataKey: 'grossProfit' },
            ],
        });
        doc.text(`Total Stock Price: ${numeral(totalStockPrice).format('₦0,0.00')} | Total Sales Price: ${numeral(totalSalesPrice).format('₦0,0.00')}`, marginLeft, doc.lastAutoTable.finalY + 40);
        doc.text(`Total Gross Profit: ${numeral(totalGrossProfit).format('₦0,0.00')}`, marginLeft,  doc.lastAutoTable.finalY + 70);

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

                setFilename(`sales_summary_${data.startDate} - ${data.endDate}`);

				const response = await transactionsController.summarizeSalesRecords(data.startDate.toISOString(), data.endDate.toISOString());
				if(response && response.data){
                    const arr = [];
                    response.data.forEach(datum => {
                        arr.push(new SalesSummary(datum));
                    });
                    arr.sort(
                        (a, b) => (a.itemName.toLowerCase() > b.itemName.toLowerCase()) ? 1 : ((b.itemName.toLowerCase() > a.itemName.toLowerCase()) ? -1 : 0)
                    )
                    /*
                    IN PREVIOUS VERSION, displaying both items with sales records within the selected range and items without sales record.
                    //  filter out items with sales qty and sort by name
                    const sold = response.data
                        .filter(item => item.soldOutQty > 0)
                        .sort(
                            (a, b) => (a.itemName.toLowerCase() > b.itemName.toLowerCase()) ? 1 : ((b.itemName.toLowerCase() > a.itemName.toLowerCase()) ? -1 : 0)
                        );
                    
                    //  filter out unsold items
                    const unsold = response.data
                        .filter(item => item.soldOutQty === 0)
                        .sort(
                            (a, b) => (a.itemName.toLowerCase() > b.itemName.toLowerCase()) ? 1 : ((b.itemName.toLowerCase() > a.itemName.toLowerCase()) ? -1 : 0)
                        );
                    */
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
						<span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Sales Summary</span>
						<img src={SVG.report_colored} style={{ width: "50px", height: "50px" }} />
					</h2>
				</div>
                <span className='text-center m-1'>
                    Generate Item sales report with custom dates and export to Excel/PDF and also monitor stock levels
                </span>
			</div>
            
            <div className="border py-4 px-5 bg-white-subtle rounded-4 my-4" style={{ boxShadow: "black 3px 2px 5px" }} >
                <Row className="align-items-center">
                    <Col sm lg="4" className="mt-3 mt-md-0">
                        <Form.Label className="fw-bold">Start Date</Form.Label>
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
                        <ErrorMessage source={errors.startDate} />
                    </Col>
                    <Col sm lg="4" className="mt-3 mt-md-0">
                        <Form.Label className="fw-bold">End Date</Form.Label>
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
                        <ErrorMessage source={errors.endDate} />
                    </Col>
                    <Col sm lg="3" className="align-self-end text-center mt-3">
                        <Button className="w-100" onClick={handleSubmit(onsubmit)} disabled={networkRequest}>
                            { (networkRequest) && <ThreeDotLoading color="#ffffff" size="small" /> }
                            { (!networkRequest) && `Search` }
                        </Button>
                    </Col>
                </Row>
            </div>
            
            <div className="p-3 rounded-3 p-3 overflow-md-auto bg-secondary-subtle my-4" style={{ minHeight: "800px" }}>
                <div className="border border rounded-3 p-1 bg-light my-3 shadow" style={{ maxHeight: "750px", overflow: 'scroll' }}>
                    <Table id="myTable" className="rounded-2" striped hover responsive>
                        <thead>
                            <tr className="shadow-sm">
                                <th className='text-danger'>Item Name</th>
                                <th className='text-danger'>Store Qty</th>
                                <th className='text-danger'>Shelf Qty</th>
                                <th className='text-danger'>Total Qty</th>
                                <th className='text-danger'>Sold Qty</th>
                                {user && user.hasAuth('PROFIT_VIEW') && <th className='text-danger'>Unit Stock Price (AVG)</th>}
                                {user && user.hasAuth('PROFIT_VIEW') && <th className='text-danger'>Total Stock Price</th>}
                                <th className='text-danger'>Unit Sales Price (AVG)</th>
                                <th className='text-danger'>Total Sales Price</th>
                                {user && user.hasAuth('PROFIT_VIEW') && <th className='text-danger'>Gross Profit</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((_datum, index) => (
                                <tr className='' key={index}>
                                    <td>{_datum.itemName}</td>
                                    <td>{_datum.storeQty}</td>
                                    <td>{_datum.salesQty}</td>
                                    <td>{_datum.totalQty}</td>
                                    <td>{_datum.soldOutQty}</td>
                                    {user && user.hasAuth('PROFIT_VIEW') && <td>{numeral(_datum.avgUnitStockPrice).format('₦0,0.00')}</td>}
                                    {user && user.hasAuth('PROFIT_VIEW') && <td>{numeral(_datum.totalStockPrice).format('₦0,0.00')}</td>}
                                    <td>{numeral(_datum.avgUnitSalesPrice).format('₦0,0.00')}</td>
                                    <td>{numeral(_datum.totalSalesPrice).format('₦0,0.00')}</td>
                                    {user && user.hasAuth('PROFIT_VIEW') && <td>{numeral(_datum.grossProfit).format('₦0,0.00')}</td>}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

export default SalesReport;