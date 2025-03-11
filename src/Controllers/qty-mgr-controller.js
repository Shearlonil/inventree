import httpService from "../axios/http-service";

//  find items qty mgr for sales
const findItemSalesQtyMgr = async (itemId) => {
    return await httpService.get(`/api/qtymgrs/sales/${itemId}`, {
        params: {
            itemId
        }
    });
}

//  find items qty mgr for store
const findItemStoreQtyMgr = async (itemId) => {
    return await httpService.get(`/api/qtymgrs/store/${itemId}`, {
        params: {
            itemId
        }
    });
}

//  update outpost sales qty from sales qty mgr view window
const updateQtyMgr = async (qtyMgr) => {
    return await httpService.put(`/api/qtymgrs/update/sales`, qtyMgr);
}

//  update outpost sales qty from sales qty mgr view window
const updateOutpostSalesQty = async (dtoOutpostSalesQty) => {
    return await httpService.put(`/api/qtymgrs/update/outpost-sales-qty`, dtoOutpostSalesQty);
}

//  update outpost sales qty from sales qty mgr view window
const deleteOutpostSalesQty = async (outpostSalesQtyId, qtyMgrId) => {
    return await httpService.delete(`/api/qtymgrs/delete/outpost-sales-qty`, {
        params: {
            outpostSalesQtyId,
            qtyMgrId
        }
    });
}


export default {
    findItemSalesQtyMgr,
    findItemStoreQtyMgr,
    updateQtyMgr,
    updateOutpostSalesQty,
    deleteOutpostSalesQty,
}