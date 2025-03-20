import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Home from "./Routes/Home";
import AcctVoucherCreation from "./Routes/AcctVoucherCreation";
import MonoTransaction from "./Routes/SalesTransaction/MonoTransaction";
import StoreItemReg from "./Routes/Store/StoreItemReg";
import Test from "./Routes/Test";
import PurchasesWindow from "./Routes/PurchasesWindow";
import Finance from "./Routes/Finance";
import Login from "./Routes/Login";
import UnverifiedStockRec from "./Routes/Dashboard/UnverifiedStockRec";
import Restock from './Routes/Store/Restock';
import Dispensary from './Routes/Store/Dispensary';
import PageNotFound from './Routes/PageNotFound';
import { ProtectedRoute } from './Routes/ProtectedRoute';
import UnvenrifiedDispensary from "./Routes/Dashboard/UnvenrifiedDispensary";
import UsersWindow from "./Routes/Dashboard/Users/UsersWindow";
import CustomersWindow from './Routes/Contacts/CustomersWindow';
import SalesReceiptWindow from './Routes/Dashboard/SalesReceiptWindow';
import LedgerDisplay from './Routes/LedgerDisplay';
import CashierWindow from "./Routes/SalesTransaction/CashierWindow";
import SectionTransaction from "./Routes/SalesTransaction/SectionTransaction";
import VendorsWindow from "./Routes/Contacts/VendorsWindow";
import ContactLedgerDisplay from "./Routes/Contacts/ContactLedgerDisplay";
import ContactTrash from "./Routes/Contacts/ContactTrash";
import InvoiceWindow from "./Routes/Dashboard/InvoiceWindow";
import OutpostsWindow from "./Routes/Outposts/OutpostsWindow";
import OutpostTrash from "./Routes/Outposts/OutpostTrash";
import UserTrash from "./Routes/Dashboard/Users/UserTrash";
import UserDetails from "./Routes/Dashboard/Users/UserDetails";
import Dashboard from "./Routes/Dashboard/Dashboard";
import ChangePassword from "./Routes/Dashboard/Users/ChangePassword";
import ProfileUpdate from "./Routes/Dashboard/Users/ProfileUPdate";
import TractsWindow from "./Routes/Tracts/TractsWindow";
import TractsItemsView from "./Routes/Tracts/TractItemsView";
import PkgsWindow from "./Routes/Dashboard/Pkg/PkgsWindow";
import PkgItemsView from "./Routes/Dashboard/Pkg/PkgItemsView";
import SalesWindow from "./Routes/Items/SalesWindow";
import SalesItemQtyMgrView from "./Routes/Items/SalesItemQtyMgrView";
import StoreWindow from "./Routes/Items/StoreWindow";
import StoreItemQtyMgrView from "./Routes/Items/StoreItemQtyMgrView";
import GrossWindow from "./Routes/Items/GrossWindow";
import Trash from "./Routes/Items/Trash";
import SalesReport from "./Routes/SalesReport";

function App() {
	return (
		<>
			<Routes>
				<Route index path={"/"} element={<Home />} />
				<Route index path={"/login"} element={<Login />} />
				<Route index path={"/sales/report"} element={<SalesReport />} />
				<Route path="/transaction" element={<ProtectedRoute />}>
					<Route path="cashier" element={<CashierWindow />} />
					<Route path="section" element={<SectionTransaction />} />
					<Route path={"mono"} element={<MonoTransaction />} />
					<Route path="" element={<PageNotFound />} />
          		</Route>
				<Route path="/contacts" element={<ProtectedRoute />}>
					<Route path={"customers"} element={<CustomersWindow />} />
					<Route path={"vendors"} element={<VendorsWindow />} />
					<Route path={":contact/ledger"} element={<ContactLedgerDisplay />} />
					<Route path={":contact/trash"} element={<ContactTrash />} />
					<Route path="" element={<PageNotFound />} />
          		</Route>
				<Route path="/store/item" element={<ProtectedRoute />}>
					<Route path={"reg/:stock_rec_id"} element={<StoreItemReg />} />
					<Route path={"restock/:stock_rec_id"} element={<Restock />} />
					<Route path={"dispensary/:dispensary_id"} element={<Dispensary />} />
					<Route path={"unverified/:mode"} element={<UnverifiedStockRec />} />
					<Route path={"unverified/dispensary"} element={<UnvenrifiedDispensary />} />
					<Route path="" element={<PageNotFound />} />
          		</Route>
				<Route path={"/purchases"} element={<PurchasesWindow />} />
				<Route path="/sections" element={<ProtectedRoute />}>
					<Route path={":tractName/items"} element={<TractsItemsView />} />
					<Route path={""} element={<TractsWindow />} />
				</Route>
				<Route path="/packaging" element={<ProtectedRoute />}>
					<Route path={":pkgName/items"} element={<PkgItemsView />} />
					<Route path={""} element={<PkgsWindow />} />
				</Route>
				<Route path="/items" element={<ProtectedRoute />}>
					<Route path="sales" element={<ProtectedRoute />}>
						<Route path={":salesMode"} element={<SalesWindow />} />
						<Route path={":id/qty-mgr"} element={<SalesItemQtyMgrView />} />
						<Route path={""} element={<SalesWindow />} />
					</Route>
					<Route path="store" element={<ProtectedRoute />}>
						<Route path={":storeMode"} element={<StoreWindow />} />
						<Route path={":id/qty-mgr"} element={<StoreItemQtyMgrView />} />
						<Route path={""} element={<StoreWindow />} />
					</Route>
					<Route path="gross" element={<ProtectedRoute />}>
						<Route path={":grossMode"} element={<GrossWindow />} />
						<Route path={""} element={<GrossWindow />} />
					</Route>
					<Route path={"trash"} element={<Trash />} />
				</Route>
				<Route path="/outposts" element={<ProtectedRoute />}>
					<Route path={"trash"} element={<OutpostTrash />} />
					<Route path={""} element={<OutpostsWindow />} />
				</Route>
				<Route path={"/finance"} element={<ProtectedRoute />}>
					<Route path={"vouchers/create"} element={<AcctVoucherCreation />} />
					<Route path={"ledgers/view"} element={<LedgerDisplay />} />
					<Route path="" element={<PageNotFound />} />
				</Route>
				<Route path="/dashboard" element={<ProtectedRoute />}>
					<Route path={"users"} element={<UsersWindow />} />
					<Route path={":username/profile"} element={<ProfileUpdate />} />
					<Route path={"users/password/change"} element={<ChangePassword />} />
					<Route path={"users/trash"} element={<UserTrash />} />
					<Route path={":username/details"} element={<UserDetails />} />
					<Route path={"receipts"} element={<SalesReceiptWindow />} />
					<Route path={"invoices"} element={<InvoiceWindow />} />
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
