import { Invoice } from './Invoice';

const _receiptProps = new WeakMap();

export class Receipt {
    constructor(jsonObject) {
        const { dtoInvoice } = jsonObject;
        _receiptProps.set(this, {
            id: jsonObject.id,
            cashier: jsonObject.cashier,
            customerName: jsonObject.customerName,
            customerId: jsonObject.customerId,
            ledgerDiscount: jsonObject.ledgerDiscount,
            transactionDate: jsonObject.transactionDate,
            reversalStatus: jsonObject.reversalStatus,
            paymentModes: jsonObject.paymentModes,
            dtoInvoice: dtoInvoice ? new Invoice(dtoInvoice) : null,
        });
    }

    get id() { return _receiptProps.get(this).id; }
    set id(id) { _receiptProps.get(this).id = id }
    
    get cashier() { return _receiptProps.get(this).cashier }
    set cashier(name) { _receiptProps.get(this).cashier = name }

    get customerName() { return _receiptProps.get(this).customerName; }
    set customerName(customerName) { _receiptProps.get(this).customerName = customerName }
    
    get customerId() { return _receiptProps.get(this).customerId }
    set customerId(customerId) { _receiptProps.get(this).customerId = customerId }

    get ledgerDiscount() { return _receiptProps.get(this).ledgerDiscount }
    set ledgerDiscount(ledgerDiscount) { _receiptProps.get(this).ledgerDiscount = ledgerDiscount }
    
    get reversalStatus() { return _receiptProps.get(this).reversalStatus }
    set reversalStatus(reversalStatus) { _receiptProps.get(this).reversalStatus = reversalStatus }
    
    get transactionDate() { return _receiptProps.get(this).transactionDate }
    set transactionDate(transactionDate) { _receiptProps.get(this).transactionDate = transactionDate }

    get paymentModes() { return _receiptProps.get(this).paymentModes; }
    set paymentModes(paymentModes) { _receiptProps.get(this).paymentModes = paymentModes }
    
    get dtoInvoice() { return _receiptProps.get(this).dtoInvoice }
    set dtoInvoice(dtoInvoice) { _receiptProps.get(this).dtoInvoice = dtoInvoice }

    toJSON(){
        return {
            id: this.id,
            cashier: this.cashier,
            customerName: this.customerName,
            customerId: this.customerId,
            ledgerDiscount: this.ledgerDiscount,
            reversalStatus: this.reversalStatus,
            transactionDate: this.transactionDate,
            paymentModes: this.paymentModes,
            dtoInvoice: this.dtoInvoice,
        }
    }
}