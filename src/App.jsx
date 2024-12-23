import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./Routes/Home";
import CashierWindow from "./Routes/CashierWindow";
import AcctVoucherCreation from "./Routes/AcctVoucherCreation";
import MonoTransaction from "./Routes/MonoTransaction";

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
			</Routes>
		</>
	);
}

export default App;
