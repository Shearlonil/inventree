const _userProps = new WeakMap();

export default class User {
    constructor(decodedToken) {
        if (decodedToken) {
            const { claims, sub } = decodedToken;
            //split roles into arrays of authorities first
            const auths = claims.roles.split(',');
            _userProps.set(this, {
                id: claims.id,
                userName: sub,
                firstName: claims.firstName,
                lastName: claims.lastName,
                status: claims.status,
                accCreatorId: claims.accCreatorId,
                sex: claims.sex,
                regDate: claims.regDate,
                level:claims.level,
                authorities: auths
            });
        }
    }

    get id() { return _userProps.get(this).id }
    
    set id(id) { _userProps.get(this).id = id }

    get userName() { return _userProps.get(this).userName }
    
    set userName(userName) { _userProps.get(this).userName = userName }

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

    get level() { return _userProps.get(this).level }
    
    set level(level) { _userProps.get(this).level = level }
    
    get authorities() { return _userProps.get(this).authorities }

    set authorities(authorities) { _userProps.get(this).authorities = authorities }

    hasAuth(authName){
        return _userProps.get(this).authorities.includes(authName.toUpperCase());
    }
}