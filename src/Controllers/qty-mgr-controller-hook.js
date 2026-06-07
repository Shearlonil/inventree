import { useAxiosInterceptor } from '../axios/axios-interceptors';

// https://stackoverflow.com/questions/75319009/how-to-use-hooks-within-function-in-react-js
const useQtyMgrController = () => {
    const { xhrAxios } = useAxiosInterceptor();

    //  find items qty mgr for sales
    const findItemSalesQtyMgr = async (itemId, signal) => {
        return await xhrAxios.get(`/api/qtymgrs/sales/${itemId}`, {
            params: {
                itemId
            }
        }, {signal});
    }
    
    //  find items qty mgr for store
    const findItemStoreQtyMgr = async (itemId, signal) => {
        return await xhrAxios.get(`/api/qtymgrs/store/${itemId}`, {
            params: {
                itemId
            }
        }, {signal});
    }
    
    //  update outpost sales qty from sales qty mgr view window
    const updateSalesQtyMgr = async (qtyMgr, signal) => {
        return await xhrAxios.put(`/api/qtymgrs/update/sales`, qtyMgr, {signal});
    }
    
    //  update outpost sales qty from sales qty mgr view window
    const updateStoreQtyMgr = async (qtyMgr, signal) => {
        return await xhrAxios.put(`/api/qtymgrs/update/store`, qtyMgr, {signal});
    }
    
    //  update outpost sales qty from sales qty mgr view window
    const updateOutpostSalesQty = async (dtoOutpostSalesQty, signal) => {
        return await xhrAxios.put(`/api/qtymgrs/update/outpost-sales-qty`, dtoOutpostSalesQty, {signal});
    }
    
    //  update outpost sales qty from sales qty mgr view window
    const deleteOutpostSalesQty = async (outpostSalesQtyId, qtyMgrId, signal) => {
        return await xhrAxios.delete(`/api/qtymgrs/delete/outpost-sales-qty`, {
            params: {
                outpostSalesQtyId,
                qtyMgrId
            }
        }, {signal});
    }
    
    
    return {
        findItemSalesQtyMgr,
        findItemStoreQtyMgr,
        updateSalesQtyMgr,
        updateStoreQtyMgr,
        updateOutpostSalesQty,
        deleteOutpostSalesQty,
    }
}

export default useQtyMgrController;