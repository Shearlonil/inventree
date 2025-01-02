import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./Routes/Home";
import CashierWindow from "./Routes/CashierWindow";
import AcctVoucherCreation from "./Routes/AcctVoucherCreation";
import MonoTransaction from "./Routes/MonoTransaction";
import Store from "./Routes/Store";
import Test from "./Routes/Test";
// import EditProfilePage from "./Routes/ViewItemsDetails";
import PurchasesWindow from "./Routes/PurchasesWindow";
import Finance from "./Routes/Finance";

function App() {
	return (
		<>
			<Routes>
				<Route index path={"/"} element={<Home />} />
				<Route path={"/cashier-window"} element={<CashierWindow />} />
				<Route
					path={"/acct-voucher-creation"}
					element={<AcctVoucherCreation />}
				/>
				<Route path={"/mono-transaction"} element={<MonoTransaction />} />
				<Route path={"/store"} element={<Store />} />
				<Route path={"/purchases"} element={<PurchasesWindow />} />
				<Route path={"/finance"} element={<Finance />} />
				<Route path={"/test"} element={<Test />} />
			</Routes>
		</>
	);
}

export default App;
