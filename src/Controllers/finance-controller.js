import httpService from "../axios/http-service";

const findLedgerVch = async (id) => {
    return await httpService.get(`/api/finance/voucher/find/${id}`);
}

const createVoucher = async (dtoTransactions) => {
    return await httpService.post(`/api/finance/voucher/create`, dtoTransactions);
}

const getIncomeExpVoucherDetails = async (name, startDate, endDate) => {
    return await httpService.post(`/api/finance/voucher/income-exp/${name}`, { startDate, endDate });
}

const createIncomeExpVoucher = async (dtoTransaction) => {
    return await httpService.post(`/api/finance/voucher/income-exp/create`, dtoTransaction);
}

const updateIncomeExpVoucher = async (dtoTransaction) => {
    return await httpService.post(`/api/finance/voucher/income-exp/update`, dtoTransaction);
}

const deleteIncomeExpVoucher = async (dtoTransaction) => {
    return await httpService.post(`/api/finance/voucher/income-exp/delete`, dtoTransaction);
}

const updateVoucher = async (id, dtoTransactions) => {
    return await httpService.post(`/api/finance/voucher/update/${id}`, dtoTransactions);
}

const createGroup = async (dtoAccGroup) => {
    return await httpService.post(`/api/finance/groups/create`, dtoAccGroup);
}

const renameGroup = async (dtoAccGroup) => {
    return await httpService.post(`/api/finance/groups/rename`, dtoAccGroup);
}

const moveAccGroupToGroup = async (dtoAccGroup) => {
    return await httpService.post(`/api/finance/groups/move-to-group`, dtoAccGroup);
}

const moveAccGroupToChart = async (dtoAccGroup) => {
    return await httpService.post(`/api/finance/groups/move-to-chart`, dtoAccGroup);
}

const findAccGroupById = async (id) => {
    return await httpService.get(`/api/finance/groups/${id}`);
}

const findAccChartById = async (id) => {
    return await httpService.get(`/api/finance/charts/${id}`);
}

// find ledgers in groups and sub-groups under account chart specified by id
const findChartLedgersById = async (id) => {
    return await httpService.get(`/api/finance/chart/${id}/ledgers`);
}

// find ledgers in groups and sub-groups under account chart specified by name
const findChartLedgersByName = async (name) => {
    return await httpService.get(`/api/finance/chart/ledgers/${name}`);
}

export default {
    findLedgerVch,
    createVoucher,
    getIncomeExpVoucherDetails,
    createIncomeExpVoucher,
    updateIncomeExpVoucher,
    deleteIncomeExpVoucher,
    updateVoucher,
    createGroup,
    renameGroup,
    moveAccGroupToGroup,
    moveAccGroupToChart,
    findAccGroupById,
    findAccChartById,
    findChartLedgersById,
    findChartLedgersByName,
}