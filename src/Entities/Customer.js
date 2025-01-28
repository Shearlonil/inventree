import { Wallet } from './Wallet';
const _customerProps = new WeakMap();

export class Customer {
    constructor(jsonObject) {
        const { id, customerName, address, phoneNo, email, loyaltyCardNo, status, wallet, dateOfReg } = jsonObject;
        _customerProps.set(this, {
            id, customerName, address, phoneNo, email, loyaltyCardNo, status, dateOfReg, 
            wallet: wallet ? new Wallet(wallet) : null,
        });
    }

    get id() { return _customerProps.get(this).id; }
    set id(id) { _customerProps.get(this).id = id }

    get customerName() { return _customerProps.get(this).customerName; }
    set customerName(customerName) { _customerProps.get(this).customerName = customerName }

    get address() { return _customerProps.get(this).address }
    set address(name) { _customerProps.get(this).address = name }

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

    get wallet() { return _customerProps.get(this).wallet; }
    set wallet(wallet) { _customerProps.get(this).wallet = wallet }

    toJSON() {
        return {
            id: this.id,
            customerName: this.customerName,
            address: this.address,
            phoneNo: this.phoneNo,
            email: this.email,
            loyaltyCardNo: this.loyaltyCardNo,
            status: this.status,
            dateOfReg: this.dateOfReg,
            walletId: this.wallet?.id
        }
    }
}