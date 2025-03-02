import httpService from "../axios/http-service";

//  fetch in stock items for sales/shelf view
const fetchInStockSalesItems = async () => {
    return await httpService.get(`/api/items/sales`);
}

//  fetch out of stock items for sales/shelf view
const fetchOutOfStockSalesItems = async () => {
    return await httpService.get(`/api/items/sales/nostock`);
}

//  fetch out of stock items for sales/shelf view
const fetchLowStockSalesItems = async () => {
    return await httpService.get(`/api/items/sales/low`);
}

//  Change item status to false: delete mode
const deleteItem = async (id) => {
    return await httpService.delete(`/api/items/status/change`, {
        params: {
            id
        }
    });
}

//  Change item status to false: delete mode
const changeTract = async (id, tractId) => {
    return await httpService.put(`/api/items/tracts/change/${id}`, null, {
        params: {
            tractId
        }
    });
}

const changePkg = async (id, pkgId) => {
    return await httpService.put(`/api/items/pkg/change/${id}`, null, {
        params: {
            pkgId
        }
    });
}

export default {
    fetchInStockSalesItems,
    fetchOutOfStockSalesItems,
    fetchLowStockSalesItems,
    deleteItem,
    changeTract,
    changePkg,
}