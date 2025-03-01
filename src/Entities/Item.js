import { format } from "date-fns";
import numeral from "numeral";

import { Tract } from './Tract';

const _itemProps = new WeakMap();

export class Item {
    constructor(jsonObject) {
        if (jsonObject) {
            const { salesPrice, tract } = jsonObject;
            _itemProps.set(this, {
                id: jsonObject.id,
                uuid: null, //  uuid here is used only for creating new items in store and not for items from db
                itemName: jsonObject.itemName,
                qty: jsonObject.qty,
                qtyType: jsonObject.qtyType, // for table display in store related activities
                restockLevel: jsonObject.restockLevel, //   setting low qty for either unit sales or store
                //  also for table display in store related activities
                tractName: tract ? tract.tractName : jsonObject.sectionName, 
                qtyPerPkg: jsonObject.qtyPerPkg,
                status: jsonObject.status,
                creationDate: jsonObject.creationDate,
                expDate: jsonObject.expDate,
                packSalesPrice: salesPrice?.packSalesPrice,
                packStockPrice: salesPrice?.packStockPrice,
                unitSalesPrice: salesPrice?.unitSalesPrice,
                unitStockPrice: salesPrice?.unitStockPrice,
                //  incase of store activities, tract will not be available
                tract: tract ? new Tract(tract) : null,
            });
        }else {
            _itemProps.set(this, {});
        }
    }

    get id() { return _itemProps.get(this).id; }
    set id(id) { _itemProps.get(this).id = id }

    get uuid() { return _itemProps.get(this).uuid; }
    set uuid(uuid) { _itemProps.get(this).uuid = uuid }
    
    get itemName() { return _itemProps.get(this).itemName }
    set itemName(name) { _itemProps.get(this).itemName = name }
    
    get qty() { return _itemProps.get(this).qty }
    set qty(qty) { _itemProps.get(this).qty = qty }
    
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

    get packSalesPrice() { return _itemProps.get(this).packSalesPrice; }
    set packSalesPrice(packSalesPrice) { _itemProps.get(this).packSalesPrice = packSalesPrice }
    
    get packStockPrice() { return _itemProps.get(this).packStockPrice }
    set packStockPrice(packStockPrice) { _itemProps.get(this).packStockPrice = packStockPrice }

    get unitSalesPrice() { return _itemProps.get(this).unitSalesPrice; }
    set unitSalesPrice(unitSalesPrice) { _itemProps.get(this).unitSalesPrice = unitSalesPrice }
    
    get unitStockPrice() { return _itemProps.get(this).unitStockPrice }
    set unitStockPrice(unitStockPrice) { _itemProps.get(this).unitStockPrice = unitStockPrice }
    
    get tract() { return _itemProps.get(this).tract }
    set tract(tract) { _itemProps.get(this).tract = tract }

    toJSON(){
        return {
            id: this.id,
            uuid: this.uuid,
            itemName: this.itemName,
            qty: this.qty,
            qtyType: this.qtyType,
            restockLevel: this.restockLevel,
            // storeQty: this.storeQty,
            qtyPerPkg: this.qtyPerPkg,
            status: this.status,
            creationDate: this.creationDate,
            expDate: this.expDate,
            packSalesPrice: this.packSalesPrice,
            unitSalesPrice: this.unitSalesPrice,
            packStockPrice: this.packStockPrice,
            unitStockPrice: this.unitStockPrice,
            tractId: this.tract?.id, // => will be null in case of stocking... new stock in Store
        }
    }
}