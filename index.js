const RAILCARDS = Object.freeze({
    OFFPEAK: "Off peak railcard",
    SAVER_16_17: "16-17 saver",
    SENIOR: "Senior railcard"
})

console.log(getTicket(103, false, true, 100, 10, 0, []))
document.getElementById("site-heading").textContent = "(Not so) Great British Railways"
document.getElementById("journey-heading").textContent = "Plan a journey"


function getTicket(distance, isFirst, isReturn, cap, numpassenger, numchild, railcard){
    let price = GetIntegral(distance);
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
    total *= CalcGroupTicket(numpassenger + numchild + railcard.length);
    total = Math.round(total*10)/10;
    return total.toFixed(2);

}

function GetIntegral(x){
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
    return 1.25-0.5/(Math.exp((cap-50)/8)+1);
}

function CalcRailcard(railcard, price){
    let total = 0;
    for (let i = 0; i < railcard.length; i++) {
        switch(railcard[i]){
            case RAILCARDS.OFFPEAK:
                total += price * 2.0/3.0;
                return total;
            case RAILCARDS.SENIOR:
                total += price * 2.0/3.0;
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

function CalcGroupTicket(numpassenger){
    if (numpassenger == 1){
        return 1;
    }
    if (numpassenger == 2){
        return 2.0/3.0;
    }
    if (numpassenger >= 3 && numpassenger < 6){
        return 0.5;
    }
    return 2.0/5.0;
}