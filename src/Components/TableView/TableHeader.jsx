import React from 'react'

const TableHeader = (props) => {
    const { headers } = props;

    return (
        <thead key='theader' className='table-primary'>
            <tr key='head'>
                {headers && headers.map((value, index) => <th key={index + value}> {value} </th> )}
            </tr>
        </thead>
    );
}

export default TableHeader;