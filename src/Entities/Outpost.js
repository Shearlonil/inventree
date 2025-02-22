import { format } from "date-fns";

const _outpostProps = new WeakMap();

export class Outpost{
    constructor(jsonObject) {
        const { id, name, status, creator, creation_date } = jsonObject;
        _outpostProps.set(this, {
            id, name, status, creator, creationDate: creation_date
        });
    }

    get id() { return _outpostProps.get(this).id; }
    set id(id) { _outpostProps.get(this).id = id; }
    
    get name() { return _outpostProps.get(this).name }
    set name(name) { _outpostProps.get(this).name = name; }

    get status() { return _outpostProps.get(this).status; }
    set status(status) { _outpostProps.get(this).status = status; }
    
    get creationDate() { return _outpostProps.get(this).creationDate ? format(_outpostProps.get(this).creationDate, 'dd/MM/yyyy HH:mm:ss') : ''; }
    set creationDate(creationDate) { _outpostProps.get(this).creationDate = creationDate; }

    get username() { return _outpostProps.get(this).creator; }
    set username(username) { _outpostProps.get(this).creator = username; }

    toJSON(){
        return {
            id: this.id,
            name: this.name,
            status: this.status,
        }
    }
}