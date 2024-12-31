import { Menu, MenuItem, MenuButton, SubMenu } from "@szhsin/react-menu";
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
			<SubMenu label="Edit">
				<MenuItem>Cut</MenuItem>
				<MenuItem>Copy</MenuItem>
				<MenuItem>Paste</MenuItem>
				<SubMenu label="Find">
					<MenuItem>Find...</MenuItem>
					<MenuItem>Find Next</MenuItem>
					<MenuItem>Find Previous</MenuItem>
				</SubMenu>
			</SubMenu>
		</Menu>
	);
};
export default ReactMenu;
