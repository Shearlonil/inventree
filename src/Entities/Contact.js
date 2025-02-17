import { Ledger } from './Ledger';
const contactProps = new WeakMap();

export class Contact {
    constructor(jsonObject) {
        const { id, name, address, phoneNo, email, loyaltyCardNo, status, ledger, dateOfReg } = jsonObject;
        contactProps.set(this, {
            id, name, address, phoneNo, email, loyaltyCardNo, status, dateOfReg, 
            ledger: ledger ? new Ledger(ledger) : null,
        });
    }

    get id() { return contactProps.get(this).id; }
    set id(id) { contactProps.get(this).id = id }

    get name() { return contactProps.get(this).name; }
    set name(name) { contactProps.get(this).name = name }

    get address() { return contactProps.get(this).address }
    set address(address) { contactProps.get(this).address = address }

    get phoneNo() { return contactProps.get(this).phoneNo; }
    set phoneNo(phoneNo) { contactProps.get(this).phoneNo = phoneNo }
    
    get email() { return contactProps.get(this).email }
    set email(email) { contactProps.get(this).email = email }
    
    get loyaltyCardNo() { return contactProps.get(this).loyaltyCardNo }
    set loyaltyCardNo(loyaltyCardNo) { contactProps.get(this).loyaltyCardNo = loyaltyCardNo }

    get status() { return contactProps.get(this).status }
    set status(status) { contactProps.get(this).status = status }
    
    get dateOfReg() { return contactProps.get(this).dateOfReg }
    set dateOfReg(dateOfReg) { contactProps.get(this).dateOfReg = dateOfReg }

    get ledger() { return contactProps.get(this).ledger; }
    set ledger(ledger) { contactProps.get(this).ledger = ledger }

    get ledgerBalance() { return contactProps.get(this).ledger?.ledgerBalance; }

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