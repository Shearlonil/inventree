import httpService from "../axios/http-service";

const print = async (receipt) => {
    return await httpService.printerAxios.post(`/print`, receipt);
}

export default {
    print,
}
