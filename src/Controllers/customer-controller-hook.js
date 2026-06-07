import { useAxiosInterceptor } from '../axios/axios-interceptors';

// https://stackoverflow.com/questions/75319009/how-to-use-hooks-within-function-in-react-js
const useCustomerController = () => {
    const { xhrAxios } = useAxiosInterceptor();

    const fetchAllActive = async (signal) => {
        return await xhrAxios.get(`/api/customers/active`, {signal});
    }

    const fetchAllNonActive = async (signal) => {
        return await xhrAxios.get(`/api/trash/customers`, {signal});
    }

    const createCustomer = async (data, signal) => {
        return await xhrAxios.post(`/api/customers/create`, data, {signal});
    }

    const updateCustomer = async (data, signal) => {
        return await xhrAxios.put(`/api/customers/update`, data, {signal});
    }

    const deleteCustomer = async (id, signal) => {
        return await xhrAxios.delete(`/api/customers/delete`, {
            params: {
                id,
            }
        }, {signal});
    }

    const restoreCustomer = async (id, signal) => {
        return await xhrAxios.put(`/api/trash/customers/restore`, null, {
            params: {
                id,
            }
        }, {signal});
    }

    return {
        fetchAllActive,
        fetchAllNonActive,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        restoreCustomer,
    }
}

export default useCustomerController;