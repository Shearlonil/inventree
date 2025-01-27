import numeral from "numeral";

const _itemProps = new WeakMap();

export class ItemRegDTO {
    constructor() {
        _itemProps.set(this, {
            itemDetailId: 0,
            qty: 0,
            unitStockPrice: 0,
            qtyType: 'unit', // defaults to unit
            creditPurchaseAmount: 0,
        });
    }

    get id() { return _itemProps.get(this).id; }
    set id(id) { _itemProps.get(this).id = id }

    get itemDetailId() { return _itemProps.get(this).itemDetailId; }
    set itemDetailId(itemDetailId) { _itemProps.get(this).itemDetailId = itemDetailId }
    
    get itemName() { return _itemProps.get(this).itemName }
    set itemName(name) { _itemProps.get(this).itemName = name }
    
    get qty() { return _itemProps.get(this).qty }
    set qty(qty) { _itemProps.get(this).qty = qty }
    
    get qtyPerPkg() { return _itemProps.get(this).qtyPerPkg; }
    set qtyPerPkg(qtyPerPkg) { _itemProps.get(this).qtyPerPkg = qtyPerPkg }
    
    get qtyType() { return _itemProps.get(this).qtyType }
    set qtyType(qtyType) { _itemProps.get(this).qtyType = qtyType }
    
    get status() { return _itemProps.get(this).status }
    set status(status) { _itemProps.get(this).status = status }

    get unitSalesPrice() { return _itemProps.get(this).unitSalesPrice; }
    set unitSalesPrice(unitSalesPrice) { _itemProps.get(this).unitSalesPrice = unitSalesPrice }
    
    get unitStockPrice() { return _itemProps.get(this).unitStockPrice }
    set unitStockPrice(unitStockPrice) { _itemProps.get(this).unitStockPrice = unitStockPrice }

    get pkgSalesPrice() { return _itemProps.get(this).pkgSalesPrice; }
    set pkgSalesPrice(pkgSalesPrice) { _itemProps.get(this).pkgSalesPrice = pkgSalesPrice }
    
    get pkgStockPrice() { return _itemProps.get(this).pkgStockPrice }
    set pkgStockPrice(pkgStockPrice) { _itemProps.get(this).pkgStockPrice = pkgStockPrice }

    get pkgId() { return _itemProps.get(this).pkgId; }
    set pkgId(pkgId) { _itemProps.get(this).pkgId = pkgId }
    
    get tractId() { return _itemProps.get(this).tractId }
    set tractId(tractId) { _itemProps.get(this).tractId = tractId }

    get vendorId() { return _itemProps.get(this).vendorId }
    set vendorId(vendorId) { _itemProps.get(this).vendorId = vendorId }

    get purchaseMode() { return _itemProps.get(this).purchaseMode; }
    set purchaseMode(purchaseMode) { _itemProps.get(this).purchaseMode = purchaseMode }
    
    get expDate() { return _itemProps.get(this).expDate }
    set expDate(expDate) { _itemProps.get(this).expDate = expDate }

    get cashPurchaseAmount() { return _itemProps.get(this).cashPurchaseAmount; }
    set cashPurchaseAmount(cashPurchaseAmount) { _itemProps.get(this).cashPurchaseAmount = cashPurchaseAmount }
    
    get pkgName() { return _itemProps.get(this).pkgName }
    set pkgName(pkgName) { _itemProps.get(this).pkgName = pkgName }
    
    get vendorName() { return _itemProps.get(this).vendorName }
    set vendorName(vendorName) { _itemProps.get(this).vendorName = vendorName }
    
    get sectionName() { return _itemProps.get(this).sectionName }
    set sectionName(sectionName) { _itemProps.get(this).sectionName = sectionName }

    get purchaseAmount() {
        // calculate purchase amount from qty, qtyType, qtyPerPkg, unitStockPrice
        return calcPurchaseAmount(_itemProps.get(this));
    }

    get creditPurchaseAmount() {
        // calculate credit purchase amount from cash amount and purchase amount
        const purchaseAmount = calcPurchaseAmount(_itemProps.get(this));
        return numeral(purchaseAmount).subtract(_itemProps.get(this).cashPurchaseAmount).format('₦0,0.00'); 
    }

    toJSON(){
        return {
            id: this.id,
            itemDetailId: this.itemDetailId,
            itemName: this.itemName,
            qty: this.qty,
            qtyType: this.qtyType,
            qtyPerPkg: this.qtyPerPkg,
            pkgId: this.pkgId,
            vendorId: this.vendorId,
            tractId: this.tractId,
            status: this.status,
            cashPurchaseAmount: this.cashPurchaseAmount,
            expDate: this.expDate,
            pkgSalesPrice: this.pkgSalesPrice,
            unitSalesPrice: this.unitSalesPrice,
            pkgStockPrice: this.pkgStockPrice,
            unitStockPrice: this.unitStockPrice,
        }
    }
}

//  private helper function to calculate purchase amount
const calcPurchaseAmount = (itemProps) => {
    return itemProps.qtyType.toLowerCase() === "unit" ? 
        numeral(itemProps.qty).multiply(itemProps.unitStockPrice).format('₦0,0.00') :
        numeral(itemProps.qty).multiply(itemProps.qtyPerPkg).multiply(itemProps.unitStockPrice).format('₦0,0.00'); 
}