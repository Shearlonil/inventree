const _itemProps = new WeakMap();

export class DispensaryItem {
    constructor(jsonObject) {
        if (jsonObject) {
            _itemProps.set(this, {
                id: jsonObject.id,
                name: jsonObject.itemName,
                unitQty: jsonObject.dtoQtyMgrs.reduce((accumulator, currentValue) => accumulator + currentValue.unitStoreQty, 0),
                pkgQty: jsonObject.dtoQtyMgrs.reduce((accumulator, currentValue) => accumulator + (currentValue.unitStoreQty / currentValue.qtyPerPkg), 0),
                qtyType: jsonObject.qtyType,
                creationDate: jsonObject.creationDate,
            });
        }else {
            _itemProps.set(this, {});
        }
    }

    get id() { return _itemProps.get(this).id; }
    set id(id) { _itemProps.get(this).id = id }
    
    get name() { return _itemProps.get(this).name }
    set name(name) { _itemProps.get(this).name = name }
    
    get unitQty() { return _itemProps.get(this).unitQty }
    set unitQty(unitQty) { _itemProps.get(this).unitQty = unitQty }
    
    // get qtyType() { return _itemProps.get(this).qtyType }
    // set qtyType(qtyType) { _itemProps.get(this).qtyType = qtyType }

    get pkgQty() { return _itemProps.get(this).pkgQty; }
    set pkgQty(pkgQty) { _itemProps.get(this).pkgQty = pkgQty }

    get creationDate() { return _itemProps.get(this).creationDate; }
    set creationDate(creationDate) { _itemProps.get(this).creationDate = creationDate }

    toJSON(){
        return {
            id: this.id,
            name: this.name,
            qty: this.qty,
            // qtyType: this.qtyType,
            pkgQty: this.pkgQty,
            creationDate: this.creationDate,
        }
    }
}