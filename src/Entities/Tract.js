const _tractProps = new WeakMap();

export class Tract{
    constructor() {
        _tractProps.set(this, {});
    }

    get id() { return _tractProps.get(this).id; }
    set id(id) { _tractProps.get(this).id = id }
    
    get name() { return _tractProps.get(this).name }
    set name(name) { _tractProps.get(this).name = name }

    get status() { return _tractProps.get(this).status; }
    set status(status) { _tractProps.get(this).status = status }

    toJSON(){
        return {
            id: this.id,
            name: this.name,
            status: this.status,
        }
    }
}