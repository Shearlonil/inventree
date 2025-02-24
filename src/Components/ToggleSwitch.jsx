import React, { useEffect, useState } from 'react'
import { Toggle } from 'rsuite'

const ToggleSwitch = (props) => {
    const { checkedTxt, unCheckedTxt, ticked = false, data, loading = false, onChangeFn } = props;

    const [checked, setChecked] = useState(ticked);
    
    useEffect(() => {
    }, [checked]);

    const toggleChange = async (checked, data) => {
        try {
            setChecked(checked);
            await onChangeFn(checked, data);
        } catch (error) {
            //  do nothing here. just don't set the checked prop
        }
    }

    return (
        <Toggle 
            checkedChildren={checkedTxt} 
            unCheckedChildren={unCheckedTxt} 
            loading={loading} 
            checked={checked}
            color = 'green'
            onChange={(checked, e) => toggleChange(checked, data)} 
        />
    )
}

export default ToggleSwitch;