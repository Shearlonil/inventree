import httpService from "../axios/http-service";

const findUnverifiedStockRecById = async (stockRecId) => {
    return await httpService.get(`/api/store/stock-record`, {
        params: {
            stockRecId,
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

const unverifiedStockRec = async (type) => {
    return await httpService.get(`/api/store/sales/unverified`, {
        params: {
            type,
        }
    });
}

const ongoingDispensary = async () => {
    return await httpService.get(`/api/store/update/stock-rec-item`, item, {
        params: {
            stockRecItemDetailId: item.itemDetailId,
        }
    });
}

export default {
    findUnverifiedStockRecById,
    persistStockRecItem,
    updateStockRecItem,
    deleteStockRecItem,
    deleteStockRec,
    unverifiedStockRec,
    ongoingDispensary,
}