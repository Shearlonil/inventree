import { createContext, useContext, useMemo, useState } from "react";
import numeral from "numeral";

const FinanceContext = createContext();

/*ref:  https://blog.logrocket.com/authentication-react-router-v6/
        https://blog.logrocket.com/react-context-tutorial/
*/
export const FinanceProvider = ({ children }) => {
    const [map, setMap] = useState(new Map());
    
    // call this function when you want to authenticate the user
    const addGroup = (chart, groupNameKey, chartName) => {
        let cr = numeral(0);
        let dr = numeral(0);
        let balance = chart[groupNameKey]
            .map(obj => {
                dr = numeral(dr).add(obj.drAmount);
                cr = numeral(cr).add(obj.crAmount);
                return obj.balance;
            })
            .reduce((currentVal, accumulator) => numeral(currentVal).add(accumulator).value(), 0);
        map.set(groupNameKey, {
            chart: chartName,
            crAmount: cr.value(),
            drAmount: dr.value(),
            balance
        });
        setMap(map);
    };

    const getGroup = (groupNameKey) => {
        return map.get(groupNameKey);
    }

    const getChartSummary = (chartName) => {
        /*
            for (let [key, value] of map) {
                console.log(`${key} = ${value}`);
            }
        */
        let cr = numeral(0);
        let dr = numeral(0);
        const arr = [];
        map.forEach((val, key) => val.chart.toLowerCase() === chartName.toLowerCase() ? arr.push(val) : '');
        let balance = arr.map(obj => {
                dr = numeral(dr).add(obj.drAmount);
                cr = numeral(cr).add(obj.crAmount);
                return obj.balance;
            })
            .reduce((currentVal, accumulator) => numeral(currentVal).add(accumulator).value(), 0);
        return {
            crAmount: cr.value(),
            drAmount: dr.value(),
            balance
        };
    }

    const grandTotal = () => {
        /*
            for (let [key, value] of map) {
                console.log(`${key} = ${value}`);
            }
        */
        let cr = numeral(0);
        let dr = numeral(0);
        let balance = numeral(0);
        map.forEach(obj => {
            dr = numeral(dr).add(obj.drAmount);
            cr = numeral(cr).add(obj.crAmount);
            balance = numeral(balance).add(obj.balance);
        });
        return {
            crAmount: cr.value(),
            drAmount: dr.value(),
            balance: balance.value()
        };
    }

    const clear = () => {
        setMap(new Map());
    }

    const value = useMemo(
        () => ({
            addGroup,
            getGroup,
            getChartSummary,
            grandTotal,
            clear,
        }),
        [map]
    );

    return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export const useFinance = () => useContext(FinanceContext);