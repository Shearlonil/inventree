import httpService from "../axios/http-service";

const persistStockRecItem = async (stock_rec_id, item) => {
    return await httpService.post(`/api/store/new/sales`, [item], {
        params: {
            stock_rec_id,
        }
    });
}

export default {
    persistStockRecItem,
}