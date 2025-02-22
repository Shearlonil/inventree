import numeral from "numeral";

const _itemProps = new WeakMap();

export class ItemRegDTO {
    constructor() {
        _itemProps.set(this, {
            itemDetailId: 0,
            qty: 0,
            status: false,
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

    get unitSalesPrice() { return numeral(_itemProps.get(this).unitSalesPrice).format('₦0,0.00'); }
    set unitSalesPrice(unitSalesPrice) { _itemProps.get(this).unitSalesPrice = unitSalesPrice; }
    
    get unitStockPrice() { return numeral(_itemProps.get(this).unitStockPrice).format('₦0,0.00'); }
    set unitStockPrice(unitStockPrice) { _itemProps.get(this).unitStockPrice = unitStockPrice }

    get pkgSalesPrice() { return numeral(_itemProps.get(this).pkgSalesPrice).format('₦0,0.00'); }
    set pkgSalesPrice(pkgSalesPrice) { _itemProps.get(this).pkgSalesPrice = pkgSalesPrice }
    
    get pkgStockPrice() { return numeral(_itemProps.get(this).pkgStockPrice).format('₦0,0.00'); }
    set pkgStockPrice(pkgStockPrice) { _itemProps.get(this).pkgStockPrice = pkgStockPrice; }

    get pkgId() { return _itemProps.get(this).pkgId; }
    set pkgId(pkgId) { _itemProps.get(this).pkgId = pkgId; }
    
    get tractId() { return _itemProps.get(this).tractId; }
    set tractId(tractId) { _itemProps.get(this).tractId = tractId; }

    get vendorId() { return _itemProps.get(this).vendorId; }
    set vendorId(vendorId) { _itemProps.get(this).vendorId = vendorId; }

    get purchaseMode() { return _itemProps.get(this).purchaseMode; }
    set purchaseMode(purchaseMode) { _itemProps.get(this).purchaseMode = purchaseMode; }
    
    get expDate() { return _itemProps.get(this).expDate; }
    set expDate(expDate) { _itemProps.get(this).expDate = expDate; }

    get cashPurchaseAmount() { return numeral(_itemProps.get(this).cashPurchaseAmount).format('₦0,0.00'); }
    set cashPurchaseAmount(cashPurchaseAmount) { _itemProps.get(this).cashPurchaseAmount = cashPurchaseAmount; }
    
    get pkgName() { return _itemProps.get(this).pkgName; }
    set pkgName(pkgName) { _itemProps.get(this).pkgName = pkgName; }
    
    get pkg() { return _itemProps.get(this).pkg }
    set pkg(pkg) { 
        _itemProps.get(this).pkg = pkg;
        _itemProps.get(this).pkgId = pkg.id;
        _itemProps.get(this).pkgName = pkg.name;
        _itemProps.get(this).qtyType = pkg.name;
    }
    
    get vendorName() { return _itemProps.get(this).vendorName }
    set vendorName(vendorName) { _itemProps.get(this).vendorName = vendorName }
    
    get vendor() { return _itemProps.get(this).vendor }
    set vendor(vendor) { 
        _itemProps.get(this).vendor = vendor;
        _itemProps.get(this).vendorId = vendor.id;
        _itemProps.get(this).vendorName = vendor.name;
    }
    
    get tractName() { return _itemProps.get(this).tractName }
    set tractName(tractName) { _itemProps.get(this).tractName = tractName }
    
    get tract() { return _itemProps.get(this).tract }
    set tract(tract) { 
        _itemProps.get(this).tract = tract;
        _itemProps.get(this).tractId = tract.id;
        _itemProps.get(this).tractName = tract.name;
    }

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
            cashPurchaseAmount: numeral(this.cashPurchaseAmount).value(),
            expDate: this.expDate,
            pkgSalesPrice: numeral(this.pkgSalesPrice).value(),
            unitSalesPrice: numeral(this.unitSalesPrice).value(),
            pkgStockPrice: numeral(this.pkgStockPrice).value(),
            unitStockPrice: numeral(this.unitStockPrice).value(),
        }
    }
}

//  private helper function to calculate purchase amount
const calcPurchaseAmount = (itemProps) => {
    return itemProps.qtyType.toLowerCase() === "unit" ? 
        numeral(itemProps.qty).multiply(itemProps.unitStockPrice).format('₦0,0.00') :
        numeral(itemProps.qty).multiply(itemProps.qtyPerPkg).multiply(itemProps.unitStockPrice).format('₦0,0.00'); 
}