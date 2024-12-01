import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./Routes/Home";

function App() {
	return (
		<>
			<Routes>
				<Route index path={"/"} element={<Home />} />
			</Routes>
		</>
	);
}

export default App;
