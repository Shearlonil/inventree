import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";
import { FaEllipsisVertical } from "react-icons/fa6";

const ReactMenu = () => {
	return (
		<Menu
			menuButton={
				<MenuButton className={"border-0 p-2 rounded-2"}>
					<FaEllipsisVertical />
				</MenuButton>
			}
			transition
		>
			{["Cut", "Copy", "Paste"].map((menuName) => (
				<MenuItem>{menuName}</MenuItem>
			))}
		</Menu>
	);
};
export default ReactMenu;
