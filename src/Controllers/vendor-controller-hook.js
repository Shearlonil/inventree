import { useAxiosInterceptor } from '../axios/axios-interceptors';

// https://stackoverflow.com/questions/75319009/how-to-use-hooks-within-function-in-react-js
const useVendorController = () => {
    const { xhrAxios } = useAxiosInterceptor();

    const fetchAllActive = async (signal) => {
        return await xhrAxios.get(`/api/vendors/active`, {signal});
    }
    
    const fetchAllNonActive = async (signal) => {
        return await xhrAxios.get(`/api/trash/vendors`, {signal});
    }
    
    const createVendor = async (data, signal) => {
        return await xhrAxios.post(`/api/vendors/create`, data, {signal});
    }
    
    const updateVendor = async (data, signal) => {
        return await xhrAxios.put(`/api/vendors/update`, data, {signal});
    }
    
    const deleteVendor = async (id, signal) => {
        return await xhrAxios.delete(`/api/vendors/delete`, {
            params: {
                id,
            }
        }, {signal});
    }
    
    const restoreVendor = async (id, signal) => {
        return await xhrAxios.put(`/api/trash/vendors/restore`, null, {
            params: {
                id,
            }
        }, {signal});
    }
    
    return {
        fetchAllActive,
        fetchAllNonActive,
        createVendor,
        updateVendor,
        deleteVendor,
        restoreVendor,
    }
}

export default useVendorController;