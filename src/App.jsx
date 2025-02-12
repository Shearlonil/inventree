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
import { ProtectedRoute } from './Routes/ProtectedRoute';
import UnvenrifiedDispensary from "./Routes/UnvenrifiedDispensary";
import UserWindow from "./Routes/UserWindow";
import CustomerWindows from './Routes/CustomerWindow';
import SalesReceiptWindow from './Routes/SalesReceiptWindow';
import LedgerDisplay from './Routes/LedgerDisplay';

function App() {
	return (
		<>
			<Routes>
				<Route index path={"/"} element={<Home />} />
				<Route index path={"/login"} element={<Login />} />
				<Route path="/transaction" element={<ProtectedRoute />}>
					<Route path="cashier" element={<CashierWindow />} />
					<Route path={"mono"} element={<MonoTransaction />} />
          		</Route>
				<Route path="/contacts" element={<ProtectedRoute />}>
					<Route path={"customers"} element={<CustomerWindows />} />
          		</Route>
				<Route path="/store/item" element={<ProtectedRoute />}>
					<Route path={"reg/:stock_rec_id"} element={<StoreItemReg />} />
					<Route path={"restock/:stock_rec_id"} element={<Restock />} />
					<Route path={"dispensary/:dispensary_id"} element={<Dispensary />} />
					<Route path={"unverified/:mode"} element={<UnverifiedStockRec />} />
					<Route path={"unverified/dispensary"} element={<UnvenrifiedDispensary />} />
          		</Route>
				<Route path={"/purchases"} element={<PurchasesWindow />} />
				<Route path={"/finance"} element={<ProtectedRoute />}>
					<Route path={"vouchers/create"} element={<AcctVoucherCreation />} />
					<Route path={"ledgers/view"} element={<LedgerDisplay />} />
				</Route>
				<Route path="/dashboard" element={<ProtectedRoute />}>
					<Route path={"users"} element={<UserWindow />} />
					<Route path={"receipts"} element={<SalesReceiptWindow />} />
					<Route path={""} element={<Dashboard />} />
          		</Route>
				<Route path={"/test"} element={<Test />} />
				<Route path="*" element={<PageNotFound />} />
			</Routes>
			<ToastContainer />
		</>
	);
}

export default App;
