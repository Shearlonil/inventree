import httpService from "../axios/http-service";

//  Stock Record (New and Restock)
const findUnverifiedStockRecById = async (stockRecId) => {
    return await httpService.get(`/api/store/stock-record`, {
        params: {
            stockRecId,
        }
    });
}

const unverifiedStockRec = async (type) => {
    return await httpService.get(`/api/store/sales/unverified`, {
        params: {
            type,
        }
    });
}

const deleteStockRec = async (stockRecId) => {
    return await httpService.delete(`/api/store/delete/stock-rec`, {
        params: {
            stockRecId,
        }
    });
}

const commitStockRecById = async (stockRecId, outpostId, destination) => {
    return await httpService.post(`/api/store/commit`, {
        id: stockRecId,
        outpost_id: outpostId
    },
    {
        params: {
            destination,
        }
    });
}

const persistStockRecItem = async (stock_rec_id, item) => {
    return await httpService.post(`/api/store/new/sales`, [item], {
        params: {
            stock_rec_id,
        }
    });
}

const restock = async (stock_rec_id, item) => {
    return await httpService.post(`/api/store/restock/sales`, [item], {
        params: {
            stock_rec_id,
        }
    });
}

const updateStockRecItem = async (item) => {
    return await httpService.put(`/api/store/update/stock-rec-item`, item, {
        params: {
            stockRecItemDetailId: item.itemDetailId,
        }
    });
}

const deleteStockRecItem = async (itemDetailId) => {
    return await httpService.delete(`/api/store/delete/stock-rec-item`, {
        params: {
            stockRecItemDetailId: itemDetailId,
        }
    });
}

const pdfExport = async (stockRecId) => {
    return await httpService.get(`/api/store/stock-record/pdf`, {
        params: {
            stockRecId,
        }
    });
}

//  DISPENSARY
const findUnverifiedDispensaryById = async (dispensaryId) => {
    return await httpService.get(`/api/store/id/dispensary`, {
        params: {
            dispensaryId,
        }
    });
}

const unverifiedDispensary = async () => {
    return await httpService.get(`/api/store/dispensary/unverified`);
}

const dispense = async (dispensaryId, outpostId) => {
    return await httpService.post(`/api/store/dispensary/dispense/${dispensaryId}`, null, {
        params: {
            outpostId,
        }
    });
}

const dispensary = async (dispensaryId, item) => {
    return await httpService.post(`/api/store/dispensary`, [item], {
        params: {
            dispensaryId,
        }
    });
}

const updateDispensedItem = async (item) => {
    return await httpService.put(`/api/store/dispensary/update/item`, item);
}

const deleteDispensedItemDetail = async (itemDetailId) => {
    return await httpService.delete(`/api/store/dispensary/delete/item`, {
        params: {
            dispensedItemDetailId: itemDetailId,
        }
    });
}

const deleteDispensary = async (dispensaryId) => {
    return await httpService.delete(`/api/store/delete/dispensary`, {
        params: {
            dispensaryId,
        }
    });
}

//  PURCHASES
const paginatePurchasesDateSearch = async (startDate, endDate, offset, pageSize) => {
    return await httpService.post(`/api/store/purchases`,  { startDate, endDate }, {
        params: {
            offset, pageSize
        }
    });
}

const paginatePurchasesIdSearch = async (id, offset, pageSize) => {
    return await httpService.post(`/api/store/purchases/${id}`, null, {
        params: {
            offset, pageSize
        }
    });
}

export default {
    findUnverifiedStockRecById,
    commitStockRecById,
    persistStockRecItem,
    restock,
    updateStockRecItem,
    deleteStockRecItem,
    unverifiedStockRec,
    deleteStockRec,
    findUnverifiedDispensaryById,
    unverifiedDispensary,
    dispensary,
    dispense,
    updateDispensedItem,
    deleteDispensedItemDetail,
    deleteDispensary,
    pdfExport,
    paginatePurchasesDateSearch,
    paginatePurchasesIdSearch,
}