import httpService from "../axios/http-service";

const monoTransaction = async (dtoReceipt) => {
    return await httpService.post(`/api/transactions/mono`, dtoReceipt);
}

export default {
    monoTransaction,
}