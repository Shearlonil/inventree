import React, { useEffect } from 'react'
import TableHeader from './TableHeader';
import { Table } from 'react-bootstrap';
import TableBody from './TableBody';

const TableMain = (props) => {
    const { tableProps, tableData, ReactMenu } = props;
    const { headers, objectProps } = tableProps;

    // useEffect(() => {
    // }, [headers]);

    const rowSpacing = {
        /*source code: https://www.w3docs.com/snippets/css/how-to-create-space-between-rows-in-the-table.html*/
        borderCollapse: 'separate',
        borderSpacing: '0 10px',
        textAlign: 'left'
    };

    return (
        <Table striped hover responsive size=' d' style={rowSpacing} >
            <TableHeader headers={headers} />
            <TableBody data={tableData} objectProps={objectProps} ReactMenu={ReactMenu} />
        </Table>
    )
}

export default TableMain;