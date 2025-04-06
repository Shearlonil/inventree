import { format } from "date-fns";

const _ledgerProps = new WeakMap();

export class Ledger {
    constructor(jsonObject) {
        if (jsonObject) {
            const { id, name, ledgerBalance, mode, discount, allowCreditSales, creationDate, isDefault } = jsonObject;
            _ledgerProps.set(this, {
                id, name, ledgerBalance, discount, allowCreditSales, creationDate, mode, isDefault
            });
        }else {
            _ledgerProps.set(this, {});
        }
    }

    get id() { return _ledgerProps.get(this).id; }
    set id(id) { _ledgerProps.get(this).id = id }

    get name() { return _ledgerProps.get(this).name; }
    set name(name) { _ledgerProps.get(this).name = name }

    get creator() { return _ledgerProps.get(this).creator; }
    set creator(creator) { _ledgerProps.get(this).creator = creator }

    get ledgerBalance() { return _ledgerProps.get(this).ledgerBalance }
    set ledgerBalance(name) { _ledgerProps.get(this).ledgerBalance = name }

    get discount() { return _ledgerProps.get(this).discount ? _ledgerProps.get(this).discount : 0; }
    set discount(discount) { _ledgerProps.get(this).discount = discount }

    get mode() { return _ledgerProps.get(this).mode; }
    set mode(mode) { _ledgerProps.get(this).mode = mode }

    get status() { return _ledgerProps.get(this).status; }
    set status(status) { _ledgerProps.get(this).status = status }

    get isDefault() { return _ledgerProps.get(this).isDefault; }
    set isDefault(isDefault) { _ledgerProps.get(this).isDefault = isDefault }
    
    get allowCreditSales() { return _ledgerProps.get(this).allowCreditSales }
    set allowCreditSales(allowCreditSales) { _ledgerProps.get(this).allowCreditSales = allowCreditSales }
    
    get creationDate() { return _ledgerProps.get(this).creationDate ? format(_ledgerProps.get(this).creationDate, 'dd/MM/yyyy HH:mm:ss') : ''; }
    set creationDate(creationDate) { _ledgerProps.get(this).creationDate = creationDate }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            ledgerBalance: this.ledgerBalance,
            discount: this.discount,
            allowCreditSales: this.allowCreditSales,
            creationDate: this.creationDate,
            mode: this.mode,
            isDefault: this.isDefault,
            status: this.status,
            creator: this.creator,
        }
    }
}