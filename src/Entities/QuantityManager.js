
import numeral from 'numeral';
import { Item } from './Item';
const _qtyManagerProps = new WeakMap();

export class QuantityManager{
    constructor(jsonObject) {
        if (jsonObject) {
            const { stockPriceManager, item } = jsonObject;
            _qtyManagerProps.set(this, {
                id: jsonObject.id,
                unitStoreQty: jsonObject.unitStoreQty,
                unitSalesQty: jsonObject.unitSalesQty,
                qtyPerPackage: jsonObject.qtyPerPackage,
                creationDate: jsonObject.creationDate,
                expDate: jsonObject.expDate,
                packStockPrice: stockPriceManager?.packStockPrice,
                unitStockPrice: stockPriceManager?.unitStockPrice,
                item: item ? new Item(item) : null
            });
        }else {
            _qtyManagerProps.set(this, {});
        }
    }

    get id() { return _qtyManagerProps.get(this).id; }
    set id(id) { _qtyManagerProps.get(this).id = id }

    get unitStoreQty() { return _qtyManagerProps.get(this).unitStoreQty; }
    set unitStoreQty(unitStoreQty) { _qtyManagerProps.get(this).unitStoreQty = unitStoreQty }
    
    get unitSalesQty() { return _qtyManagerProps.get(this).unitSalesQty }
    set unitSalesQty(unitSalesQty) { _qtyManagerProps.get(this).unitSalesQty = unitSalesQty }
    
    get qtyPerPackage() { return _qtyManagerProps.get(this).qtyPerPackage }
    set qtyPerPackage(qtyPerPackage) { _qtyManagerProps.get(this).qtyPerPackage = qtyPerPackage }
    
    // calculate sales quantity for pack using unitSalesQty and qtyPerPackage
    get packSalesQty() { return numeral(_qtyManagerProps.get(this).unitSalesQty).divide(_qtyManagerProps.get(this).qtyPerPackage).format('₦0,0.00') }
    
    // calculate store quantity for pack using unitStoreQty and qtyPerPackage
    get packStoreQty() { return numeral(_qtyManagerProps.get(this).unitStoreQty).divide(_qtyManagerProps.get(this).qtyPerPackage).format('₦0,0.00') }
    
    get creationDate() { return _qtyManagerProps.get(this).creationDate }
    set creationDate(creationDate) { _qtyManagerProps.get(this).creationDate = creationDate }
    
    get expDate() { return _qtyManagerProps.get(this).expDate }
    set expDate(expDate) { _qtyManagerProps.get(this).expDate = expDate }
    
    get packStockPrice() { return numeral(_qtyManagerProps.get(this).packStockPrice).format('₦0,0.00') }
    set packStockPrice(packStockPrice) { _qtyManagerProps.get(this).packStockPrice = packStockPrice }

    get unitStockPrice() { return numeral(_qtyManagerProps.get(this).unitStockPrice).format('₦0,0.00'); }
    set unitStockPrice(unitStockPrice) { _qtyManagerProps.get(this).unitStockPrice = unitStockPrice }
    
    get outpostName() { return _qtyManagerProps.get(this).outpostName }
    set outpostName(outpostName) { _qtyManagerProps.get(this).outpostName = outpostName }
    
    get item() { return _qtyManagerProps.get(this).item }
    set item(item) { _qtyManagerProps.get(this).item = item }
    
    //  only for the purpose of displaying in tree table
    get children() { return _qtyManagerProps.get(this).children }
    set children(children) { _qtyManagerProps.get(this).children = children }
    
    //  only for the purpose of displaying in treee table. Indicate if total sum of outpost sales qty equals qty mgr sales qty
    get faultFlag() { return _qtyManagerProps.get(this).faultFlag }
    set faultFlag(faultFlag) { _qtyManagerProps.get(this).faultFlag = faultFlag }

    toJSON(){
        return {
            id: this.id,
            unitStoreQty: this.unitStoreQty,
            unitSalesQty: this.unitSalesQty,
            qtyPerPackage: this.qtyPerPackage,
            creationDate: this.creationDate,
            expDate: this.expDate,
            packStockPrice: this.packStockPrice,
            unitStockPrice: this.unitStockPrice,
            outpostName: this.outpostName,
            packSalesQty: this.packSalesQty,
            packStoreQty: this.packStoreQty,
            children: this.children,
            faultFlag: this.faultFlag,
        }
    }
}