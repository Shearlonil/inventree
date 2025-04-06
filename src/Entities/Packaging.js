import { format } from "date-fns";

const _pkgProps = new WeakMap();

export class Packaging{
    constructor(jsonObject) {
        if (jsonObject) {
            const { id, name, itemsCount, creator, creationDate, isDefault } = jsonObject;
            _pkgProps.set(this, {
                id,
                name,
                creationDate,
                creator,
                isDefault,
                itemsCount,
            });
        }else {
            _pkgProps.set(this, {});
        }
    }
    
    get id() { return _pkgProps.get(this).id; }
    set id(id) { _pkgProps.get(this).id = id }
    
    get name() { return _pkgProps.get(this).name }
    set name(name) { _pkgProps.get(this).name = name }

    get isDefault() { return _pkgProps.get(this).isDefault; }
    set isDefault(isDefault) { _pkgProps.get(this).isDefault = isDefault; }
        
    get creationDate() { return _pkgProps.get(this).creationDate ? format(_pkgProps.get(this).creationDate, 'dd/MM/yyyy HH:mm:ss') : ''; }
    set creationDate(creationDate) { _pkgProps.get(this).creationDate = creationDate; }

    get itemsCount() { return _pkgProps.get(this).itemsCount; }
    set itemsCount(itemsCount) { _pkgProps.get(this).itemsCount = itemsCount }

    get username() { return _pkgProps.get(this).creator; }
    set username(username) { _pkgProps.get(this).creator = username; }

    toJSON(){
        return {
            id: this.id,
            name: this.name,
            status: this.status,
        }
    }
}