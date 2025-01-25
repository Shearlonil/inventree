import { Menu, MenuItem, MenuButton, SubMenu } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";
import { CgMenuLeft } from "react-icons/cg";

const ReactMenu = (props) => {
	const {menuItems, variant = 'success', menuItemClick = () => {}, entity} = props;

    const uuid = () => {
        //	source: https://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php
        var dt = (new Date()).getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (dt + Math.random()*16)%16 | 0;
            dt = Math.floor(dt/16);
            return (c === 'x' ? r :(r&0x3|0x8)).toString(16);
        });
        return uuid;
    };


    //	iterate over the menu list or Sub menu list
    const menusIteration = menus => menus?.map(menu => menu.subMenuList ? buildSubMenu(menu) : buildMenuItem(menu));

    //	build/create the menu-item
    const buildMenuItem = menuItem => 
        <MenuItem value={menuItem.name} onClick={(e) => menuItemClick(menuItem.onClickParams, entity, e)} className='gap-1'
            key={uuid()}>
            {/* {menuItem.svgUrl && <IconSVGloader path={menuItem.svgUrl} width='30px' height='30px' mode='offline' />} */}
            {menuItem.name}
    </MenuItem>;

    //	build/create sub-menu
    const buildSubMenu = subMenu => <SubMenu label={subMenu.name} key={uuid()}>
        {menusIteration(subMenu.subMenuList)}
    </SubMenu>;

	return (
		<Menu
			menuButton={
				<MenuButton className={"border-0"}>
					<span className={`gap-2 btn btn-${variant}`}>
						<CgMenuLeft size={"20px"} />
					</span>
				</MenuButton>
			}
			transition
		>
			{menusIteration(menuItems)}
		</Menu>
	);
};
export default ReactMenu;

/*  
    USEAGE
    const menus = [
        { name: 'Home', onClickParams: {evtName: 'Home'} }, =====> here arg isn't provided
        {
            name: 'About',
            subMenuList: [
                { name: "About 1", onClickParams: {arg: 'About', evtName: 'About1' }, svg: 'path'},
                { name: "About 2", onClickParams: {arg: 'About', evtName: 'About2' } },
                { name: "About 3", onClickParams: {arg: 'About', evtName: 'About3' } }
            ]
        },
        { name: "About 1", onClickParams: {evtName: 'About1' }, svg: 'path'}, =====> svg image added here
        {
            name: 'Services',
            subMenuList: [
                { name: "React",
                    subMenuList: [
                        { name: "Code Optimization", onClickParams: {arg: 'React', evtName: 'CodeOptimization' } },
                        { name: "Authentication", onClickParams: {arg: 'React', evtName: 'Authentication' } },
                        { name: "Training", onClickParams: {arg: 'React', evtName: 'Training' } }
                ]},
                { name: "SEO", onClickParams: {arg: 'Services', evtName: 'seo' } },
                { name: "Web Development", onClickParams: {arg: 'Services', evtName: 'WebDev' } }
            ]
        },
    ];
    <ReactMenu menus={menus} />

*/
