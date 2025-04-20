import httpService from "../axios/http-service";
import AppConstants from "../Utils/AppConstants";

const print = async (receipt) => {
    return await httpService.printerAxios.post(`/print/${localStorage.getItem(AppConstants.printerName)}`, receipt);
}

export default {
    print,
}
