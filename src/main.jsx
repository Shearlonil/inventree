import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./Components/Navbar.jsx";
import { AuthProvider } from './app-context/auth-user-context.js';

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<NavBar />
				<App />
			</AuthProvider>
		</BrowserRouter>
	</StrictMode>
);
