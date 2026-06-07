import { useEffect, useRef, useState } from 'react';
import { Button, Col, Form, Row, Table } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { object, date, ref } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Datetime from 'react-datetime';
import { format } from "date-fns";
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import numeral from 'numeral';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { autoTable, applyPlugin } from 'jspdf-autotable'
import Select from 'react-select';

import SVG from '../../assets/Svg';
import OffcanvasMenu from '../../Components/OffcanvasMenu';
import handleErrMsg from '../../Utils/error-handler';
import { ThreeDotLoading } from '../../Components/react-loading-indicators/Indicator';
import ErrorMessage from '../../Components/ErrorMessage';
import { StockSummary } from '../../Entities/StockSummary';
import tractController from '../../Controllers/tract-controller';
import { useAuthUser } from '../../app-context/user-context';
import useInventoryController from '../../Controllers/inventory-controller-hook';

const StockValuationWindow = () => {
    const controllerRef = useRef(new AbortController());

    const navigate = useNavigate();
    const location = useLocation();
    applyPlugin(jsPDF);
    
    const { stockValuation } = useInventoryController();
    const { authUser } = useAuthUser();
    const user = authUser();

    const schema = object().shape({
        section: object().required("Select a section"),
        startDate: date(),
    });
    
    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema)
    });

    const dispensaryOffCanvasMenu = [
        { label: "Export to PDF", onClickParams: {evtName: 'pdfExport'} },
        { label: "Export to Excel", onClickParams: {evtName: 'xlsExport'} },
    ];
        
    const [networkRequest, setNetworkRequest] = useState(false);
    const [data, setData] = useState([]);
    const [totalStock, setTotalStock] = useState(0);
    
    const [filename, setFilename] = useState("");
        
    //  for tracts
    const [tractOptions, setTractOptions] = useState([]);
    const [tractsLoading, setTractsLoading] = useState(true);
    
    useEffect( () => {
        initialize();
        return () => {
            // This cleanup function runs when the component unmounts or when the dependencies of useEffect change (e.g., route change)
            controllerRef.current.abort();
        };
    }, [location.pathname]);

    const initialize = async () => {
        try {
            controllerRef.current = new AbortController();
            const tractsRequest = await tractController.fetchAllActive(controllerRef.current.signal);

            //	check if the request to fetch items doesn't fail before setting values to display
            if(tractsRequest && tractsRequest.data){
                const temp = {
                    isDefault: true,
                    creator: "pharmOyin",
                    creationDate: "2022-06-01T08:57:05.000+00:00",
                    itemsCount: 0,
                    name: "All",
                    id: 0
                }
                const arr = tractsRequest.data.map( tract => ({label: tract.name, value: tract}) );
                setTractOptions([({label: temp.name, value: temp}), ...arr]);
                setTractsLoading(false);
            }
        } catch (error) {
            setNetworkRequest(false);
            if (error.name === 'AbortError' || error.name === 'CanceledError' || (error.response?.status === 500 && error.response?.data.message === "Invalid Token received!")) {
                // Request was intentionally aborted or Invalid Bearer Token received which requires refresh, handle silently
                return;
            }
            // Incase of 401 Unauthorized, navigate to 404
            if(error.response?.status === 401){
                navigate('/404');
                return;
            }
            // display error message
            toast.error(handleErrMsg(error).msg);
        }
    };

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'xlsExport':
                if(user.hasAuth('PROFIT_VIEW')){
                    exportStoreWorthToCSV();
                }else {
                    exportToCSV();
                }
                break;
            case 'pdfExport':
                if(user.hasAuth('PROFIT_VIEW')){
                    generateStoreWorthPDF();
                }else {
                    generatePDF();
                }
                break;
        }
	}

    const exportToCSV = () => {
        //  ref: https://codesandbox.io/p/sandbox/react-export-excel-wrdew?file=%2Fsrc%2FApp.js

        const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const fileExtension = ".xlsx";

        const Heading = [ {itemName: "Description", storeQty: "Store Qty", salesQty: "Sales Qty", totalQty: "Total Qty" } ];

        const temp = [...data];
        temp.forEach(t => {
            const d = {
                itemName: t.itemName,
                storeQty: t.storeQty,
                salesQty: t.salesQty,
                totalQty: t.totalQty,
            };
            temp.push(d);
        });
        const wscols = [
            { wch: Math.max(...data.map(datum => datum.itemName.length)) },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 }
        ];
        const ws = XLSX.utils.json_to_sheet(Heading, {
            header: ["itemName", "storeQty", "salesQty", "totalQty"],
            skipHeader: true,
            origin: 0 //ok
        });
        ws["!cols"] = wscols;
        XLSX.utils.sheet_add_json(ws, temp, {
            header: ["itemName", "storeQty", "salesQty", "totalQty"],
            skipHeader: true,
            origin: -1 //ok
        });
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const finalData = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(finalData, `${filename}` + fileExtension);
    };

    const exportStoreWorthToCSV = () => {
        //  ref: https://codesandbox.io/p/sandbox/react-export-excel-wrdew?file=%2Fsrc%2FApp.js

        const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const fileExtension = ".xlsx";

        const Heading = [ {itemName: "Description", storeQty: "Store Qty", salesQty: "Sales Qty", totalQty: "Total Qty", totalStockPrice: "Stock Price" } ];

        const temp = [];
        data.forEach(t => {
            const d = {
                itemName: t.itemName,
                storeQty: t.storeQty,
                salesQty: t.salesQty,
                totalQty: t.totalQty,
                totalStockPrice: t.totalStockPrice
            };
            temp.push(d);
        });

        const wscols = [
            { wch: Math.max(...data.map(datum => datum.itemName.length)) },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 }
        ];
        const ws = XLSX.utils.json_to_sheet(Heading, {
            header: ["itemName", "storeQty", "salesQty", "totalQty", "totalStockPrice"],
            skipHeader: true,
            origin: 0 //ok
        });
        ws["!cols"] = wscols;
        XLSX.utils.sheet_add_json(ws, temp, {
            header: ["itemName", "storeQty", "salesQty", "totalQty", "totalStockPrice"],
            skipHeader: true,
            origin: -1 //ok
        });
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const finalData = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(finalData, `${filename}` + fileExtension);
    };

    const generatePDF = () => {
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

        const title = "Stock Summary";

        doc.text(title, marginLeft, 40);
        autoTable(doc, {
            styles: { theme: 'striped' },
            margin: { top: 50 },
            // head: [['Name', 'Email']],
            body: data,
            columns: [
                { header: 'Item Name', dataKey: 'itemName' },
                { header: 'Store Qty', dataKey: 'storeQty' },
                { header: 'Sales Qty', dataKey: 'salesQty' },
                { header: 'Total Qty', dataKey: 'totalQty' },
            ],
        });
        
        doc.save(`${filename}` + fileExtension);
    }

    const generateStoreWorthPDF = () => {
        let netWorth = numeral(0);

        data.forEach(t => {
            netWorth = numeral(netWorth).add(t.totalStockPrice);
        });

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

        const title = "Stock Summary";

        doc.text(title, marginLeft, 40);
        doc.autoTable({
            styles: { theme: 'striped' },
            margin: { top: 50 },
            // head: [['Name', 'Email']],
            body: data,
            columns: [
                { header: 'Item Name', dataKey: 'itemName' },
                { header: 'Store Qty', dataKey: 'storeQty' },
                { header: 'Sales Qty', dataKey: 'salesQty' },
                { header: 'Total Qty', dataKey: 'totalQty' },
                { header: 'Stock Price', dataKey: 'totalStockPrice' },
            ],
        });
        doc.text(`Total Net: ${numeral(netWorth).format('₦0,0.00')}`, marginLeft,  doc.lastAutoTable.finalY + 40);
        
        doc.save(`${filename}` + fileExtension);
    }

	const onsubmit = async (data) => {
		try {
			if (data.startDate) {
				setNetworkRequest(true);
				resetAbortController();
                setData([]);
                setTotalStock(0);
                //  Time isn't important here (Java will set the time to 23:59:59). Just setting to 12hr to avoid 1hr lag
                const tempDate = format(data.startDate, "yyyy-MM-dd") + "T12:00:00.000Z";

                setFilename(`stock_valuation_${tempDate}`);

				const response = await stockValuation(tempDate, data.section.value.id, controllerRef.current.signal);
				if(response && response.data){
                    let totalStock = numeral(0);
                    const arr = [];
                    response.data.forEach(datum => {
                        const stockSummary = new StockSummary(datum);
                        totalStock = numeral(totalStock).add(stockSummary.totalStockPrice);
                        arr.push(stockSummary);
                    });
                    arr.sort(
                        (a, b) => (a.itemName.toLowerCase() > b.itemName.toLowerCase()) ? 1 : ((b.itemName.toLowerCase() > a.itemName.toLowerCase()) ? -1 : 0)
                    );
                    setTotalStock(totalStock);
					setData(arr);
				}
				setNetworkRequest(false);
			}
		} catch (error) {
            setNetworkRequest(false);
            // Incase of 401 Unauthorized, navigate to 404
            if(error.response?.status === 401){
                navigate('/404');
                return;
            }
            // display error message
            toast.error(handleErrMsg(error).msg);
		}
	}

    const resetAbortController = () => {
        // Cancel previous request if it exists
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
        controllerRef.current = new AbortController();
    };

    return (
        <div className='container my-4'>
            <div className="container-md mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 text-white align-items-center" >
				<OffcanvasMenu menuItems={dispensaryOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant="danger" />
				<div className="text-center d-flex">
					<h2 className="display-6 p-3 mb-0">
						<span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Stock Valuation</span>
						<img src={SVG.report_colored} style={{ width: "50px", height: "50px" }} />
					</h2>
				</div>
                <span className='text-center m-1'>
                    Generate Stock summary report with custom dates and export to Excel/PDF. View closing stock at any given date
                </span>
                <span className='fw-bold'>Please Note: The Average Account Valuation is used</span>
			</div>
            
            <div className="border py-4 px-5 bg-white-subtle rounded-4 my-4" style={{ boxShadow: "black 3px 2px 5px" }} >
                <Row className="align-items-center">
                    <Col sm lg="4" className="mt-3 mt-md-0">
                        <Form.Label className="fw-bold">Select Section</Form.Label>
                        <Controller
                            name="section"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Select
                                    required
                                    name="section"
                                    placeholder="Select..."
                                    className="text-dark col-12"
                                    isLoading={tractsLoading}
                                    options={tractOptions}
                                    value={value}
                                    onChange={ (val) => onChange(val) }
                                />
                            )}
                        />
                        <ErrorMessage source={errors.section} />
                    </Col>
                    <Col sm lg="4" className="mt-3 mt-md-0">
                        <Form.Label className="fw-bold">Date</Form.Label>
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
                                        placeholder: "Choose date",
                                        className: "form-control",
                                        readOnly: true, // Optional: makes input read-only
                                    }}
                                    onChange={(date) => field.onChange(date ? date.toDate() : null) }
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
                                <th className='text-danger'>Description</th>
                                <th className='text-danger'>Store Qty</th>
                                <th className='text-danger'>Shelf Qty</th>
                                <th className='text-danger'>Total Qty</th>
                                {user && user.hasAuth('PROFIT_VIEW') && <th className='text-danger'>Total Stock Price (AVG)</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((_datum, index) => (
                                <tr className='' key={index}>
                                    <td>{_datum.itemName}</td>
                                    <td>{_datum.storeQty}</td>
                                    <td>{_datum.salesQty}</td>
                                    <td>{_datum.totalQty}</td>
                                    {user && user.hasAuth('PROFIT_VIEW') && <td>{numeral(_datum.totalStockPrice).format('₦0,0.00')}</td>}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
            <div className="row">
                {user && user.hasAuth('PROFIT_VIEW') && <div className="col-12 text-center mb-3">
                    <p className="fw-bold text-primary h5">Total Stock</p>
                    <h3 className='text-danger'> {numeral(totalStock).format('₦0,0.00')} </h3>
                </div>}
            </div>
        </div>
    )
}

export default StockValuationWindow;