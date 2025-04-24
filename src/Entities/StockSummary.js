import numeral from "numeral";

const _stockSummaryProps = new WeakMap();

export class StockSummary {
    constructor(jsonObject) {
        if (jsonObject) {
            _stockSummaryProps.set(this, {
                id: jsonObject.itemId,
                itemName: jsonObject.itemName,
                totalQty: jsonObject.totalQty,
                storeQty: jsonObject.storeQty,
                salesQty: jsonObject.salesQty,
                avgStockPrice: jsonObject.stockPrice,
            });
        }else {
            _stockSummaryProps.set(this, {});
        }
    }

    get id() { return _stockSummaryProps.get(this).id; }
    set id(id) { _stockSummaryProps.get(this).id = id }
    
    get itemName() { return _stockSummaryProps.get(this).itemName }
    set itemName(name) { _stockSummaryProps.get(this).itemName = name }
    
    get totalQty() { return _stockSummaryProps.get(this).totalQty }
    set totalQty(totalQty) { _stockSummaryProps.get(this).totalQty = totalQty }
    
    get storeQty() { return _stockSummaryProps.get(this).storeQty }
    set storeQty(storeQty) { _stockSummaryProps.get(this).storeQty = storeQty }
    
    get salesQty() { return _stockSummaryProps.get(this).salesQty }
    set salesQty(salesQty) { _stockSummaryProps.get(this).salesQty = salesQty }
    
    get avgStockPrice() { return _stockSummaryProps.get(this).avgStockPrice }
    set avgStockPrice(avgStockPrice) { _stockSummaryProps.get(this).avgStockPrice = avgStockPrice }
    
    get totalStockPrice() { return numeral(_stockSummaryProps.get(this).avgStockPrice).multiply(_stockSummaryProps.get(this).totalQty).value(); }

    toJSON(){
        return {
            id: this.id,
            itemName: this.itemName,
            totalQty: this.totalQty,
            salesQty: this.salesQty,
            storeQty: this.storeQty,
            avgStockPrice: this.avgStockPrice,
            totalStockPrice: this.totalStockPrice,
        }
    }
}