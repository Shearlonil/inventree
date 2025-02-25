import React, { useState } from 'react'
import { Toggle } from 'rsuite'

const ToggleSwitch = (props) => {
    const { checkedTxt, unCheckedTxt, ticked = false, data, onChangeFn } = props;

    const [checked, setChecked] = useState(ticked);
    const [loading, setLoading] = useState(false);

    const toggleChange = async (checked, data) => {
        try {
            setLoading(true);
            await onChangeFn(checked, data);
            setChecked(checked);
            setLoading(false);
        } catch (error) {
            setLoading(false);
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