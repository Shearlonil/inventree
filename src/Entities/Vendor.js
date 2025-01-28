const _vendorProps = new WeakMap();

export class Vendor {
    constructor() {
        _vendorProps.set(this, {});
    }

    get id() { return _vendorProps.get(this).id; }
    set id(id) { _vendorProps.get(this).id = id }

    get name() { return _vendorProps.get(this).name; }
    set name(name) { _vendorProps.get(this).name = name }

    get address() { return _vendorProps.get(this).address }
    set address(name) { _vendorProps.get(this).address = name }

    get phoneNo() { return _vendorProps.get(this).phoneNo; }
    set phoneNo(phoneNo) { _vendorProps.get(this).phoneNo = phoneNo }
    
    get email() { return _vendorProps.get(this).email }
    set email(email) { _vendorProps.get(this).email = email }

    get status() { return _vendorProps.get(this).status }
    set status(status) { _vendorProps.get(this).status = status }
    
    get dateOfReg() { return _vendorProps.get(this).dateOfReg }
    set dateOfReg(dateOfReg) { _vendorProps.get(this).dateOfReg = dateOfReg }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            address: this.address,
            phoneNo: this.phoneNo,
            email: this.email,
            status: this.status,
            dateOfReg: this.dateOfReg,
        }
    }
}