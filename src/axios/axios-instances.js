import axios from 'axios';
import AppConstants from "../Utils/AppConstants";

/*  configure axios with different baseUrl.
    ref:    https://stackoverflow.com/questions/47477594/how-to-use-2-instances-of-axios-with-different-baseurl-in-the-same-app-vue-js
*/

// TODO: always check
const BACKEND_API_URL = "http://localhost:8082";
// const BACKEND_API_URL = "http://192.168.0.163:5173";
// const BACKEND_API_URL = "http://192.168.88.59:8082";

export const axiosInstance = axios.create({
    baseURL: BACKEND_API_URL,
    withCredentials: true,
});

/*  For some reasons (perhaps, because of the axios-interceptors hook), setting the authorization field in headers get intercepted by the reqInterceptor which uses reqSuccessInterceptor
    This causes the authorization field to get reset back to old token when performing the original request after refresh. A work around this bug is using another instance of axios which 
    isn't configured to get intercepted by interceptors configured in axios-interceptors. Hence, the creation of axiosRefreshInstance.
*/
export const axiosRefreshInstance = axios.create({
    baseURL: BACKEND_API_URL,
    withCredentials: true,
});

export const printerAxios = axios.create({
    baseURL: localStorage.getItem(AppConstants.printerURL)
    // baseURL: 'http://localhost:8084'
    // baseURL: 'http://192.168.0.102:8084'
});

// axios.defaults.baseURL = "http://localhost:2025";

// ref: https://stackoverflow.com/questions/43002444/make-axios-send-cookies-in-its-requests-automatically
// axios.defaults.withCredentials = true;