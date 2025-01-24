import React from 'react'

const TableBody = (props) => {
    const { data = [], objectProps, ReactMenu } = props;

    const rowShadow = {
        //  source code: https://rgbcolorcode.com/color/dark-yellow
        boxShadow: '1px 1px 5px 0.5px #381919'
    };

    return (
        <tbody>
            {data.map( (datum, index) => <tr style={rowShadow} key={index} >
                {objectProps.map((prop, index) => <td key={index}> {datum[prop]} </td>)}
                {ReactMenu && <td> <span><ReactMenu /></span> </td>}
            </tr> )}
        </tbody>
        
    );
}

export default TableBody;