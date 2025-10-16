import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import 'rsuite/dist/rsuite.min.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "react-loading-skeleton/dist/skeleton.css";
import "react-datetime/css/react-datetime.css";

import "bootstrap/dist/js/bootstrap.bundle.js";
import App from "./App.jsx";
import NavBar from "./Components/Navbar.jsx";
import { AuthProvider } from './app-context/auth-user-context.js';
import Footer from './Components/Footer.jsx';
import { FinanceProvider } from './app-context/finance-context.js';

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<FinanceProvider>
					<NavBar />
					<App />
					<Footer />
				</FinanceProvider>
			</AuthProvider>
		</BrowserRouter>
	</StrictMode>
);
