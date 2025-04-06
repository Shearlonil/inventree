import httpService from "../axios/http-service";

//  fetch in stock items for sales/shelf view
const findById = async (id) => {
    return await httpService.get(`/api/items/find`, {
        params: {
            id
        }
    });
}

//  fetch in stock items for sales/shelf view
const fetchInStockSalesItems = async () => {
    return await httpService.get(`/api/items/sales`);
}

//  fetch in stock items for store view
const fetchInStockStoreItems = async () => {
    return await httpService.get(`/api/items/store`);
}

//  fetch in stock gross items for gross view
const fetchInStockGrossItems = async () => {
    return await httpService.get(`/api/items/gross`);
}

//  fetch out of stock items for sales/shelf view
const fetchOutOfStockSalesItems = async () => {
    return await httpService.get(`/api/items/sales/nostock`);
}

//  fetch out of stock items for store view
const fetchOutOfStockStoreItems = async () => {
    return await httpService.get(`/api/items/store/nostock`);
}

//  fetch out of stock gross items for gross view
const fetchOutOfStockGrossItems = async () => {
    return await httpService.get(`/api/items/gross/nostock`);
}

//  fetch out of stock items for sales/shelf view
const fetchLowStockSalesItems = async () => {
    return await httpService.get(`/api/items/sales/low`);
}

//  fetch out of stock items for store view
const fetchLowStockStoreItems = async () => {
    return await httpService.get(`/api/items/store/low`);
}

//  fetch out of stock items for store view
const fetchLowStockGrossItems = async () => {
    return await httpService.get(`/api/items/gross/low`);
}

//  Change item status to false: delete mode
const deleteItem = async (id) => {
    return await httpService.delete(`/api/items/status/change`, {
        params: {
            id
        }
    });
}

//  Change item status to true: restore mode
const restoreItem = async (id) => {
    return await httpService.put(`/api/trash/items/restore`, null, {
        params: {
            id
        }
    });
}

//  Change item status to false: delete mode
const updateItem = async (item) => {
    return await httpService.put(`/api/items/update`, item);
}

//  Change item status to false: delete mode
const changeTract = async (id, tractId) => {
    return await httpService.put(`/api/items/tracts/change/${id}`, null, {
        params: {
            tractId
        }
    });
}

const fetchTrashedItems = async () => {
    return await httpService.get(`/api/trash/items`);
}

const changePkg = async (id, pkgId) => {
    return await httpService.put(`/api/items/pkg/change/${id}`, null, {
        params: {
            pkgId
        }
    });
}

export default {
    findById,
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