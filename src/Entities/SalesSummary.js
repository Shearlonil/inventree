import { format } from "date-fns";
import numeral from "numeral";

const _salesSummaryProps = new WeakMap();

export class SalesSummary {
    constructor(jsonObject) {
        if (jsonObject) {
            _salesSummaryProps.set(this, {
                id: jsonObject.id,
                itemName: jsonObject.itemName,
                totalQty: jsonObject.totalQty,
                storeQty: jsonObject.storeQty,
                salesQty: jsonObject.salesQty,
                soldOutQty: jsonObject.soldOutQty,
                avgSalesPrice: jsonObject.avgSalesPrice,
                avgStockPrice: jsonObject.avgStockPrice,
            });
        }else {
            _salesSummaryProps.set(this, {});
        }
    }

    get id() { return _salesSummaryProps.get(this).id; }
    set id(id) { _salesSummaryProps.get(this).id = id }
    
    get itemName() { return _salesSummaryProps.get(this).itemName }
    set itemName(name) { _salesSummaryProps.get(this).itemName = name }
    
    get totalQty() { return _salesSummaryProps.get(this).totalQty }
    set totalQty(totalQty) { _salesSummaryProps.get(this).totalQty = totalQty }
    
    get storeQty() { return _salesSummaryProps.get(this).storeQty }
    set storeQty(storeQty) { _salesSummaryProps.get(this).storeQty = storeQty }
    
    
    get salesQty() { return _salesSummaryProps.get(this).salesQty }
    set salesQty(salesQty) { _salesSummaryProps.get(this).salesQty = salesQty }
    
    get soldOutQty() { return _salesSummaryProps.get(this).soldOutQty; }
    set soldOutQty(soldOutQty) { _salesSummaryProps.get(this).soldOutQty = soldOutQty }
    
    get avgSalesPrice() { return _salesSummaryProps.get(this).avgSalesPrice; }
    set avgSalesPrice(avgSalesPrice) { _salesSummaryProps.get(this).avgSalesPrice = avgSalesPrice }
    
    get avgStockPrice() { return _salesSummaryProps.get(this).avgStockPrice }
    set avgStockPrice(avgStockPrice) { _salesSummaryProps.get(this).avgStockPrice = avgStockPrice }
    
    get unitSalesPrice() { return _salesSummaryProps.get(this).unitSalesPrice; }
    set unitSalesPrice(unitSalesPrice) { _salesSummaryProps.get(this).unitSalesPrice = unitSalesPrice }
    
    get unitStockPrice() { return _salesSummaryProps.get(this).unitStockPrice }
    set unitStockPrice(unitStockPrice) { _salesSummaryProps.get(this).unitStockPrice = unitStockPrice }
    
    get pkgQty() { return numeral(_salesSummaryProps.get(this).qty).divide(_salesSummaryProps.get(this).soldOutQty).format('0,0.00'); }

    toJSON(){
        return {
            id: this.id,
            itemName: this.itemName,
            totalQty: this.totalQty,
            salesQty: this.salesQty,
            storeQty: this.storeQty,
            soldOutQty: this.soldOutQty,
            avgSalesPrice: this.avgSalesPrice,
            avgStockPrice: this.avgStockPrice,
            unitSalesPrice: this.unitSalesPrice,
            unitStockPrice: this.unitStockPrice,
        }
    }
}