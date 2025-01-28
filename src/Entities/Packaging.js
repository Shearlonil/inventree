const _pkgProps = new WeakMap();

export class Packaging{
    constructor() {
        _pkgProps.set(this, {});
    }

    get id() { return _pkgProps.get(this).id; }
    set id(id) { _pkgProps.get(this).id = id }
    
    get name() { return _pkgProps.get(this).name }
    set name(name) { _pkgProps.get(this).name = name }

    get status() { return _pkgProps.get(this).status; }
    set status(status) { _pkgProps.get(this).status = status }

    toJSON(){
        return {
            id: this.id,
            name: this.name,
            status: this.status,
        }
    }
}