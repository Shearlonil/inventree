import httpService from "../axios/http-service";

const monoTransaction = async (dtoReceipt) => {
    return await httpService.post(`/api/transactions/mono`, dtoReceipt);
}

const generateInvoice = async (dtoInvoice) => {
    return await httpService.post(`/api/transactions/invoice/generate`, dtoInvoice);
}

const generateReceipt = async (dtoReceipt) => {
    return await httpService.post(`/api/transactions/receipt/generate`, dtoReceipt);
}

const cancelInvoice = async (invoiceId) => {
    return await httpService.put(`/api/transactions/invoice/status`, null, {
        params: {
            invoiceId,
            status: false,
        }
    });
}

const activateReceipt = async (dtoReceipt) => {
    return await httpService.put(`/api/transactions/receipt/status`, dtoReceipt, {
        params: {
            status: true,
        }
    });
}

const reverseReceipt = async (dtoReceipt) => {
    return await httpService.put(`/api/transactions/receipt/status`, dtoReceipt, {
        params: {
            status: false,
        }
    });
}

const fetchTractItems = async (tract_id) => {
    return await httpService.get(`/api/items/transactions/tract`, {
        params: {
            tract_id,
        }
    });
}

const findInvoiceForReceipt = async (invoiceId) => {
    return await httpService.get(`/api/transactions/invoice/incomplete`, {
        params: {
            invoiceId,
        }
    });
}

const searchPurchaseReceiptByDate = async (startDate, endDate) => {
    return await httpService.post(`/api/transactions/receipts/get-within`, { startDate, endDate });
}

const searchPurchaseReceiptByDatee = async (startDate, endDate) => {
    return await httpService.post(`/api/transactions/receipts/get-withinn`, { startDate, endDate });
}

const findPurchaseReceiptByNo = async (receiptId) => {
    return await httpService.get(`/api/transactions/receipts/get-one`, {
        params: {
            receiptId,
        }
    });
}


export default {
    monoTransaction,
    generateInvoice,
    generateReceipt,
    cancelInvoice,
    activateReceipt,
    reverseReceipt,
    fetchTractItems,
    findInvoiceForReceipt,
    searchPurchaseReceiptByDate,
    searchPurchaseReceiptByDatee,
    findPurchaseReceiptByNo,
}