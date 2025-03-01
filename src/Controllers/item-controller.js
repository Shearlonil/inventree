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

const rename = async (id, name) => {
    return await httpService.put(`/api/item/update`, null, {
        params: {
            name,
            id
        }
    });
}

export default {
    fetchInStockSalesItems,
    fetchOutOfStockSalesItems,
    fetchLowStockSalesItems,
    rename,
}