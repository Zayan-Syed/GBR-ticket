import { parse } from "/csv-parse";
const RAILCARDS = Object.freeze({
    OFFPEAK: "Off peak railcard",
    SAVER_16_17: "16-17 saver",
    SENIOR: "Senior railcard",
    TOURIST: "Tourist railcard",
    WORKING: "Work railcard",
    DISABILITY: "Disabled persons railcard",
})
const GROUP_TICKET = Object.freeze({
    DUO: "Duo",
    FAMILY: "Family",
    CROWD: "Crowd"
})
//Delete and assign later once finished
let distance = 30;
let isReturn = true;
let isFirst = false;
let cap = 100;
let numpassenger = 1;
let numchild = 1;
let railcard = [];
let grouptick = null;
document.getElementById("site-heading").textContent = "(Not so) Great British Railways"
document.getElementById("journey-heading").textContent = "Plan a journey"

//Reading csv file
const passenger_no = document.getElementById("passenger-no");
const child_no = document.getElementById("child-no");
//Checks that the passenger count is at least one and less than or equal to 12
passenger_no.addEventListener("change" ,(e) => {
    //Sets a requirement of at least one passenger if the total passenger count is 0
    if (Number(passenger_no.value) + Number(child_no.value) < 1){
        child_no.min = 1; 
        document.getElementById("passenger-number-error").hidden = false;
        document.getElementById("passenger-number-error").textContent = "Number of total passengers must be greater than 0";
        return;
    }
    else{
        child_no.min = 0;
        document.getElementById("passenger-number-error").hidden = true;

    }
    //Changes the combined maximum passenger count to equal 12 if the total exceeds 12
    if (Number(passenger_no.value) + Number(child_no.value) > 12) {
        passenger_no.max = 12 - child_no.value;
        child_no.max = child_no.value;
        document.getElementById("passenger-number-error").hidden = false;
        document.getElementById("passenger-number-error").textContent = "Number of total passengers must not exceed 12";
        return;
    }
    else{
        passenger_no.max = 12;
        child_no.max = 12;
        document.getElementById("passenger-number-error").hidden = true;

    }
})
//Does the same as above but when the child counter is changed
child_no.addEventListener("change" ,(e) => {
    if (Number(passenger_no.value) + Number(child_no.value) < 1){
        passenger_no.min = 1; 
        document.getElementById("passenger-number-error").hidden = false;
        document.getElementById("passenger-number-error").textContent = "Number of total passengers must be greater than 0";
        return; 
    }
    else{
        passenger_no.min = 0;
        document.getElementById("passenger-number-error").hidden = true;

    }
    if (Number(passenger_no.value) + Number(child_no.value) > 12) {
        child_no.max = 12 - passenger_no.value;
        passenger_no.max = passenger_no.value;
        document.getElementById("passenger-number-error").hidden = false;
        document.getElementById("passenger-number-error").textContent = "Number of total passengers must not exceed 12";
        return;
    }
    else{
        child_no.max = 12;
        passenger_no.max = 12;
        document.getElementById("passenger-number-error").hidden = true;
    }
    
})

//Turns the div containing the railcard dropdown menu into an object
const railcard_select = document.getElementById("railcard-dropdown");
//Sets the values for the options ot match the enum values
document.getElementById("select-offpeak").value = RAILCARDS.OFFPEAK;
document.getElementById("select-16-17").value = RAILCARDS.SAVER_16_17;
document.getElementById("select-senior").value = RAILCARDS.SENIOR;
document.getElementById("select-tourist").value = RAILCARDS.TOURIST;
document.getElementById("select-working").value = RAILCARDS.WORKING;
document.getElementById("select-disabled").value = RAILCARDS.DISABILITY;
//Adds the railcard dropdown menu into an array
let railcardlist = [];

//Adds a railcard by adding it to the array when the button is pressed
document.getElementById("add-railcard").onclick = function(){
    railcardlist.push(railcard_select.cloneNode(true));
    railcardlist[railcardlist.length-1].hidden = false;
    document.getElementById("railcard-placement").appendChild(railcardlist[railcardlist.length-1]);
    if (railcardlist.length > 0) {
        document.getElementById("remove-railcard").hidden = false;
    }
}

//Removes a railcard from the array and the html file when the button is pressed
document.getElementById("remove-railcard").onclick = function() {
    const dropped_rc = railcardlist.pop();
    document.getElementById("railcard-placement").removeChild(dropped_rc);
    if (railcardlist.length == 0) {document.getElementById("remove-railcard").hidden = true;}
}


//Sets the values of the options to match the enum values
document.getElementById("select-none").value = null;
document.getElementById("select-duo").value = GROUP_TICKET.DUO;
document.getElementById("select-family").value = GROUP_TICKET.FAMILY;
document.getElementById("select-crowd").value = GROUP_TICKET.CROWD;

//Checks the total passenger count and enables the corresponding group ticket whenever the dropdown menu is clicked
document.getElementById("select-group-ticket").addEventListener("click", (e) => {
    let tot_passengers = Number(passenger_no.value) + Number(child_no.value);
    if (tot_passengers == 2) {document.getElementById("select-duo").disabled = false;}
    else {document.getElementById("select-duo").disabled = true;}
    if (tot_passengers >= 3 && tot_passengers <= 5) {document.getElementById("select-family").disabled = false;}
    else {document.getElementById("select-family").disabled = true;}
    if (tot_passengers >= 6 && tot_passengers <= 12) {document.getElementById("select-crowd").disabled = false;}
    else {document.getElementById("select-crowd").disabled = true;}

})



