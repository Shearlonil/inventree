import { useAxiosInterceptor } from '../axios/axios-interceptors';

// https://stackoverflow.com/questions/75319009/how-to-use-hooks-within-function-in-react-js
const usePkgController = () => {
    const { xhrAxios } = useAxiosInterceptor();

    const fetchAllActive = async (signal) => {
        return await xhrAxios.get(`/api/pkg/active`, {signal});
    }
    
    const fetchPkgItems = async (tractName, signal) => {
        return await xhrAxios.get(`/api/pkg/${tractName}/items`, {signal});
    }
    
    const create = async (name, signal) => {
        return await xhrAxios.post(`/api/pkg/create`, null, {
            params: {
                name,
            }
        });
    }
    
    const rename = async (id, name, signal) => {
        return await xhrAxios.put(`/api/pkg/update`, null, {
            params: {
                name,
                id
            }
        }, {signal});
    }
    
    const deletePkg = async (id, destination, signal) => {
        return await xhrAxios.delete(`/api/pkg/delete`, {
            params: {
                destination,
                id
            }
        }, {signal});
    }
    
    return {
        fetchAllActive,
        fetchPkgItems,
        create,
        rename,
        deletePkg,
    }
}

export default usePkgController;