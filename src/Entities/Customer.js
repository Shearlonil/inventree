import { Ledger } from './Ledger';
const _customerProps = new WeakMap();

export class Customer {
    constructor(jsonObject) {
        const { id, customerName, address, phoneNo, email, loyaltyCardNo, status, ledger, dateOfReg } = jsonObject;
        _customerProps.set(this, {
            id, name: customerName, address, phoneNo, email, loyaltyCardNo, status, dateOfReg, 
            ledger: ledger ? new Ledger(ledger) : null,
        });
    }

    get id() { return _customerProps.get(this).id; }
    set id(id) { _customerProps.get(this).id = id }

    get name() { return _customerProps.get(this).name; }
    set name(name) { _customerProps.get(this).name = name }

    get address() { return _customerProps.get(this).address }
    set address(address) { _customerProps.get(this).address = address }

    get phoneNo() { return _customerProps.get(this).phoneNo; }
    set phoneNo(phoneNo) { _customerProps.get(this).phoneNo = phoneNo }
    
    get email() { return _customerProps.get(this).email }
    set email(email) { _customerProps.get(this).email = email }
    
    get loyaltyCardNo() { return _customerProps.get(this).loyaltyCardNo }
    set loyaltyCardNo(loyaltyCardNo) { _customerProps.get(this).loyaltyCardNo = loyaltyCardNo }

    get status() { return _customerProps.get(this).status }
    set status(status) { _customerProps.get(this).status = status }
    
    get dateOfReg() { return _customerProps.get(this).dateOfReg }
    set dateOfReg(dateOfReg) { _customerProps.get(this).dateOfReg = dateOfReg }

    get ledger() { return _customerProps.get(this).ledger; }
    set ledger(ledger) { _customerProps.get(this).ledger = ledger }

    get ledgerBalance() { return _customerProps.get(this).ledger?.ledgerBalance; }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            address: this.address,
            phoneNo: this.phoneNo,
            email: this.email,
            loyaltyCardNo: this.loyaltyCardNo,
            status: this.status,
            dateOfReg: this.dateOfReg,
        }
    }
}