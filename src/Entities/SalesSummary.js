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
                avgUnitSalesPrice: jsonObject.avgSalesPrice,
                avgUnitStockPrice: jsonObject.avgStockPrice,
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
    
    get avgUnitSalesPrice() { return _salesSummaryProps.get(this).avgUnitSalesPrice; }
    set avgUnitSalesPrice(avgUnitSalesPrice) { _salesSummaryProps.get(this).avgUnitSalesPrice = avgUnitSalesPrice }
    
    get avgUnitStockPrice() { return _salesSummaryProps.get(this).avgUnitStockPrice }
    set avgUnitStockPrice(avgUnitStockPrice) { _salesSummaryProps.get(this).avgUnitStockPrice = avgUnitStockPrice }
    
    get totalStockPrice() { return numeral(_salesSummaryProps.get(this).avgUnitStockPrice).multiply(_salesSummaryProps.get(this).soldOutQty).value(); }
    
    get totalSalesPrice() { return numeral(_salesSummaryProps.get(this).avgUnitSalesPrice).multiply(_salesSummaryProps.get(this).soldOutQty).value(); }
    
    get unitProfit() { return numeral(_salesSummaryProps.get(this).avgUnitSalesPrice).subtract(_salesSummaryProps.get(this).avgUnitStockPrice).value(); }
    
    get grossProfit() { return numeral(this.unitProfit).multiply(_salesSummaryProps.get(this).soldOutQty).value(); }
    
    toJSON(){
        return {
            id: this.id,
            itemName: this.itemName,
            totalQty: this.totalQty,
            salesQty: this.salesQty,
            storeQty: this.storeQty,
            soldOutQty: this.soldOutQty,
            avgUnitSalesPrice: this.avgUnitSalesPrice,
            avgUnitStockPrice: this.avgUnitStockPrice,
            totalStockPrice: this.totalStockPrice,
            totalSalesPrice: this.totalSalesPrice,
            unitProfit: this.unitProfit,
            grossProfit: this.grossProfit,
        }
    }
}