import { useAxiosInterceptor } from '../axios/axios-interceptors';

// https://stackoverflow.com/questions/75319009/how-to-use-hooks-within-function-in-react-js
const useItemController = () => {
    const { xhrAxios } = useAxiosInterceptor();
    
    //  fetch in stock items for sales/shelf view
    const findById = async (id, signal) => {
        return await xhrAxios.get(`/api/items/find`, {
            params: {
                id
            }
        }, {signal});
    }
    
    const findItemsForMonoTransaction = async (id, signal) => {
        return await xhrAxios.get(`/api/items/transactions/mono`, {signal});
    }
    
    /*  fetch all active gross items for gross view (this includes items with 0 sales/store quantities. As long as the item is active. It is fetched 
        irrespective of the quantity)*/
    const fetchActiveGrossItems = async (signal) => {
        return await xhrAxios.get(`/api/items/gross/all`, {signal});
    }
    
    //  fetch in stock items for sales/shelf view
    const fetchInStockSalesItems = async (signal) => {
        return await xhrAxios.get(`/api/items/sales`, {signal});
    }
    
    //  fetch in stock items for store view
    const fetchInStockStoreItems = async (signal) => {
        return await xhrAxios.get(`/api/items/store`, {signal});
    }
    
    //  fetch in stock gross items for gross view
    const fetchInStockGrossItems = async (signal) => {
        return await xhrAxios.get(`/api/items/gross/stock`, {signal});
    }
    
    //  fetch out of stock items for sales/shelf view
    const fetchOutOfStockSalesItems = async (signal) => {
        return await xhrAxios.get(`/api/items/sales/nostock`, {signal});
    }
    
    //  fetch out of stock items for store view
    const fetchOutOfStockStoreItems = async (signal) => {
        return await xhrAxios.get(`/api/items/store/nostock`, {signal});
    }
    
    //  fetch out of stock gross items for gross view
    const fetchOutOfStockGrossItems = async (signal) => {
        return await xhrAxios.get(`/api/items/gross/nostock`, {signal});
    }
    
    //  fetch out of stock items for sales/shelf view
    const fetchLowStockSalesItems = async (signal) => {
        return await xhrAxios.get(`/api/items/sales/low`, {signal});
    }
    
    //  fetch out of stock items for store view
    const fetchLowStockStoreItems = async (signal) => {
        return await xhrAxios.get(`/api/items/store/low`, {signal});
    }
    
    //  fetch out of stock items for store view
    const fetchLowStockGrossItems = async (signal) => {
        return await xhrAxios.get(`/api/items/gross/low`, {signal});
    }
    
    //  Change item status to false: delete mode
    const deleteItem = async (id, signal) => {
        return await xhrAxios.delete(`/api/items/status/change`, {
            params: {
                id
            }
        }, {signal});
    }
    
    //  Change item status to true: restore mode
    const restoreItem = async (id, signal) => {
        return await xhrAxios.put(`/api/trash/items/restore`, null, {
            params: {
                id
            }
        }, {signal});
    }
    
    //  Change item status to false: delete mode
    const updateItem = async (item, signal) => {
        return await xhrAxios.put(`/api/items/update`, item, {signal});
    }
    
    //  Change item status to false: delete mode
    const changeTract = async (id, tractId, signal) => {
        return await xhrAxios.put(`/api/items/tracts/change/${id}`, null, {
            params: {
                tractId
            }
        }, {signal});
    }
    
    const fetchTrashedItems = async (signal) => {
        return await xhrAxios.get(`/api/trash/items`, {signal});
    }
    
    const changePkg = async (id, pkgId, signal) => {
        return await xhrAxios.put(`/api/items/pkg/change/${id}`, null, {
            params: {
                pkgId
            }
        }, {signal});
    }
    
    return {
        findById,
        findItemsForMonoTransaction,
        fetchActiveGrossItems,
        fetchInStockSalesItems,
        fetchInStockStoreItems,
        fetchInStockGrossItems,
        fetchOutOfStockSalesItems,
        fetchOutOfStockStoreItems,
        fetchOutOfStockGrossItems,
        fetchLowStockSalesItems,
        fetchLowStockStoreItems,
        fetchLowStockGrossItems,
        deleteItem,
        restoreItem,
        updateItem,
        changeTract,
        fetchTrashedItems,
        changePkg,
    }
}

export default useItemController;