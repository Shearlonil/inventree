import httpService from "../axios/http-service";

//  Stock Record (New and Restock)
const findUnverifiedStockRecById = async (stockRecId) => {
    return await httpService.get(`/api/inventory/stock-record`, {
        params: {
            stockRecId,
        }
    });
}

const unverifiedStockRec = async (type) => {
    return await httpService.get(`/api/inventory/sales/unverified`, {
        params: {
            type,
        }
    });
}

const deleteStockRec = async (stockRecId) => {
    return await httpService.delete(`/api/inventory/delete/stock-rec`, {
        params: {
            stockRecId,
        }
    });
}

const commitStockRecById = async (stockRecId, outpostId, destination) => {
    return await httpService.post(`/api/inventory/commit`, {
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
    return await httpService.post(`/api/inventory/new/sales`, [item], {
        params: {
            stock_rec_id,
        }
    });
}

const restock = async (stock_rec_id, item) => {
    return await httpService.post(`/api/inventory/restock/sales`, [item], {
        params: {
            stock_rec_id,
        }
    });
}

const updateStockRecItem = async (item) => {
    return await httpService.put(`/api/inventory/update/stock-rec-item`, item, {
        params: {
            stockRecItemDetailId: item.itemDetailId,
        }
    });
}

const deleteStockRecItem = async (itemDetailId) => {
    return await httpService.delete(`/api/inventory/delete/stock-rec-item`, {
        params: {
            stockRecItemDetailId: itemDetailId,
        }
    });
}

//  DISPENSARY
const findUnverifiedDispensaryById = async (dispensaryId) => {
    return await httpService.get(`/api/inventory/id/dispensary`, {
        params: {
            dispensaryId,
        }
    });
}

const unverifiedDispensary = async () => {
    return await httpService.get(`/api/inventory/dispensary/unverified`);
}

const dispense = async (dispensaryId, outpostId) => {
    return await httpService.post(`/api/inventory/dispensary/dispense/${dispensaryId}`, null, {
        params: {
            outpostId,
        }
    });
}

const dispensary = async (dispensaryId, item) => {
    return await httpService.post(`/api/inventory/dispensary`, [item], {
        params: {
            dispensaryId,
        }
    });
}

const updateDispensedItem = async (item) => {
    return await httpService.put(`/api/inventory/dispensary/update/item`, item);
}

const deleteDispensedItemDetail = async (itemDetailId) => {
    return await httpService.delete(`/api/inventory/dispensary/delete/item`, {
        params: {
            dispensedItemDetailId: itemDetailId,
        }
    });
}

const deleteDispensary = async (dispensaryId) => {
    return await httpService.delete(`/api/inventory/delete/dispensary`, {
        params: {
            dispensaryId,
        }
    });
}

//  PURCHASES 
const changePurchasesVendor = async (dtoItem) => {
    return await httpService.post(`/api/inventory/purchases/vendor/update`, dtoItem);
}
const deletePurchasedItem = async (dtoItem) => {
    return await httpService.post(`/api/inventory/purchases/item/delete`, dtoItem);
}

const findItemPurchases = async (item_id, startDate, endDate) => {
    return await httpService.post(`/api/inventory/purchases/item/${item_id}`, { startDate, endDate });
}

const paginatePurchasesDateSearch = async (startDate, endDate, offset, pageSize) => {
    return await httpService.post(`/api/inventory/purchases`, { startDate, endDate }, {
        params: {
            offset, pageSize
        }
    });
}

const paginatePurchasesIdSearch = async (dtoItem) => {
    return await httpService.post(`/api/inventory/purchases/${id}`, dtoItem);
}

const updatePurchasedItem = async (item) => {
    return await httpService.put(`/api/inventory/purchases/item/update`, item);
}

const stockSummary = async (startDate) => {
    return await httpService.post(`/api/inventory/stock/summary`, { startDate, endDate: startDate });
};

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
    changePurchasesVendor,
    deletePurchasedItem,
    findItemPurchases,
    paginatePurchasesDateSearch,
    paginatePurchasesIdSearch,
    updatePurchasedItem,
    stockSummary
}