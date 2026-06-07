import { useAxiosInterceptor } from '../axios/axios-interceptors';

// https://stackoverflow.com/questions/75319009/how-to-use-hooks-within-function-in-react-js
const useGenericController = () => {
    const { xhrAxios } = useAxiosInterceptor();

    function download(url) {
        return xhrAxios.get(url, {
            responseType: "blob",
        });
    }
    
    async function performGetRequests(urls, signal) {
        // axios.all() marked as deprecated, way forward is Promise.all();
        return await Promise.all(urls.map((url) => xhrAxios.get(url, { signal })));
    }
    
    async function get(url, signal) {
        // axios.all() marked as deprecated, way forward is Promise.all();
        return await xhrAxios.get(`${url}`, {signal});
    }
    
    const paramGet = async (url, params, signal) => {
        return await xhrAxios.get(`${url}`, { params }, {signal});
    }
    
    async function post(url, data, signal) {
        // axios.all() marked as deprecated, way forward is Promise.all();
        return await xhrAxios.post(`${url}`, data, {signal});
    }

    async function performRequests(axiosReqs) {
        /*  
            ref: https://blog.logrocket.com/using-axios-all-make-concurrent-requests/
            To use this method, set axiosReqs like below:
        
            const requestOne = axios.get('https://api.example.com/data1');
            const requestTwo = axios.post('https://api.example.com/data2', { payload: 'some_data' });
            const requestThree = axios.get('https://api.example.com/data3');

            then call like:
            await performRequests([requestOne, requestTwo, requestThree])

            Example below:
            Promise.all([requestOne, requestTwo, requestThree])
            .then((responses) => {
                // responses is an array containing the responses from each request in order
                const responseOne = responses[0].data;
                const responseTwo = responses[1].data;
                const responseThree = responses[2].data;

                console.log('Response from request one:', responseOne);
                console.log('Response from request two:', responseTwo);
                console.log('Response from request three:', responseThree);
            })
            .catch((error) => {
                console.error('One or more requests failed:', error);
            });
        */
        return await Promise.all(axiosReqs);
    }
    
    async function requestOTP(email, signal){
        await xhrAxios.post(`/auth/otp/${email}`, {signal})
    }
    
    const getAxios = () => {
        return xhrAxios;
    }
    
    return {
        getAxios,
        download,
        get,
        paramGet,
        post,
        performGetRequests,
        performRequests,
        requestOTP,
    }
}

export default useGenericController;