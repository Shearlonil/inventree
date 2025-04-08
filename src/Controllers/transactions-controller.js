import httpService from "../axios/http-service";

const monoTransaction = async (dtoReceipt) => {
    return await httpService.post(`/api/transactions/mono`, dtoReceipt);
};

const generateInvoice = async (dtoInvoice) => {
    return await httpService.post(`/api/transactions/invoice/generate`, dtoInvoice);
};

const generateReceipt = async (dtoReceipt) => {
    return await httpService.post(`/api/transactions/receipt/generate`, dtoReceipt);
};

const cancelInvoice = async (invoiceId) => {
    return await httpService.put(`/api/transactions/invoice/status`, null, {
        params: {
            invoiceId,
            status: false,
        }
    });
};

const activateReceipt = async (dtoReceipt) => {
    return await httpService.put(`/api/transactions/receipt/status`, dtoReceipt, {
        params: {
            status: true,
        }
    });
};

const reverseReceipt = async (dtoReceipt) => {
    return await httpService.put(`/api/transactions/receipt/status`, dtoReceipt, {
        params: {
            status: false,
        }
    });
};

const activateInvoice = async (invoiceId) => {
    return await httpService.put(`/api/transactions/invoice/status`, null, {
        params: {
            invoiceId,
            status: true,
        }
    });
};

const reverseInvoice = async (invoiceId) => {
    return await httpService.put(`/api/transactions/invoice/status`, null, {
        params: {
            invoiceId,
            status: false,
        }
    });
};

const fetchTractItems = async (tract_id) => {
    return await httpService.get(`/api/items/transactions/tract`, {
        params: {
            tract_id,
        }
    });
};

const findInvoiceForReceipt = async (invoiceId) => {
    return await httpService.get(`/api/transactions/invoice/incomplete`, {
        params: {
            invoiceId,
        }
    });
};

const itemSalesReceiptsByDate = async (startDate, endDate, item_id) => {
    return await httpService.post(`/api/transactions/receipts/item/get-within`, { startDate, endDate }, {
        params: {
            item_id
        }
    });
};

const customerSalesReceiptsByDate = async (startDate, endDate, item_id) => {
    return await httpService.post(`/api/transactions/receipts/customer/get-within`, { startDate, endDate }, {
        params: {
            item_id
        }
    });
};

const searchPurchaseReceiptsByDate = async (startDate, endDate, reversalStatus) => {
    return await httpService.post(`/api/transactions/receipts/get-within`, { startDate, endDate }, {
        params: {
            reversalStatus
        }
    });
};

const pdfPurchaseReceiptsByDateForExport = async (startDate, endDate, reversalStatus) => {
    return await httpService.post(`/api/transactions/receipts/get-within/export/pdf`, { startDate, endDate }, {
        params: {
            reversalStatus
        }
    });
};

const pdfPurchaseReceiptsByNoForExport = async (receiptId) => {
    return await httpService.get(`/api/transactions/receipts/get-one/export/pdf`, {
        params: {
            receiptId
        }
    });
};

const findPurchaseReceiptByNo = async (receiptId) => {
    return await httpService.get(`/api/transactions/receipts/get-one`, {
        params: {
            receiptId,
        }
    });
};

const searchInvoicesByDate = async (startDate, endDate) => {
    return await httpService.post(`/api/transactions/invoices/get-within`, { startDate, endDate });
};

const findInvoiceByNo = async (id) => {
    return await httpService.get(`/api/transactions/invoices/get-one`, {
        params: {
            id,
        }
    });
};

const summarizeSalesRecords = async (startDate, endDate) => {
    return await httpService.post(`/api/transactions/sales/summary`, { startDate, endDate });
};

export default {
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
    pdfPurchaseReceiptsByDateForExport,
    pdfPurchaseReceiptsByNoForExport,
    findPurchaseReceiptByNo,
    searchInvoicesByDate,
    findInvoiceByNo,
    summarizeSalesRecords,
}