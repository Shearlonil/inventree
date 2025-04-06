import { format } from "date-fns";
import numeral from "numeral";
import { SalesRecordSummary } from "./SalesRecordSummary";

const _summaryProps = new WeakMap();

export class ReceiptSummary {
    constructor(arr) {
        if (arr) {
            const array = [];
            arr.forEach(i => {
                const salesSummary = new SalesRecordSummary(i);
                array.push(salesSummary);
            });
            _summaryProps.set(this, {
                id: arr[0].receipt_id,
                items: array,
                paymentModes: arr[0].paymentModes,
                customerName: arr[0].customerName,
                invoiceDiscount: arr[0].invoice_discount ? arr[0].invoice_discount : 0,
                transactionDate: arr[0].transaction_date,
            });
        }else {
            _summaryProps.set(this, {});
        }
    }

    get id() { return _summaryProps.get(this).id; }
    set id(id) { _summaryProps.get(this).id = id; }
    
    get customerName() { return _summaryProps.get(this).customerName; }
    set customerName(name) { _summaryProps.get(this).customerName = name; }
    
    get items() { return _summaryProps.get(this).items; }
    set items(items) { _summaryProps.get(this).items = items; }
    
    get grossAmount() {
        const grossAmount = this.items.map(item => item.totalAmount).reduce((prevVal, currentVal) => currentVal + prevVal);
        return numeral(grossAmount).value(); 
    }

    get netAmount() { return numeral(this.grossAmount).subtract(this.invoiceDiscount).value(); }

    get netProfit() {
        const netProfit = this.items.map(item => item.profit).reduce((prevVal, currentVal) => currentVal + prevVal);
        return numeral(netProfit).subtract(this.invoiceDiscount).value(); 
    }

    get toStringPaymentModes() {
        let str = '{ ';
        _summaryProps.get(this).paymentModes.forEach(pm => {
            str += `${pm.type} = ${pm.amount}, `
        });
        str += '}'
        return str;
    }
    get paymentModes() { return _summaryProps.get(this).paymentModes; }
    set paymentModes(paymentModes) { _summaryProps.get(this).paymentModes = paymentModes; }

    get invoiceDiscount() { return _summaryProps.get(this).invoiceDiscount; }
    set invoiceDiscount(invoiceDiscount) { _summaryProps.get(this).invoiceDiscount = invoiceDiscount; }

    get transactionDate() { return _summaryProps.get(this).transactionDate ? format(_summaryProps.get(this).transactionDate, 'dd/MM/yyyy HH:mm:ss') : ''; }
    set transactionDate(transactionDate) { _summaryProps.get(this).transactionDate = transactionDate; }

    toJSON(){
        return {
            id: this.id,
            customerName: this.customerName,
            paymentModes: this.paymentModes,
            invoiceDiscount: this.invoiceDiscount,
            items: this.items,
            transactionDate: this.transactionDate,
            grossAmount: this.grossAmount,
            netAmount: this.netAmount,
        }
    }
}