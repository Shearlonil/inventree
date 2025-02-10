import numeral from "numeral";

const _itemProps = new WeakMap();

export class TransactionItem {
    constructor(jsonObject) {
        _itemProps.set(this, {
            id: jsonObject.product.value.id,
            name: jsonObject.product.value.itemName,
            unitSalesPrice: jsonObject.product.value.unitSalesPrice,
            pkgSalesPrice: jsonObject.product.value.pkgSalesPrice,
            qty: jsonObject.qty,
            qtyType: jsonObject.qty_type,
            discount: jsonObject.item_disc,
            itemDiscountType: jsonObject.item_disc_type,
            // itemSoldOutPrice: jsonObject.itemSoldOutPrice,
        });
    }

    get id() { return _itemProps.get(this).id; }
    set id(id) { _itemProps.get(this).id = id }
    
    get name() { return _itemProps.get(this).name }
    set name(name) { _itemProps.get(this).name = name }
    
    get qty() { return _itemProps.get(this).qty }
    set qty(qty) { _itemProps.get(this).qty = qty }
    
    get qtyType() { return _itemProps.get(this).qtyType }
    set qtyType(qtyType) { _itemProps.get(this).qtyType = qtyType }

    get discount() { return _itemProps.get(this).discount; }
    set discount(discount) { _itemProps.get(this).discount = discount }

    get itemDiscountType() { return _itemProps.get(this).itemDiscountType; }
    set itemDiscountType(itemDiscountType) { _itemProps.get(this).itemDiscountType = itemDiscountType }

    get itemSoldOutPrice() { return _itemProps.get(this).itemSoldOutPrice; }
    set itemSoldOutPrice(itemSoldOutPrice) { _itemProps.get(this).itemSoldOutPrice = itemSoldOutPrice }

    get totalAmount() {
        // calculate purchase total from qty, qtyType, {pkgSalesPrice || unitSalesPrice}
        return calcTotalAmount(_itemProps.get(this));
    }

    toJSON(){
        return {
            itemID: this.id,
            name: this.name,
            qty: this.qty,
            qtyType: this.qtyType,
            discount: this.discount,
            itemDiscountType: this.itemDiscountType,
            itemSoldOutPrice: this.itemSoldOutPrice,
        }
    }
}

//  private helper function to calculate total amount
const calcTotalAmount = (itemProps) => {
    const temp = itemProps.qtyType.toLowerCase() === "unit" ? 
        numeral(itemProps.qty).multiply(itemProps.unitSalesPrice).format('₦0,0.00') :
        numeral(itemProps.qty).multiply(itemProps.pkgSalesPrice).format('₦0,0.00'); 
}