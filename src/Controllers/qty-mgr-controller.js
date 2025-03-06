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

export default {
    findItemSalesQtyMgr,
    findItemStoreQtyMgr,
}