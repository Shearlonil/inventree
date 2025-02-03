import httpService from "../axios/http-service";

const findUnverifiedStockRecById = async (stockRecId) => {
    return await httpService.get(`/api/store/stock-record`, {
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

const deleteStockRec = async (stockRecId) => {
    return await httpService.delete(`/api/store/delete/stock-rec`, {
        params: {
            stockRecId,
        }
    });
}

const exportToPDF = async (stockRecId) => {
    return await httpService.get(`/api/store/stock-record/pdf`, {
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

const unverifiedDispensary = async () => {
    return await httpService.get(`/api/store/dispensary/unverified`);
}

export default {
    findUnverifiedStockRecById,
    commitStockRecById,
    persistStockRecItem,
    restock,
    updateStockRecItem,
    deleteStockRecItem,
    deleteStockRec,
    exportToPDF,
    unverifiedStockRec,
    unverifiedDispensary,
}