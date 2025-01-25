import React from 'react'

const TableBody = (props) => {
    const { data = [], objectProps, menus } = props;
    const { ReactMenu, menuItems, menuItemClick } = menus;

    const rowShadow = {
        //  source code: https://rgbcolorcode.com/color/dark-yellow
        boxShadow: '1px 1px 5px 0.5px #381919'
    };

    return (
        <tbody>
            {data.map( (datum, index) => <tr style={rowShadow} key={index} >
                {objectProps.map((prop, index) => <td key={index}> {datum[prop]} </td>)}
                {menus && <td> <span><ReactMenu entity={datum} menuItems={menuItems} menuItemClick={menuItemClick} /></span> </td>}
            </tr> )}
        </tbody>
        
    );
}

export default TableBody;