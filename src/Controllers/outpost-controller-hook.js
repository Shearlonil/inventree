import { useAxiosInterceptor } from '../axios/axios-interceptors';

// https://stackoverflow.com/questions/75319009/how-to-use-hooks-within-function-in-react-js
const useOutpostController = () => {
    const { xhrAxios } = useAxiosInterceptor();
    
    const findAllActive = async (signal) => {
        return await xhrAxios.get(`/api/outposts/active`, {signal});
    }
    
    const findById = async (id, signal) => {
        return await xhrAxios.get(`/api/outposts/find`, {
            params: {
                id,
            }
        }, {signal});
    }
    
    const trashedOutpost = async (signal) => {
        return await xhrAxios.get(`/api/trash/outposts`, {signal});
    }
    
    const create = async (name, signal) => {
        return await xhrAxios.post(`/api/outposts/create`, null, {
            params: {
                name,
            }
        }, {signal});
    }
    
    const deleteOutpost = async (id, destination, signal) => {
        return await xhrAxios.delete(`/api/outposts/delete`, {
            params: {
                destination,
                id
            }
        }, {signal});
    }
    
    const restoreOutpost = async (id, signal) => {
        return await xhrAxios.put(`/api/trash/outposts/restore`, null, {
            params: {
                id,
            }
        }, {signal});
    }
    
    const rename = async (id, name, signal) => {
        return await xhrAxios.put(`/api/outposts/update`, null, {
            params: {
                name,
                id
            }
        }, {signal});
    }
    
    const findAll = async (signal) => {
        return await xhrAxios.get(`/api/outposts/all`, {signal});
    }
    
    return {
        findAll,
        findAllActive,
        findById,
        trashedOutpost,
        create,
        deleteOutpost,
        restoreOutpost,
        rename,
    }

}

export default useOutpostController;