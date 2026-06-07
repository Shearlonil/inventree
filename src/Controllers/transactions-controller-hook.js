import { useAxiosInterceptor } from '../axios/axios-interceptors';

// https://stackoverflow.com/questions/75319009/how-to-use-hooks-within-function-in-react-js
const useTransactionsController = () => {
    const { xhrAxios } = useAxiosInterceptor();
    
    const monoTransaction = async (dtoReceipt, signal) => {
        return await xhrAxios.post(`/api/transactions/mono`, dtoReceipt, {signal});
    };
    
    const generateInvoice = async (dtoInvoice, signal) => {
        return await xhrAxios.post(`/api/transactions/invoice/generate`, dtoInvoice, {signal});
    };
    
    const generateReceipt = async (dtoReceipt, signal) => {
        return await xhrAxios.post(`/api/transactions/receipt/generate`, dtoReceipt, {signal});
    };
    
    const cancelInvoice = async (invoiceId, signal) => {
        return await xhrAxios.put(`/api/transactions/invoice/status`, null, {
            params: {
                invoiceId,
                status: false,
            }
        }, {signal});
    };
    
    const activateReceipt = async (dtoReceipt, signal) => {
        return await xhrAxios.put(`/api/transactions/receipt/status`, dtoReceipt, {
            params: {
                status: true,
            }
        }, {signal});
    };
    
    const reverseReceipt = async (dtoReceipt, signal) => {
        return await xhrAxios.put(`/api/transactions/receipt/status`, dtoReceipt, {
            params: {
                status: false,
            }
        }, {signal});
    };
    
    const activateInvoice = async (invoiceId, signal) => {
        return await xhrAxios.put(`/api/transactions/invoice/status`, null, {
            params: {
                invoiceId,
                status: true,
            }
        }, {signal});
    };
    
    const reverseInvoice = async (invoiceId, signal) => {
        return await xhrAxios.put(`/api/transactions/invoice/status`, null, {
            params: {
                invoiceId,
                status: false,
            }
        }, {signal});
    };
    
    const fetchTractItems = async (tract_id, signal) => {
        return await xhrAxios.get(`/api/items/transactions/tract`, {
            params: {
                tract_id,
            }
        }, {signal});
    };
    
    const findInvoiceForReceipt = async (invoiceId, signal) => {
        return await xhrAxios.get(`/api/transactions/invoice/incomplete`, {
            params: {
                invoiceId,
            }
        }, {signal});
    };
    
    const itemSalesReceiptsByDate = async (startDate, endDate, item_id, signal) => {
        return await xhrAxios.post(`/api/transactions/receipts/item/get-within`, { startDate, endDate }, {
            params: {
                item_id
            }
        }, {signal});
    };
    
    const customerSalesReceiptsByDate = async (startDate, endDate, customer_id, signal) => {
        return await xhrAxios.post(`/api/transactions/receipts/customer/get-within`, { startDate, endDate }, {
            params: {
                customer_id
            }
        }, {signal});
    };
    
    const pdfCustomerSalesReceiptsByDateForExport = async (startDate, endDate, customer_id, signal) => {
        return await xhrAxios.post(`/api/transactions/receipts/customer/get-within/export/pdf`, { startDate, endDate }, {
            params: {
                customer_id
            }
        }, {signal});
    };
    
    const userGeneratedSalesReceiptsByDate = async (startDate, endDate, username, signal) => {
        return await xhrAxios.post(`/api/transactions/receipts/user/${username}/get-within`, { startDate, endDate }, {signal});
    };
    
    const userGeneratedSalesReceiptsByDateForExport = async (startDate, endDate, username, signal) => {
        return await xhrAxios.post(`/api/transactions/receipts/user/${username}/get-within/export/pdf`, { startDate, endDate }, {signal});
    };
    
    const outpostSalesReceiptsByDate = async (startDate, endDate, outpost_id, signal) => {
        return await xhrAxios.post(`/api/transactions/receipts/outpost/${outpost_id}/get-within`, { startDate, endDate }, {signal});
    };
    
    const outpostSalesReceiptsByDateForExport = async (startDate, endDate, outpost_id, signal) => {
        return await xhrAxios.post(`/api/transactions/receipts/outpost/${outpost_id}/get-within/export/pdf`, { startDate, endDate }, {signal});
    };
    
    // search for sales records made by staff. used in UserSalesRecords window
    const staffSalesRecordsSummaryByDate = async (startDate, endDate, username, signal) => {
        return await xhrAxios.post(`/api/transactions/user/sales-records/${username}/get-within`, { startDate, endDate }, {signal});
    };
    
    const searchPurchaseReceiptsByDate = async (startDate, endDate, reversalStatus, signal) => {
        return await xhrAxios.post(`/api/transactions/receipts/get-within`, { startDate, endDate }, {
            params: {
                reversalStatus
            }
        }, {signal});
    };
    
    const pdfPurchaseReceiptsByDateForExport = async (startDate, endDate, reversalStatus, signal) => {
        return await xhrAxios.post(`/api/transactions/receipts/get-within/export/pdf`, { startDate, endDate }, {
            params: {
                reversalStatus
            }
        }, {signal});
    };
    
    const pdfPurchaseReceiptsByNoForExport = async (receiptId, signal) => {
        return await xhrAxios.get(`/api/transactions/receipts/get-one/export/pdf`, {
            params: {
                receiptId
            }
        }, {signal});
    };
    
    const findPurchaseReceiptByNo = async (receiptId, signal) => {
        return await xhrAxios.get(`/api/transactions/receipts/get-one`, {
            params: {
                receiptId,
            }
        }, {signal});
    };
    
    //  invoices without receipts
    const incompleteTrasactions = async (signal) => {
        return await xhrAxios.get(`/api/transactions/invoices/incomplete`, {signal});
    };
    
    const searchInvoicesByDate = async (startDate, endDate, signal) => {
        return await xhrAxios.post(`/api/transactions/invoices/get-within`, { startDate, endDate }, {signal});
    };
    
    const findInvoiceByNo = async (id, signal) => {
        return await xhrAxios.get(`/api/transactions/invoices/get-one`, {
            params: {
                id,
            }
        }, {signal});
    };
    
    const summarizeSalesRecords = async (outpost_id, startDate, endDate, signal) => {
        return await xhrAxios.post(`/api/transactions/sales/summary/${outpost_id}`, { startDate, endDate }, {signal});
    };
    
    const yearMonthlySales = async (signal) => {
        return await xhrAxios.get(`/api/transactions/sales/monthly`, {signal});
    };
    
    const updateReceiptDate = async (id, date, signal) => {
        return await xhrAxios.post(`/api/transactions/receipt/update/${id}/date`, { startDate: date, endDate: date }, {signal});
    }
    
    return {
        monoTransaction,
        generateInvoice,
        generateReceipt,
        cancelInvoice,
        activateReceipt,
        reverseReceipt,
        activateInvoice,
        reverseInvoice,
        fetchTractItems,
        findInvoiceForReceipt,
        searchPurchaseReceiptsByDate,
        itemSalesReceiptsByDate,
        customerSalesReceiptsByDate,
        pdfCustomerSalesReceiptsByDateForExport,
        userGeneratedSalesReceiptsByDate,
        userGeneratedSalesReceiptsByDateForExport,
        outpostSalesReceiptsByDate,
        outpostSalesReceiptsByDateForExport,
        staffSalesRecordsSummaryByDate,
        pdfPurchaseReceiptsByDateForExport,
        pdfPurchaseReceiptsByNoForExport,
        findPurchaseReceiptByNo,
        incompleteTrasactions,
        searchInvoicesByDate,
        findInvoiceByNo,
        summarizeSalesRecords,
        yearMonthlySales,
        updateReceiptDate,
    }
}

export default useTransactionsController;