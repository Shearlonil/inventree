import { format } from "date-fns";
import numeral from "numeral";

const _summaryProps = new WeakMap();

export class SalesRecordSummary {
    constructor(jsonObject) {
        if (jsonObject) {
            _summaryProps.set(this, {
                id: jsonObject.item_id,
                packStock: jsonObject.pack_stock,
                unitStock: jsonObject.unit_stock,
                price: jsonObject.price,
                qty: jsonObject.qty,
                qtyType: jsonObject.qty_type,
                itemName: jsonObject.item_name,
                itemDiscount: jsonObject.item_discount ? jsonObject.item_discount : 0,
            });
        }else {
            _summaryProps.set(this, {});
        }
    }

    get id() { return _summaryProps.get(this).id; }
    set id(id) { _summaryProps.get(this).id = id }
    
    get itemName() { return _summaryProps.get(this).itemName }
    set itemName(name) { _summaryProps.get(this).itemName = name }
    
    get qty() { return _summaryProps.get(this).qty }
    set qty(qty) { _summaryProps.get(this).qty = qty }

    get qtyType() { return _summaryProps.get(this).qtyType }
    set qtyType(qtyType) { _summaryProps.get(this).qtyType = qtyType }

    get price() { return _summaryProps.get(this).price }
    set price(price) { _summaryProps.get(this).price = price }
    
    get unitStockPrice() { return _summaryProps.get(this).unitStock }
    set unitStockPrice(unitStockPrice) { _summaryProps.get(this).unitStock = unitStockPrice }
    
    get pkgStockPrice() { return _summaryProps.get(this).packStock }
    set pkgStockPrice(pkgStockPrice) { _summaryProps.get(this).packStock = pkgStockPrice }

    get itemDiscount() { return _summaryProps.get(this).itemDiscount; }
    set itemDiscount(itemDiscount) { _summaryProps.get(this).itemDiscount = itemDiscount }
    
    get totalAmount() {
        const tempAmount = numeral(_summaryProps.get(this).qty).multiply(_summaryProps.get(this).price).value();
        const tempDisc = numeral(_summaryProps.get(this).qty).multiply(_summaryProps.get(this).itemDiscount).value();
        return numeral(tempAmount).subtract(tempDisc).value();
    }
    
    get profit() {
        const tempAmount = numeral(_summaryProps.get(this).qty).multiply(_summaryProps.get(this).unitStock).value();
        return numeral(this.totalAmount).subtract(tempAmount).value();
    }

    toJSON(){
        return {
            id: this.id,
            itemName: this.itemName,
            qty: this.qty,
            qtyType: this.qtyType,
            itemDiscount: this.itemDiscount,
            price: this.price,
            pkgStockPrice: this.pkgStockPrice,
            unitStockPrice: this.unitStockPrice,
        }
    }
}