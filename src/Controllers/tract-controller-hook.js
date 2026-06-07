import { useAxiosInterceptor } from '../axios/axios-interceptors';

// https://stackoverflow.com/questions/75319009/how-to-use-hooks-within-function-in-react-js
const useTractController = () => {
    const { xhrAxios } = useAxiosInterceptor();

    const fetchAllActive = async (signal) => {
        return await xhrAxios.get(`/api/tracts/active`, {signal});
    }
    
    const fetchTractItems = async (tractName, signal) => {
        return await xhrAxios.get(`/api/tracts/${tractName}/items/active`, {signal});
    }
    
    const fetchActiveTractItems = async (tractName, signal) => {
        return await xhrAxios.get(`/api/tracts/${tractName}/items/active`, {signal});
    }
    
    const create = async (name, signal) => {
        return await xhrAxios.post(`/api/tracts/create`, null, {
            params: {
                name,
            }
        }, {signal});
    }
    
    const rename = async (id, name, signal) => {
        return await xhrAxios.put(`/api/tracts/update`, null, {
            params: {
                name,
                id
            }
        }, {signal});
    }
    
    const deleteTract = async (id, destination, signal) => {
        return await xhrAxios.delete(`/api/tracts/delete`, {
            params: {
                destination,
                id
            }
        }, {signal});
    }
    
    return {
        fetchAllActive,
        fetchTractItems,
        fetchActiveTractItems,
        create,
        rename,
        deleteTract,
    }
}

export default useTractController;