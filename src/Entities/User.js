const _userProps = new WeakMap();

export default class User {
    constructor(decodedToken) {
        if (decodedToken) {
            const { owner, sub, level, authorities } = decodedToken;
            //  split roles into arrays of authorities first
            const auths = authorities.split(',');
            _userProps.set(this, {
                id: owner.id,
                username: sub,
                firstName: owner.firstName,
                lastName: owner.lastName,
                status: owner.status,
                sex: owner.sex,
                level,
                regDate: owner.regDate,
                authorities: auths
            });
        }else {
            _userProps.set(this, {});
        }
    }

    get id() { return _userProps.get(this).id }
    
    set id(id) { _userProps.get(this).id = id }

    get username() { return _userProps.get(this).username }
    
    set username(username) { _userProps.get(this).username = username }

    get password() { return _userProps.get(this).password }
    
    set password(password) { _userProps.get(this).password = password }

    get firstName() { return _userProps.get(this).firstName }
    
    set firstName(firstName) { _userProps.get(this).firstName = firstName }

    get lastName() { return _userProps.get(this).lastName }
    
    set lastName(lastName) { _userProps.get(this).lastName = lastName }

    get status() { return _userProps.get(this).status }
    
    set status(status) { _userProps.get(this).status = status }

    get accCreatorId() { return _userProps.get(this).accCreatorId }
    
    set accCreatorId(accCreatorId) { _userProps.get(this).accCreatorId = accCreatorId }

    get sex() { return _userProps.get(this).sex }
    
    set sex(sex) { _userProps.get(this).sex = sex }

    get regDate() { return _userProps.get(this).regDate }
    
    set regDate(regDate) { _userProps.get(this).regDate = regDate }

    get phoneNo() { return _userProps.get(this).phoneNo }
    
    set phoneNo(phoneNo) { _userProps.get(this).phoneNo = phoneNo }

    get email() { return _userProps.get(this).email }
    
    set email(email) { _userProps.get(this).email = email }

    get level() { return _userProps.get(this).level }
    
    set level(level) { _userProps.get(this).level = level }
    
    get authorities() { return _userProps.get(this).authorities }

    set authorities(authorities) { _userProps.get(this).authorities = authorities }

    hasAuth(authName){
        return _userProps.get(this).authorities.includes(authName.toUpperCase());
    }

    toJSON() {
        return {
            id: this.id,
            username: this.username,
            password: this.password,
            firstName: this.firstName,
            lastName: this.lastName,
            phoneNo: this.phoneNo,
            email: this.email,
            status: this.status,
            sex: this.sex,
            level: this.level,
        }
    }
}