import { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { object, date, ref } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import numeral from 'numeral';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { applyPlugin, autoTable } from 'jspdf-autotable'
import { format } from 'date-fns';

import SVG from '../../assets/Svg';
import OffcanvasMenu from '../../Components/OffcanvasMenu';
import { useAuth } from '../../app-context/auth-user-context';
import handleErrMsg from '../../Utils/error-handler';
import transactionsController from '../../Controllers/transactions-controller';
import itemController from '../../Controllers/item-controller';
import { ReceiptSalesItem } from '../../Entities/DocExport/ReceiptSalesItem';
import EntityStartEndDateSearch from '../../Components/EntityStartEndDate';

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
        control,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema)
    });
    
    const startDate = watch("startDate");

    const offCanvasMenu = [
        { label: "Export to PDF", onClickParams: {evtName: 'pdfExport'} },
        { label: "Export to Excel", onClickParams: {evtName: 'xlsExport'} },
    ];
        
    const [networkRequest, setNetworkRequest] = useState(false);
    const [data, setData] = useState([]);

    const [itemOptions, setItemOptions] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(true);
    
    const [filename, setFilename] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalAvgSalesPrice, setTotalAvgSalesPrice] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
        
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

        const title = `Sales Record ${format(new Date(start), "dd/MM/yyyy")} - ${format(new Date(end), "dd/MM/yyyy")}`;

        doc.text(title, marginLeft, 40);

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
        doc.text(`Total Amount: ${numeral(totalAmount).format('₦0,0.00')} | Total Profit: ${numeral(totalProfit).format('₦0,0.00')}`, 
            marginLeft, doc.lastAutoTable.finalY + 40);
        
        doc.save(`${filename}` + fileExtension);
    }

    const fnSearch = async (data) => {
        /*  Setting start date to 1 instead of 0 to avoid story that touch (1 hour lag from front end, causing a previous date with 23 hour). Time
            isn't important here from front end as the time will be set by Java on the backend. Only date is important  */
        try {
            if (data.startDate && data.endDate) {
                setNetworkRequest(true);
                setData([]);
                setTotalProfit(0);
                setTotalAmount(0);
                setTotalAvgSalesPrice(0);
                setStart(data.startDate);
                setEnd(data.endDate);

                //  Time isn't important here (Java will set the time to 23:59:59). Just setting to 12hr to avoid 1hr lag
                const startDate = format(data.startDate, "yyyy-MM-dd") + "T12:00:00.000Z";
                const endDate = format(data.endDate, "yyyy-MM-dd") + "T12:00:00.000Z";

                setFilename(
                    `sales_summary_${data.entity.value.itemName}_${format(new Date(data.startDate), "dd/MM/yyyy")} - ${format(new Date(data.endDate), "dd/MM/yyyy")}`
                );

                const response = await transactionsController.itemSalesReceiptsByDate(startDate, endDate, data.entity.value.id);
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
                            salesRecord.qtyPerPkg = item.qty_per_package;
                            salesRecord.stockPrice = item.unit_stock;
                            salesRecord.price = item.price;
                            
                            arr.push(salesRecord);
                        });
                    }
                    
                    let tempSalesPrice = numeral(0);
                    let tempStockPrice = numeral(0);
                    let tempQty = numeral(0);
                    let tempTotalAmount = numeral(0);
                    
                    arr.forEach(item => {
                        tempTotalAmount = numeral(tempTotalAmount).add(item.totalAmount);
                        tempSalesPrice = numeral(tempSalesPrice).add(item.unitSalesPrice);
                        tempStockPrice = numeral(tempStockPrice).add(numeral(item.unitStockPrice).value());
                        tempQty = numeral(tempQty).add(item.unitQty);
                    });

                    const avgUnitSalesPrice = numeral(tempSalesPrice).divide(arr.length).format('₦0,0.00');
                    const avgUnitStockPrice = numeral(tempStockPrice).divide(arr.length).format('₦0,0.00');
                    const totalAvgStockPrice = numeral(tempQty).multiply(numeral(avgUnitStockPrice).value()).value();
                    const totalAvgSalesPrice =  numeral(tempQty).multiply(numeral(avgUnitSalesPrice).value()).value();
                    
                    setTotalProfit(numeral(totalAvgSalesPrice).subtract(totalAvgStockPrice).value());
                    setTotalAmount(tempTotalAmount);
                    setTotalAvgSalesPrice(totalAvgSalesPrice);
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
                    return fnSearch(data);
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
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Item Sales Record</span>
                        <img src={SVG.report_colored} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    Generate sales report for a particular item with custom dates and export to Excel/PDF and also monitor stock levels
                </span>
            </div>

            <EntityStartEndDateSearch networkRequest={networkRequest} fnSearch={fnSearch} entityOptions={itemOptions} entityLoading={itemsLoading} 
                entityString={"Item"} />
            
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
                                    <td>
                                        <Link to={`/items/sales-record/receipt/${_datum.id}/view`}>
                                            {_datum.id}
                                        </Link>
                                    </td>
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
            <div className="row">
                <div className="col-md-4 col-sm-12 text-center mb-3">
                    <p className="fw-bold text-primary h5">Total Cash</p>
                    <h3 className='text-danger'> {numeral(totalAmount).format('₦0,0.00')} </h3>
                </div>
                <div className="col-md-4 col-sm-12 text-center mb-3">
                    <p className="fw-bold text-primary h5">Total Sales Price (AVG)</p>
                    <h3 className='text-danger'> {numeral(totalAvgSalesPrice).format('₦0,0.00')} </h3>
                </div>
                {user.hasAuth('PROFIT_VIEW') && <div className="col-md-4 col-sm-12 text-center mb-3">
                    <p className="fw-bold text-primary h5">Total Profit</p>
                    <h3 className='text-danger'> {numeral(totalProfit).format('₦0,0.00')} </h3>
                </div>}
            </div>
        </div>
    )
}

export default ItemSalesReceiptWindow;