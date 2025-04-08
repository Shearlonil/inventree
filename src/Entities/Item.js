import { format } from "date-fns";
import numeral from "numeral";

const _itemProps = new WeakMap();

export class Item {
    constructor(jsonObject) {
        if (jsonObject) {
            const { salesPrice, tract } = jsonObject;
            _itemProps.set(this, {
                id: jsonObject.id,
                itemName: jsonObject.itemName,
                barcode: jsonObject.barcode,
                qty: jsonObject.qty,
                qtyType: jsonObject.qtyType, // for table display in store related activities
                restockLevel: jsonObject.restockLevel, //   setting low qty for either unit sales or store
                //  also for table display in store related activities
                tractName: tract ? tract.tractName : jsonObject.sectionName, 
                qtyPerPkg: jsonObject.qtyPerPkg,
                status: jsonObject.status,
                creationDate: jsonObject.creationDate,
                expDate: jsonObject.expDate,
                pkgSalesPrice: salesPrice?.pkgSalesPrice,
                pkgStockPrice: salesPrice?.pkgStockPrice,
                unitSalesPrice: salesPrice?.unitSalesPrice,
                unitStockPrice: salesPrice?.unitStockPrice,
            });
        }else {
            _itemProps.set(this, {});
        }
    }

    get id() { return _itemProps.get(this).id; }
    set id(id) { _itemProps.get(this).id = id }
    
    get itemName() { return _itemProps.get(this).itemName }
    set itemName(name) { _itemProps.get(this).itemName = name }
    
    get barcode() { return _itemProps.get(this).barcode }
    set barcode(code) { _itemProps.get(this).barcode = code }
    
    get qty() { return _itemProps.get(this).qty }
    set qty(qty) { _itemProps.get(this).qty = qty }
    
    //  useful when displaying gross items
    get storeQty() { return _itemProps.get(this).storeQty }
    set storeQty(storeQty) { _itemProps.get(this).storeQty = storeQty }
    
    get pkgQty() { return numeral(_itemProps.get(this).qty).divide(_itemProps.get(this).qtyPerPkg).format('0,0.00'); }

    get qtyType() { return _itemProps.get(this).qtyType }
    set qtyType(qtyType) { _itemProps.get(this).qtyType = qtyType }

    get restockLevel() { return _itemProps.get(this).restockLevel }
    set restockLevel(restockLevel) { _itemProps.get(this).restockLevel = restockLevel }
    
    get tractName() { return _itemProps.get(this).tractName }
    set tractName(tractName) { _itemProps.get(this).tractName = tractName }

    get pkgName() { return _itemProps.get(this).pkgName; }
    set pkgName(pkgName) { _itemProps.get(this).pkgName = pkgName }

    get qtyPerPkg() { return _itemProps.get(this).qtyPerPkg; }
    set qtyPerPkg(qtyPerPkg) { _itemProps.get(this).qtyPerPkg = qtyPerPkg }
    
    get status() { return _itemProps.get(this).status }
    set status(status) { _itemProps.get(this).status = status }

    get creationDate() { return _itemProps.get(this).creationDate ? format(_itemProps.get(this).creationDate, 'dd/MM/yyyy HH:mm:ss') : ''; }
    set creationDate(creationDate) { _itemProps.get(this).creationDate = creationDate }
    
    get expDate() { return _itemProps.get(this).expDate }
    set expDate(expDate) { _itemProps.get(this).expDate = expDate }

    get pkgSalesPrice() { return _itemProps.get(this).pkgSalesPrice; }
    set pkgSalesPrice(pkgSalesPrice) { _itemProps.get(this).pkgSalesPrice = pkgSalesPrice }
    
    get pkgStockPrice() { return _itemProps.get(this).pkgStockPrice }
    set pkgStockPrice(pkgStockPrice) { _itemProps.get(this).pkgStockPrice = pkgStockPrice }

    get unitSalesPrice() { return _itemProps.get(this).unitSalesPrice; }
    set unitSalesPrice(unitSalesPrice) { _itemProps.get(this).unitSalesPrice = unitSalesPrice }
    
    get unitStockPrice() { return _itemProps.get(this).unitStockPrice }
    set unitStockPrice(unitStockPrice) { _itemProps.get(this).unitStockPrice = unitStockPrice }

    toJSON(){
        return {
            id: this.id,
            itemName: this.itemName,
            barcode: this.barcode,
            qty: this.qty,
            qtyType: this.qtyType,
            restockLevel: this.restockLevel,
            storeQty: this.storeQty,
            qtyPerPkg: this.qtyPerPkg,
            status: this.status,
            creationDate: this.creationDate,
            expDate: this.expDate,
            pkgSalesPrice: this.pkgSalesPrice,
            unitSalesPrice: this.unitSalesPrice,
            pkgStockPrice: this.pkgStockPrice,
            unitStockPrice: this.unitStockPrice,
            //  adding these because of document (pdf and xlsx) export
            tractName: this.tractName,
            pkgName: this.pkgName,
            pkgQty: this.pkgQty,
        }
    }
}