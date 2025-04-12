import { format } from "date-fns";
import numeral from "numeral";

const _summaryProps = new WeakMap();

export class SalesRecordSummary {
    constructor(jsonObject) {
        if (jsonObject) {
            _summaryProps.set(this, {
                id: jsonObject.item_id,
                packStock: jsonObject.pack_stock,
                stockPrice: jsonObject.unit_stock,
                price: jsonObject.price,
                qty: jsonObject.qty,
                qtyType: jsonObject.qty_type,
                qtyPerPkg: jsonObject.qty_per_package,
                itemName: jsonObject.item_name,
                itemDiscount: jsonObject.item_discount ? jsonObject.item_discount : 0,
            });
        }else {
            _summaryProps.set(this, {});
        }
    }

    get id() { return _summaryProps.get(this).id; }
    set id(id) { _summaryProps.get(this).id = id; }
    
    get itemName() { return _summaryProps.get(this).itemName; }
    set itemName(name) { _summaryProps.get(this).itemName = name; }
    
    get qty() { return _summaryProps.get(this).qty; }
    set qty(qty) { _summaryProps.get(this).qty = qty; }

    get qtyType() { return _summaryProps.get(this).qtyType; }
    set qtyType(qtyType) { _summaryProps.get(this).qtyType = qtyType; }

    get qtyPerPkg() { return _summaryProps.get(this).qtyPerPkg; }
    set qtyPerPkg(qtyPerPkg) { _summaryProps.get(this).qtyPerPkg = qtyPerPkg; }

    /*  holds either unit sales price or pack sales price. Depends on the qtyType.  */
    get price() { return _summaryProps.get(this).price; }
    set price(price) { _summaryProps.get(this).price = price; }
    
    /*  this holds either unit stock price or pack stock price. Depends on the qtyType. The pkgStockPrice is dummy, i believe   */
    get stockPrice() { return _summaryProps.get(this).stockPrice }
    set stockPrice(stockPrice) { _summaryProps.get(this).stockPrice = stockPrice }

    get itemDiscount() { return _summaryProps.get(this).itemDiscount; }
    set itemDiscount(itemDiscount) { _summaryProps.get(this).itemDiscount = itemDiscount; }
    
    /*  unitQty represents the quantity in units only. While qty above could be unit or pkg */
    get unitQty() { 
        return _summaryProps.get(this).qtyType.toLowerCase() === 'unit' ? 
            _summaryProps.get(this).qty : 
            numeral(_summaryProps.get(this).qty).multiply(_summaryProps.get(this).qtyPerPkg);
    }
    
    get unitStockPrice() { 
        return _summaryProps.get(this).qtyType.toLowerCase() === 'unit' ? 
            _summaryProps.get(this).stockPrice : 
           numeral(_summaryProps.get(this).stockPrice).divide(_summaryProps.get(this).qtyPerPkg).value();
    }
    
    get unitSalesPrice() { 
        return _summaryProps.get(this).qtyType.toLowerCase() === 'unit' ? 
            _summaryProps.get(this).price : 
           numeral(_summaryProps.get(this).price).divide(_summaryProps.get(this).qtyPerPkg).value();
    }
    
    get totalAmount() {
        return numeral(_summaryProps.get(this).qty).multiply(_summaryProps.get(this).price).value();
        /*
            NOTE:   price (itemSoldOutPrice) is already less item discount
            const tempAmount = numeral(_summaryProps.get(this).qty).multiply(_summaryProps.get(this).price).value();
            const tempDisc = numeral(_summaryProps.get(this).qty).multiply(_summaryProps.get(this).itemDiscount).value();
            return numeral(tempAmount).subtract(tempDisc).value();
        */
    }
    
    get profit() {
        const tempAmount = numeral(_summaryProps.get(this).qty).multiply(_summaryProps.get(this).stockPrice).value();
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
            unitStockPrice: this.unitStockPrice,
            stockPrice: this.stockPrice,
            unitQty: this.unitQty,
        }
    }
}