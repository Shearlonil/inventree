import { Ledger } from './Ledger';
const _contactProps = new WeakMap();

export class Contact {
    constructor(jsonObject) {
        if (jsonObject) {
            const { id, name, address, phoneNo, email, loyaltyCardNo, status, ledger, dateOfReg } = jsonObject;
            _contactProps.set(this, {
                id, name, address, phoneNo, email, loyaltyCardNo, status, dateOfReg, 
                ledger: ledger ? new Ledger(ledger) : null,
            });
        }else {
            _contactProps.set(this, {});
        }
    }

    get id() { return _contactProps.get(this).id; }
    set id(id) { _contactProps.get(this).id = id }

    get name() { return _contactProps.get(this).name; }
    set name(name) { _contactProps.get(this).name = name }

    get address() { return _contactProps.get(this).address }
    set address(address) { _contactProps.get(this).address = address }

    get phoneNo() { return _contactProps.get(this).phoneNo; }
    set phoneNo(phoneNo) { _contactProps.get(this).phoneNo = phoneNo }
    
    get email() { return _contactProps.get(this).email }
    set email(email) { _contactProps.get(this).email = email }
    
    get loyaltyCardNo() { return _contactProps.get(this).loyaltyCardNo }
    set loyaltyCardNo(loyaltyCardNo) { _contactProps.get(this).loyaltyCardNo = loyaltyCardNo }

    get status() { return _contactProps.get(this).status }
    set status(status) { _contactProps.get(this).status = status }
    
    get dateOfReg() { return _contactProps.get(this).dateOfReg }
    set dateOfReg(dateOfReg) { _contactProps.get(this).dateOfReg = dateOfReg }

    get ledger() { return _contactProps.get(this).ledger; }
    set ledger(ledger) { _contactProps.get(this).ledger = ledger }

    get ledgerBalance() { return _contactProps.get(this).ledger?.ledgerBalance; }

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