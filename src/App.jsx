import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "./App.css";
import Home from "./Routes/Home";
import CashierWindow from "./Routes/CashierWindow";
import AcctVoucherCreation from "./Routes/AcctVoucherCreation";
import MonoTransaction from "./Routes/MonoTransaction";
import StoreItemReg from "./Routes/Store/StoreItemReg";
import Test from "./Routes/Test";
import PurchasesWindow from "./Routes/PurchasesWindow";
import Finance from "./Routes/Finance";
import Login from "./Routes/Login";
import Dashboard from "./Routes/Dashboard";
import UnverifiedStockRec from "./Routes/UnverifiedStockRec";
import Restock from './Routes/Store/Restock';
import Dispensary from './Routes/Store/Dispensary';
import PageNotFound from './Routes/PageNotFound';

function App() {
	return (
		<>
			<Routes>
				<Route index path={"/"} element={<Home />} />
				<Route index path={"/login"} element={<Login />} />
				<Route path={"/cashier-window"} element={<CashierWindow />} />
				<Route
					path={"/acct-voucher-creation"}
					element={<AcctVoucherCreation />}
				/>
				<Route path={"/mono-transaction"} element={<MonoTransaction />} />
				<Route path={"/store/item/reg/:stock_rec_id"} element={<StoreItemReg />} />
				<Route path={"/store/item/restock/:stock_rec_id"} element={<Restock />} />
				<Route path={"/store/item/dispensary/:dispensary_id"} element={<Dispensary />} />
				<Route path={"/store/item/ongoing/:mode"} element={<UnverifiedStockRec />} />
				<Route path={"/purchases"} element={<PurchasesWindow />} />
				<Route path={"/finance"} element={<Finance />} />
				<Route path={"/dashboard"} element={<Dashboard />} />
				<Route path={"/test"} element={<Test />} />
				<Route path="*" element={<PageNotFound />} />
			</Routes>
			<ToastContainer />
		</>
	);
}

export default App;
