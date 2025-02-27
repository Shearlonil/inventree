
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
                qtyPerPack: jsonObject.qtyPerPack,
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
    
    get qtyPerPack() { return _qtyManagerProps.get(this).qtyPerPack }
    set qtyPerPack(qtyPerPack) { _qtyManagerProps.get(this).qtyPerPack = qtyPerPack }
    
    // calculate sales quantity for pack using unitSalesQty and qtyPerPack
    get packSalesQty() { return _qtyManagerProps.get(this).unitSalesQty / _qtyManagerProps.get(this).qtyPerPack }
    
    // calculate store quantity for pack using unitStoreQty and qtyPerPack
    get packStoreQty() { return _qtyManagerProps.get(this).unitStoreQty / _qtyManagerProps.get(this).qtyPerPack }
    
    get creationDate() { return _qtyManagerProps.get(this).creationDate }
    set creationDate(creationDate) { _qtyManagerProps.get(this).creationDate = creationDate }
    
    get expDate() { return _qtyManagerProps.get(this).expDate }
    set expDate(expDate) { _qtyManagerProps.get(this).expDate = expDate }
    
    get packStockPrice() { return _qtyManagerProps.get(this).packStockPrice }
    set packStockPrice(packStockPrice) { _qtyManagerProps.get(this).packStockPrice = packStockPrice }

    get unitStockPrice() { return _qtyManagerProps.get(this).unitStockPrice; }
    set unitStockPrice(unitStockPrice) { _qtyManagerProps.get(this).unitStockPrice = unitStockPrice }
    
    get item() { return _qtyManagerProps.get(this).item }
    set item(item) { _qtyManagerProps.get(this).item = item }

    toJSON(){
        return {
            id: this.id,
            unitStoreQty: this.unitStoreQty,
            unitSalesQty: this.unitSalesQty,
            qtyPerPack: this.qtyPerPack,
            creationDate: this.creationDate,
            expDate: this.expDate,
            packStockPrice: this.packStockPrice,
            unitStockPrice: this.unitStockPrice,
        }
    }
}