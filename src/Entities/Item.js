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
                unitSalesLowQty: jsonObject.unitSalesLowQty, //sales low qty from back end
                qty: jsonObject.qty,
                qtyType: jsonObject.qtyType, // for table display in store related activities
                lowQty: jsonObject.lowQty, //   setting low qty for either unit sales or store
                //  also for table display in store related activities
                sectionName: tract ? tract.tractName : jsonObject.sectionName, 
                //  storeQty: jsonObject.storeQty,
                storeLowQty: jsonObject.storeLowQty, // store low qty from back end in unit
                qtyPerPack: jsonObject.qtyPerPack,
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

    get unitSalesLowQty() { return _itemProps.get(this).unitSalesLowQty; }
    set unitSalesLowQty(lowQty) { _itemProps.get(this).unitSalesLowQty = lowQty }
    
    get qty() { return _itemProps.get(this).qty }
    set qty(qty) { _itemProps.get(this).qty = qty }
    
    get qtyType() { return _itemProps.get(this).qtyType }
    set qtyType(qtyType) { _itemProps.get(this).qtyType = qtyType }

    get lowQty() { return _itemProps.get(this).lowQty }
    set lowQty(lowQty) { _itemProps.get(this).lowQty = lowQty }
    
    get sectionName() { return _itemProps.get(this).sectionName }
    set sectionName(sectionName) { _itemProps.get(this).sectionName = sectionName }

    get pkgName() { return _itemProps.get(this).pkgName; }
    set pkgName(pkgName) { _itemProps.get(this).pkgName = pkgName }
    
    get storeLowQty() { return _itemProps.get(this).storeLowQty }
    set storeLowQty(storeLowQty) { _itemProps.get(this).storeLowQty = storeLowQty }

    get qtyPerPack() { return _itemProps.get(this).qtyPerPack; }
    set qtyPerPack(qtyPerPack) { _itemProps.get(this).qtyPerPack = qtyPerPack }
    
    get status() { return _itemProps.get(this).status }
    set status(status) { _itemProps.get(this).status = status }

    get creationDate() { return _itemProps.get(this).creationDate; }
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
            unitSalesLowQty: this.unitSalesLowQty,
            qty: this.qty,
            qtyType: this.qtyType,
            lowQty: this.lowQty,
            // storeQty: this.storeQty,
            storeLowQty: this.storeLowQty,
            qtyPerPack: this.qtyPerPack,
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