const myForm = document.getElementById("ticketing-info");
myForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (errorSubmit()){ return;}
    distance = Number(document.getElementById("distance").value);
    isReturn = document.querySelector('input[name="single-return"]:checked').value == "return";
    isFirst = document.querySelector('input[name="standard-first"]:checked').value == "first";
    cap = Number(document.getElementById("congestion").value);
    numpassenger = Number(document.getElementById("passenger-no").value);
    numchild = Number(document.getElementById("child-no").value);
    railcard = convertRailcardArray();
    document.getElementById("remove-railcard").hidden = true;
    grouptick = document.getElementById("select-group-ticket").value;
    console.log(getTicket(distance, isReturn, isFirst, cap, numpassenger, numchild, railcard, grouptick));
    document.getElementById("ticketing-info").reset();

})

function errorSubmit(){
    let tot_passengers = Number(passenger_no.value) + Number(child_no.value);
    const group_ticket_error = document.getElementById("group-ticket-error");
    const group_ticket_selected = document.getElementById("select-group-ticket").value;
    if (tot_passengers != 2 && group_ticket_selected == GROUP_TICKET.DUO){
        group_ticket_error.hidden = false;
        group_ticket_error.textContent = "This group ticket cannot be used for " + String(tot_passengers) + " passengers"
        return true;
    }
    else{group_ticket_error.hidden = true;}

    if ((tot_passengers < 3 || tot_passengers > 5) && group_ticket_selected == GROUP_TICKET.FAMILY){
        group_ticket_error.hidden = false;
        group_ticket_error.textContent = "This group ticket cannot be used for " + String(tot_passengers) + " passengers"
        return true;
    }
    else{group_ticket_error.hidden = true;}

    if ((tot_passengers < 6 || tot_passengers > 12) && group_ticket_selected == GROUP_TICKET.CROWD){
        group_ticket_error.hidden = false;
        group_ticket_error.textContent = "This group ticket cannot be used for " + String(tot_passengers) + " passengers"
        return true;
    }
    else{group_ticket_error.hidden = true;}

    if (railcardlist.length > Number(passenger_no.value)){
        document.getElementById("railcard-error").hidden = false;
        document.getElementById("railcard-error").textContent = "Number of railcards must be less than or equal to number of (adult) passengers";
        return true;
    }
    else{document.getElementById("railcard-error").hidden = true;}
    return false;
}

function convertRailcardArray(){
    let modded_railcardlist = []
    for (let i=0; i<railcardlist.length; i++){
        modded_railcardlist.push(railcardlist[0].children[0].value);
    }
    for (let i=0; i<modded_railcardlist.length; i++){
        const dropped_rc = railcardlist.pop();
        document.getElementById("railcard-placement").removeChild(dropped_rc);        
    }
    return modded_railcardlist;
}

function getTicket(distance, isReturn, isFirst, cap, numpassenger, numchild, railcard, grouptick){
    deleete(distance, isReturn, isFirst, cap, numpassenger, numchild, railcard, grouptick);
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
    total *= CalcGroupTicket(grouptick, numpassenger + numchild + railcard.length);
    total = Math.round(total*10)/10;
    total = total.toFixed(2);
    let outmsg = total + " ";
    if (isFirst) {outmsg = outmsg + "First class ";}
    if (isReturn) {outmsg = outmsg + "return";}
    else {outmsg = outmsg + "single"}
    return outmsg;
}

function deleete(distance, isReturn, isFirst, cap, numpassenger, numchild, railcard, grouptick){
    console.log(distance);
    console.log(isReturn);
    console.log(isFirst);
    console.log(cap);
    console.log(numpassenger);
    console.log(numchild);
    console.log(railcard);
    console.log(grouptick);
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
                continue;
            case RAILCARDS.SENIOR:
                total += price * 1.0/3.0;
                continue;
            case RAILCARDS.SAVER_16_17:
                total += price * 0.5;
                continue;
            case RAILCARDS.TOURIST:
                total += price * 2.0/3.0;
                continue;
            case RAILCARDS.WORKING:
                total += price * 3.0/4.0;
                continue;
            case RAILCARDS.DISABILITY:
                total += price * 1.0/3.0;
                continue;
            default:
                continue;
        }
    }
    return total;
}

function CalcGroupTicket(grouptick, numpassenger){
    switch(grouptick){
        case GROUP_TICKET.DUO:
            return 2.0/3.0;
        case GROUP_TICKET.FAMILY:
            return 0.5;
        case GROUP_TICKET.CROWD:
            return 0.4;
        default:
            return MultiPassenger(numpassenger);
    }
}


function MultiPassenger(numpassenger){
    const SCALE = 0.9
    return (1-Math.pow(SCALE,numpassenger)) / ((1-SCALE)*numpassenger);
}

/*
Congestion pricing:
    Day = Weekday ~
    Timing = 6:00 - 9:00 + 16:00 - 19:00 -> 80%-70%
    Timing = 22:00 - 00:00 + 00:00 - 5:00 -> 10%
    else (9:00 - 16:00 + 19:00 - 22:00 + 5:00 - 6:00) -> 40%-20%
    (these may also be ranges with midpoints at 7:30 , 17:30)

    Day = Weekend + public holiday ~
    Timing = 10:00 - 14:00 + 18:00 - 20:00 -> 30%
    Timing = 22:00 + 00:00 + 8:00 -> 10%
    else (14:00 - 18:00 + 20:00 - 22:00 + 8:00 - 10:00) -> 20% 

    For return average out the calculated congestion pricing for both journey date and return date

    In csv file create two additional columns for start and end destination and rank 1-5 based on how busy

    Start/End = Add both rankings from start and end destination
    Start/End = 10-8 -> 1.3
    Start/End = 7-6 -> 1.1
    Start/End = 5 -> 1
    Start/End = 4-3 -> 0.7
    Start/End = 2-1 -> 0.5

    

*/