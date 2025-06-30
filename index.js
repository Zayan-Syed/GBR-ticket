const RAILCARDS = Object.freeze({
    OFFPEAK: "Off peak railcard",
    SAVER_16_17: "16-17 saver",
    SENIOR: "Senior railcard"
})
const GROUP_TICKET = Object.freeze({
    DUO: "Duo",
    FAMILY: "Family",
    CROWD: "Crowd"
})
let distance = 160;
let isReturn = true;
let isFirst = true;
let cap = 80;
let numpassenger = 1;
let numchild = 0;
let railcard = [];
let grouptick = null;
// console.log(getTicket(distance, isFirst, isReturn, cap, numpassenger, numchild, railcard, grouptick))
document.getElementById("site-heading").textContent = "(Not so) Great British Railways"
document.getElementById("journey-heading").textContent = "Plan a journey"
document.getElementById("submit-info").onclick = function () {
    if (document.getElementById("distance").value == ""){
        document.getElementById("information-entry-error").textContent = "Please enter a proper number";
        return;
    }
    if (Number(document.getElementById("distance").value) < 0){
        document.getElementById("information-entry-error").textContent = "Please enter a non-negative number";
        return;
    }
    if (document.querySelector('input[name="single-return"]:checked') == null){
        document.getElementById("information-entry-error").textContent = "Please select single or return";
        return;
    }
    if (document.querySelector('input[name="standard-first"]:checked') == null){
        document.getElementById("information-entry-error").textContent = "Please select standard or first class";
        return; 
    }
    if (document.getElementById("congestion").value == ""){
        document.getElementById("information-entry-error").textContent = "Please enter a proper number";
        return;
    }
    if (Number(document.getElementById("congestion").value) < 0 || 
    Number(document.getElementById("congestion").value) > 100){
        document.getElementById("information-entry-error").textContent = "Please enter a number between 0 and 100";
        return;
    }
    document.getElementById("information-entry-error").textContent = "";
    distance = document.getElementById("distance").value;
    isReturn = document.querySelector('input[name="single-return"]:checked').value == "return";
    isFirst = document.querySelector('input[name="standard-first"]:checked').value == "first";
    cap = document.getElementById("congestion").value;
    console.log(getTicket(distance, isReturn, isFirst, cap, numpassenger, numchild, railcard, grouptick));
}


function getTicket(distance, isReturn, isFirst, cap, numpassenger, numchild, railcard, grouptick){
    let price = CalcBaseFare(distance);
    const FIRST = 1.5;
    const RETURN = 1.5;
    let fullmult = 1;
    if (isFirst) {fullmult *= FIRST;}
    if (isReturn) {fullmult *= RETURN;}
    fullmult *= CalcCongestion(cap);
    price = price*fullmult;
    let total = 0;
    total += CalcRailcard(railcard, price);
    numpassenger -= railcard.length;
    const CHILD = 0.7;
    total += price*numpassenger + price*CHILD*numchild;
    if (grouptick != null){
        total *= CalcGroupTicket(grouptick);
    }
    else{
        total *= MultiPassenger(numpassenger + numchild + railcard.length);
    }
    total = Math.round(total*10)/10;
    total = total.toFixed(2);
    let outmsg = total + " ";
    if (isFirst) {outmsg = outmsg + "First class ";}
    if (isReturn) {outmsg = outmsg + "return";}
    else {outmsg = outmsg + "single"}
    return outmsg;


}

function CalcBaseFare(x){
    let total = 0;
    for (let i = 1; i < x*10; i++) {
        total += 0.5*2*Func(i/10)*0.1;        
    }
    total += 0.1*0.5*Func(x);
    return total;
}

function Func(x){
    return 0.45 + 0.2*Math.exp(0.0625*(x-50)) / (0.04*(x-50) - Math.exp(0.0625*(x-50)));
}

function CalcCongestion(cap){
    return 1.3-0.6/(Math.exp((cap-50)/10)+1);
}

function CalcRailcard(railcard, price){
    let total = 0;
    for (let i = 0; i < railcard.length; i++) {
        switch(railcard[i]){
            case RAILCARDS.OFFPEAK:
                total += price * 2.0/3.0;
                return total;
            case RAILCARDS.SENIOR:
                total += price * 1.0/3.0;
                return total;
            case RAILCARDS.SAVER_16_17:
                total += price * 0.5;
                return total; 
            default:
                return total + price;
        }
    }
    return total;
}

function CalcGroupTicket(grouptick){
    switch(grouptick){
        case GROUP_TICKET.DUO:
            return 2.0/3.0;
        case GROUP_TICKET.FAMILY:
            return 0.5;
        case GROUP_TICKET.CROWD:
            return 0.4;
        default:
            return 1;
    }
}

function MultiPassenger(numpassenger){
    const SCALE = 0.9
    return (1-Math.pow(SCALE,numpassenger)) / ((1-SCALE)*numpassenger);
}