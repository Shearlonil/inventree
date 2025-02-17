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

export default {
    monoTransaction,
    generateInvoice,
    generateReceipt,
    cancelInvoice,
    fetchTractItems,
    findInvoiceForReceipt,
}