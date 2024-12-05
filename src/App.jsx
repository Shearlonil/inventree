import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./Routes/Home";
import CashierWindow from "./Routes/CashierWindow";

function App() {
	return (
		<>
			<Routes>
				<Route index path={"/"} element={<Home />} />
				<Route path={"/cashier-window"} element={<CashierWindow />} />
			</Routes>
		</>
	);
}

export default App;
