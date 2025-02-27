import { format } from "date-fns";

const _tractProps = new WeakMap();

export class Tract{
    constructor(jsonObject) {
        if (jsonObject) {
            const { id, name, itemsCount, creator, creationDate, isDefault } = jsonObject;
            _tractProps.set(this, {
                id,
                name,
                creationDate,
                creator,
                isDefault,
                itemsCount,
            });
        }else {
            _tractProps.set(this, {});
        }
    }

    get id() { return _tractProps.get(this).id; }
    set id(id) { _tractProps.get(this).id = id }
    
    get name() { return _tractProps.get(this).name }
    set name(name) { _tractProps.get(this).name = name }

    get isDefault() { return _tractProps.get(this).isDefault; }
    set isDefault(isDefault) { _tractProps.get(this).isDefault = isDefault; }
        
    get creationDate() { return _tractProps.get(this).creationDate ? format(_tractProps.get(this).creationDate, 'dd/MM/yyyy HH:mm:ss') : ''; }
    set creationDate(creationDate) { _tractProps.get(this).creationDate = creationDate; }

    get itemsCount() { return _tractProps.get(this).itemsCount; }
    set itemsCount(itemsCount) { _tractProps.get(this).itemsCount = itemsCount }

    get username() { return _tractProps.get(this).creator; }
    set username(username) { _tractProps.get(this).creator = username; }

    toJSON(){
        return {
            id: this.id,
            name: this.name,
            itemsCount: this.itemsCount,
        }
    }
}