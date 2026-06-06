import { useAxiosInterceptor } from '../axios/axios-interceptors';

// https://stackoverflow.com/questions/75319009/how-to-use-hooks-within-function-in-react-js
const useFinanceController = () => {
    const { xhrAios } = useAxiosInterceptor();
    
    const findLedgerVch = async (id, signal) => {
        return await xhrAios.get(`/api/finance/voucher/find/${id}`, {signal});
    }
    
    const createVoucher = async (dtoTransactions, signal) => {
        return await xhrAios.post(`/api/finance/voucher/create`, dtoTransactions, {signal});
    }
    
    const tradingAcc = async (startDate, endDate, signal) => {
        return await xhrAios.post(`/api/finance/trading-acc`, { startDate, endDate }, {signal});
    }
    
    const profitLossAcc = async (startDate, endDate, signal) => {
        return await xhrAios.post(`/api/finance/profit-loss`, { startDate, endDate }, {signal});
    }
    
    const balSheet = async (startDate, endDate, signal) => {
        return await xhrAios.post(`/api/finance/bal-sheet`, { startDate, endDate }, {signal});
    }
    
    const trialBal = async (startDate, endDate, signal) => {
        return await xhrAios.post(`/api/finance/trial-bal`, { startDate, endDate }, {signal});
    }
    
    const getIncomeExpVoucherDetails = async (name, startDate, endDate, signal) => {
        return await xhrAios.post(`/api/finance/voucher/income-exp/${name}`, { startDate, endDate }, {signal});
    }
    
    const createIncomeExpVoucher = async (dtoTransaction, signal) => {
        return await xhrAios.post(`/api/finance/voucher/income-exp/create`, dtoTransaction, {signal});
    }
    
    const updateIncomeExpVoucher = async (dtoTransaction, signal) => {
        return await xhrAios.post(`/api/finance/voucher/income-exp/update`, dtoTransaction, {signal});
    }
    
    const deleteIncomeExpVoucher = async (dtoTransaction, signal) => {
        return await xhrAios.post(`/api/finance/voucher/income-exp/delete`, dtoTransaction, {signal});
    }
    
    const deleteLedgerVoucher = async (id, signal) => {
        return await xhrAios.delete(`/api/finance/voucher/delete/${id}`, {signal});
    }
    
    const updateVoucher = async (id, dtoTransactions, signal) => {
        return await xhrAios.post(`/api/finance/voucher/update/${id}`, dtoTransactions, {signal});
    }
    
    const updateVoucherDate = async (id, date, signal) => {
        return await xhrAios.post(`/api/finance/voucher/update/${id}/date`, { startDate: date, endDate: date }, {signal});
    }
    
    const createGroup = async (dtoAccGroup, signal) => {
        return await xhrAios.post(`/api/finance/groups/create`, dtoAccGroup, {signal});
    }
    
    const renameGroup = async (dtoAccGroup, signal) => {
        return await xhrAios.post(`/api/finance/groups/rename`, dtoAccGroup, {signal});
    }
    
    const moveAccGroupToGroup = async (dtoAccGrou, signal) => {
        return await xhrAios.post(`/api/finance/groups/move-to-group`, dtoAccGroup, {signal});
    }
    
    const moveAccGroupToChart = async (dtoAccGroup, signal) => {
        return await xhrAios.post(`/api/finance/groups/move-to-chart`, dtoAccGroup, {signal});
    }
    
    const findAccGroupById = async (id, signal) => {
        return await xhrAios.get(`/api/finance/groups/${id}`, {signal});
    }
    
    const findAccChartById = async (id, signal) => {
        return await xhrAios.get(`/api/finance/charts/${id}`, {signal});
    }
    
    // find ledgers in groups and sub-groups under account chart specified by id
    const findChartLedgersById = async (id, signal) => {
        return await xhrAios.get(`/api/finance/chart/${id}/ledgers`, {signal});
    }
    
    // find ledgers in groups and sub-groups under account chart specified by name
    const findChartLedgersByName = async (name, signal) => {
        return await xhrAios.get(`/api/finance/chart/ledgers/${name}`, {signal});
    }
    
    return {
        findLedgerVch,
        createVoucher,
        tradingAcc,
        profitLossAcc,
        balSheet,
        trialBal,
        getIncomeExpVoucherDetails,
        createIncomeExpVoucher,
        updateIncomeExpVoucher,
        deleteIncomeExpVoucher,
        deleteLedgerVoucher,
        updateVoucher,
        updateVoucherDate,
        createGroup,
        renameGroup,
        moveAccGroupToGroup,
        moveAccGroupToChart,
        findAccGroupById,
        findAccChartById,
        findChartLedgersById,
        findChartLedgersByName,
    }
}

export default useFinanceController;