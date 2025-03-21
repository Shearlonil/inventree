import numeral from "numeral";
import { format } from "date-fns";

const _transactionProps = new WeakMap();

export class LedgerTransaction {
    constructor(jsonObject) {
        if (jsonObject) {
            _transactionProps.set(this, {
                id: jsonObject?.id,
                ledgerId: jsonObject?.ledgerId,
                ledgerVchId: jsonObject?.ledgerVchId,
                description: jsonObject?.description,
                crAmount: jsonObject?.crAmount,
                drAmount: jsonObject?.drAmount,
                balance: jsonObject?.balance,
                date: jsonObject?.date,
            });
        }else {
            _transactionProps.set(this, {});
        }
    }

    get id() { return _transactionProps.get(this).id; }
    set id(id) { _transactionProps.get(this).id = id }
    
    get description() { return _transactionProps.get(this).description }
    set description(description) { _transactionProps.get(this).description = description }
    
    get ledgerId() { return _transactionProps.get(this).ledgerId }
    set ledgerId(ledgerId) { _transactionProps.get(this).ledgerId = ledgerId }
    
    get ledgerVchId() { return _transactionProps.get(this).ledgerVchId }
    set ledgerVchId(ledgerVchId) { _transactionProps.get(this).ledgerVchId = ledgerVchId }

    get balance() { return _transactionProps.get(this).balance ? numeral(_transactionProps.get(this).balance).format('₦0,0.00') : numeral(0).format('₦0,0.00'); }
    set balance(balance) { _transactionProps.get(this).balance = balance }

    get crAmount() { return _transactionProps.get(this).crAmount ? numeral(_transactionProps.get(this).crAmount).format('₦0,0.00') : numeral(0).format('₦0,0.00'); }
    set crAmount(crAmount) { _transactionProps.get(this).crAmount = crAmount }

    get drAmount() { return _transactionProps.get(this).drAmount ? numeral(_transactionProps.get(this).drAmount).format('₦0,0.00') : numeral(0).format('₦0,0.00'); }
    set drAmount(drAmount) { _transactionProps.get(this).drAmount = drAmount }
            
    get date() { return _transactionProps.get(this).date ? format(_transactionProps.get(this).date, 'dd/MM/yyyy HH:mm:ss') : ''; }
    set date(date) { _transactionProps.get(this).date = date; }

    toJSON(){
        return {
            id: this.id,
            description: this.description,
            ledgerId: this.ledgerId,
            ledgerVchId: this.ledgerVchId,
            balance: this.balance,
            crAmount: this.crAmount,
            drAmount: this.drAmount,
            date: this.date,
        }
    }
}