const _invoiceProps = new WeakMap();

export class Invoice {
    constructor(jsonObject) {
        if (jsonObject) {
            const { dtoSalesRecords } = jsonObject;
            _invoiceProps.set(this, {
                id: jsonObject.id,
                receiptId: jsonObject.receipt_id,
                username: jsonObject.username,
                outpostName: jsonObject.outpostname,
                outpostID: jsonObject.outpostID,
                invoiceDiscount: jsonObject.invoiceDiscount,
                transactionDate: jsonObject.invoice_date,
                reversalStatus: jsonObject.reversalStatus,
                dtoSalesRecords: dtoSalesRecords,
            });
        }else {
            _invoiceProps.set(this, {});
        }
    }

    get id() { return _invoiceProps.get(this).id; }
    set id(id) { _invoiceProps.get(this).id = id }

    get receiptId() { return _invoiceProps.get(this).receiptId; }
    set receiptId(receiptId) { _invoiceProps.get(this).receiptId = receiptId }
    
    get username() { return _invoiceProps.get(this).username }
    set username(name) { _invoiceProps.get(this).username = name }

    get outpostName() { return _invoiceProps.get(this).outpostName; }
    set outpostName(outpostName) { _invoiceProps.get(this).outpostName = outpostName }
    
    get outpostID() { return _invoiceProps.get(this).outpostID }
    set outpostID(outpostID) { _invoiceProps.get(this).outpostID = outpostID }

    get invoiceDiscount() { return _invoiceProps.get(this).invoiceDiscount }
    set invoiceDiscount(invoiceDiscount) { _invoiceProps.get(this).invoiceDiscount = invoiceDiscount }
    
    get reversalStatus() { return _invoiceProps.get(this).reversalStatus }
    set reversalStatus(reversalStatus) { _invoiceProps.get(this).reversalStatus = reversalStatus }
    
    get transactionDate() { return _invoiceProps.get(this).transactionDate }
    set transactionDate(transactionDate) { _invoiceProps.get(this).transactionDate = transactionDate }
    
    get dtoSalesRecords() { return _invoiceProps.get(this).dtoSalesRecords }
    set dtoSalesRecords(dtoSalesRecords) { _invoiceProps.get(this).dtoSalesRecords = dtoSalesRecords }

    toJSON(){
        return {
            id: this.id,
            username: this.username,
            outpostName: this.outpostName,
            outpostID: this.outpostID,
            invoiceDiscount: this.invoiceDiscount,
            reversalStatus: this.reversalStatus,
            transactionDate: this.transactionDate,
            paymentModes: this.paymentModes,
            dtoSalesRecords: this.dtoSalesRecords,
        }
    }
}