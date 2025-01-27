import axios from "axios";
import Cookies from "js-cookie";

axios.defaults.baseURL = "http://inventree.localhost:8082";

// ref: https://stackoverflow.com/questions/43002444/make-axios-send-cookies-in-its-requests-automatically
axios.defaults.withCredentials = true;

axios.interceptors.response.use(null, (error) => {
    const expectedError =
        error.response &&
        error.response.status >= 400 &&
        error.response.status < 600;

    if (!expectedError) {
        error.response = {
            data: {
                message: error.message ? error.message : "An unexpected Error occured",
            },
        };
    }
    return Promise.reject(error);
});

axios.interceptors.request.use((config) => {
    const token = Cookies.get("authorization");
    config.headers.authorization = token ? `Bearer ${token}` : "";
    return config;
});

function baseURL() {
    return axios.defaults.baseURL;
}

//  convert a string url to axios get. Useful when trying to perform axios.all request
function getMapping(urls) {
    return urls.map((url) => axios.get(url));
}

//  convert a string url to axios post. Useful when trying to perform axios.all request
function postMapping(urls, data) {
    return urls.map((url) => axios.post(url, data));
}

//  convert a string url to axios put. Useful when trying to perform axios.all request
function putMapping(urls, withCatch = true) {
    return urls.map((url) => axios.put(url));
}

function download(url) {
    return axios.get(url, {
        responseType: "blob",
    });
}

export default {
    get: axios.get,
    post: axios.post,
    put: axios.put,
    delete: axios.delete,
    all: axios.all,
    getMapping,
    putMapping,
    postMapping,
    download,
    baseURL,
};
