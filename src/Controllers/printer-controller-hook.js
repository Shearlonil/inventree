import AppConstants from "../Utils/AppConstants";
import { useAxiosInterceptor } from '../axios/axios-interceptors';

// https://stackoverflow.com/questions/75319009/how-to-use-hooks-within-function-in-react-js
const usePrinterController = () => {
    const { printerAxios } = useAxiosInterceptor();

    const print = async (receipt, signal) => {
        return await printerAxios.post(`/print/${localStorage.getItem(AppConstants.printerName)}`, receipt, {signal});
    }
    
    return {
        print,
    }
}

export default usePrinterController;