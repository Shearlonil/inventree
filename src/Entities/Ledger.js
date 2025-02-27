const _ledgerProps = new WeakMap();

export class Ledger {
    constructor(jsonObject) {
        if (jsonObject) {
            const { id, name, ledgerBalance, discount, allowCreditSales, creationDate } = jsonObject;
            _ledgerProps.set(this, {
                id, name, ledgerBalance, discount, allowCreditSales, creationDate, 
            });
        }else {
            _ledgerProps.set(this, {});
        }
    }

    get id() { return _ledgerProps.get(this).id; }
    set id(id) { _ledgerProps.get(this).id = id }

    get name() { return _ledgerProps.get(this).name; }
    set name(name) { _ledgerProps.get(this).name = name }

    get ledgerBalance() { return _ledgerProps.get(this).ledgerBalance }
    set ledgerBalance(name) { _ledgerProps.get(this).ledgerBalance = name }

    get discount() { return _ledgerProps.get(this).discount; }
    set discount(discount) { _ledgerProps.get(this).discount = discount }
    
    get allowCreditSales() { return _ledgerProps.get(this).allowCreditSales }
    set allowCreditSales(allowCreditSales) { _ledgerProps.get(this).allowCreditSales = allowCreditSales }
    
    get creationDate() { return _ledgerProps.get(this).creationDate }
    set creationDate(creationDate) { _ledgerProps.get(this).creationDate = creationDate }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            ledgerBalance: this.ledgerBalance,
            discount: this.discount,
            allowCreditSales: this.allowCreditSales,
            creationDate: this.creationDate,
        }
    }
}