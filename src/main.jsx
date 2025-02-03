import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "react-loading-skeleton/dist/skeleton.css";

import "bootstrap/dist/js/bootstrap.bundle.js";
import App from "./App.jsx";
import NavBar from "./Components/Navbar.jsx";
import { AuthProvider } from './app-context/auth-user-context.js';
import Footer from './Components/Footer.jsx';

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<NavBar />
				<App />
				<Footer />
			</AuthProvider>
		</BrowserRouter>
	</StrictMode>
);
