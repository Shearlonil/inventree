import { useAxiosInterceptor } from '../axios/axios-interceptors';

// https://stackoverflow.com/questions/75319009/how-to-use-hooks-within-function-in-react-js
const useInventoryController = () => {
    const { xhrAios } = useAxiosInterceptor();
    
    //  Stock Record (New and Restock)
    const findUnverifiedStockRecById = async (stockRecId, signal) => {
        return await xhrAios.get(`/api/inventory/stock-record`, {
            params: {
                stockRecId,
            }
        }, {signal});
    }
    
    const unverifiedStockRec = async (type, signal) => {
        return await xhrAios.get(`/api/inventory/sales/unverified`, {
            params: {
                type,
            }
        }, {signal});
    }
    
    const deleteStockRec = async (stockRecId, signal) => {
        return await xhrAios.delete(`/api/inventory/delete/stock-rec`, {
            params: {
                stockRecId,
            }
        }, {signal});
    }
    
    const commitStockRecById = async (stockRecId, outpostId, destination, signal) => {
        return await xhrAios.post(`/api/inventory/commit`, {
            id: stockRecId,
            outpost_id: outpostId
        },
        {
            params: {
                destination,
            }
        }, {signal});
    }
    
    const persistStockRecItem = async (stock_rec_id, item, signal) => {
        return await xhrAios.post(`/api/inventory/new/sales`, [item], {
            params: {
                stock_rec_id,
            }
        }, {signal});
    }
    
    const restock = async (stock_rec_id, item, signal) => {
        return await xhrAios.post(`/api/inventory/restock/sales`, [item], {
            params: {
                stock_rec_id,
            }
        }, {signal});
    }
    
    const updateStockRecItem = async (item, signal) => {
        return await xhrAios.put(`/api/inventory/update/stock-rec-item`, item, {
            params: {
                stockRecItemDetailId: item.itemDetailId,
            }
        }, {signal});
    }
    
    const deleteStockRecItem = async (itemDetailId, signal) => {
        return await xhrAios.delete(`/api/inventory/delete/stock-rec-item`, {
            params: {
                stockRecItemDetailId: itemDetailId,
            }
        }, {signal});
    }
    
    //  DISPENSARY
    const findUnverifiedDispensaryById = async (dispensaryId, signal) => {
        return await xhrAios.get(`/api/inventory/id/dispensary`, {
            params: {
                dispensaryId,
            }
        }, {signal});
    }
    
    const unverifiedDispensary = async (signal) => {
        return await xhrAios.get(`/api/inventory/dispensary/unverified`, {signal});
    }
    
    const dispense = async (dispensaryId, outpostId, signal) => {
        return await xhrAios.post(`/api/inventory/dispensary/dispense/${dispensaryId}`, null, {
            params: {
                outpostId,
            }
        }, {signal});
    }
    
    const dispensary = async (dispensaryId, item, signal) => {
        return await xhrAios.post(`/api/inventory/dispensary`, [item], {
            params: {
                dispensaryId,
            }
        }, {signal});
    }
    
    const updateDispensedItem = async (item, signal) => {
        return await xhrAios.put(`/api/inventory/dispensary/update/item`, item, {signal});
    }
    
    const deleteDispensedItemDetail = async (itemDetailId, signal) => {
        return await xhrAios.delete(`/api/inventory/dispensary/delete/item`, {
            params: {
                dispensedItemDetailId: itemDetailId,
            }
        }, {signal});
    }
    
    const deleteDispensary = async (dispensaryId, signal) => {
        return await xhrAios.delete(`/api/inventory/delete/dispensary`, {
            params: {
                dispensaryId,
            }
        }, {signal});
    }
    
    //  PURCHASES 
    const changePurchasesVendor = async (dtoItem, signal) => {
        return await xhrAios.post(`/api/inventory/purchases/vendor/update`, dtoItem, {signal});
    }

    const deletePurchasedItem = async (dtoItem, signal) => {
        return await xhrAios.post(`/api/inventory/purchases/item/delete`, dtoItem, {signal});
    }
    
    const findItemPurchases = async (item_id, startDate, endDate, signal) => {
        return await xhrAios.post(`/api/inventory/purchases/item/${item_id}`, { startDate, endDate }, {signal});
    }
    
    const paginatePurchasesDateSearch = async (startDate, endDate, offset, pageSize, signal) => {
        return await xhrAios.post(`/api/inventory/purchases`, { startDate, endDate }, {
            params: {
                offset, pageSize
            }
        }, {signal});
    }
    
    const paginatePurchasesIdSearch = async (id, signal) => {
        return await xhrAios.post(`/api/inventory/purchases/${id}`, {signal});
    }
    
    const updatePurchasedItem = async (item, signal) => {
        return await xhrAios.put(`/api/inventory/purchases/item/update`, item, {signal});
    }
    
    const ageOfStock = async (signal) => {
        return await xhrAios.get(`/api/inventory/stock-age`, {signal});
    };
    
    const expiring = async (signal) => {
        return await xhrAios.get(`/api/inventory/expiring`, {signal});
    };
    
    const stockValuation = async (startDate, tract_id, signal) => {
        return await xhrAios.post(`/api/inventory/stock/valuation/${tract_id}`, { startDate, endDate: startDate }, {signal});
    };
    
    const outpostStockValuation = async (startDate, outpost_id, tract_id, signal) => {
        return await xhrAios.post(`/api/inventory/outpost/stock/valuation/${outpost_id}`, { startDate, endDate: startDate }, {
            params: {
                tract_id
            },
        }, {signal});
    };
    
    const qtyTransfer = async (item, signal) => {
        return await xhrAios.put(`/api/inventory/journal/transfer`, item, {signal});
    }
    
    const qtyAdjustment = async (item, signal) => {
        return await xhrAios.put(`/api/inventory/journal/adjust-qty`, item, {signal});
    }
    
    const journalDateSearch = async (startDate, endDate, signal) => {
        return await xhrAios.post(`/api/inventory/journal/search/date`, { startDate, endDate }, {signal});
    };
    
    const journalItemSearch = async (item_id, signal) => {
        return await xhrAios.get(`/api/inventory/journal/search/item/${item_id}`, {signal});
    };
    
    const journalUserSearch = async (username, signal) => {
        return await xhrAios.get(`/api/inventory/journal/search/user/${username}`, {signal});
    };
    
    return {
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
        ageOfStock,
        expiring,
        stockValuation,
        outpostStockValuation,
        qtyTransfer,
        qtyAdjustment,
        journalDateSearch,
        journalItemSearch,
        journalUserSearch,
    }
}

export default useInventoryController;