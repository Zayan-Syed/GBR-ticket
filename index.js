
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

//Station object to better handle the csv attributes
class Station {
    constructor(name, postcode, latitude, longitude, tlc, nlc, owner, entry_exit, interchange){
        this.name = name;
        this.postcode = postcode;
        this.latitude = latitude;
        this.longitude = longitude;
        this.tlc = tlc;
        this.nlc = nlc;
        this.owner = owner;
        this.entry_exit = entry_exit;
        this.interchange = interchange;
    }
}

//Delete and assign later once finished
let distance = 30;
let isReturn = true;
let isFirst = false;
let cap = 100;
let numpassenger = 1;
let numchild = 1;
let railcard = [];
let grouptick = null;
document.getElementById("site-heading").textContent = "(fake) Great British Railways"
document.getElementById("journey-heading").textContent = "Plan a journey"

//Reading csv file
let stationlist = []
await fetch("GB stations.csv").then(Response => Response.text())
.then(data => {
    const lines = data.split("\n");
    const array = lines.map(line => line.split(","))
    for (let i=0; i<array.length; i++){
        if (i == 0) {continue;}
        //Converts the two dimentional array to a list of station objects to more easily 
        // access the attributes of the station rather than memorising an index
        stationlist.push(new Station(array[i][0],array[i][1], array[i][2],array[i][3], array[i][4], 
        array[i][5], array[i][6], array[i][7], array[i][8]));
    }
})
.catch(error => console.error("An error occurred:",error));


//Create list of station names
let stationnames = [];
for (let i=0; i<stationlist.length; i++){
    stationnames.push(stationlist[i].name);
}

//Constructs start and end destination dropdown menus
for (let i=0; i<stationnames.length; i++){
    let current = document.createElement("option");
    current.value = stationnames[i];
    document.getElementById("start-destination").appendChild(current);
    document.getElementById("end-destination").appendChild(current.cloneNode());
}

//Reveals return date option when return is selected
document.getElementById("return").addEventListener("click", (e) => {
    document.getElementById("end-date-div").hidden = false;
    document.getElementById("end-date").required = true;
})
document.getElementById("single").addEventListener("click", (e) => {
    document.getElementById("end-date-div").hidden = true;
    document.getElementById("end-date").required = false;
})

//Disables start and return dates if anytime ticket is selected
document.getElementById("anytime").addEventListener("click", (e) => {
    if (document.getElementById("anytime").checked){
        document.getElementById("start-date").disabled = true;
        document.getElementById("end-date").disabled = true;
    }
    else {
        document.getElementById("start-date").disabled = false;
        document.getElementById("end-date").disabled = false;

    }
})

//Checks that the passenger count is at least one and less than or equal to 12
const passenger_no = document.getElementById("passenger-no");
const child_no = document.getElementById("child-no");
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

//Array to store railcard dropdowns
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
    const START_STN = document.getElementById("start-input").value;
    const END_STN = document.getElementById("end-input").value;
    const NUM_PASS = document.getElementById("passenger-no").value;
    const NUM_CHILD = document.getElementById("child-no").value;
    const START_DATE = new Date(document.getElementById("start-date").value);
    const END_DATE = new Date(document.getElementById("end-date").value);
    const ANYTIME = document.getElementById("anytime").checked;
    isReturn = document.querySelector('input[name="single-return"]:checked').value == "return";
    isFirst = document.querySelector('input[name="standard-first"]:checked').value == "first";
    numpassenger = Number(NUM_PASS);
    numchild = Number(NUM_CHILD);
    railcard = convertRailcardArray();
    grouptick = document.getElementById("select-group-ticket").value;
    let ticket_price = getTicket(START_STN, END_STN, isReturn, isFirst, START_DATE, END_DATE, ANYTIME, 
        numpassenger, numchild, railcard, grouptick);
    document.getElementById("ticketing-info").reset();
    reset_missed();
    let full_log = deleete(getDistanceByStation(START_STN, END_STN), isReturn, isFirst, 
    CalcCongestion(START_STN, END_STN, START_DATE, END_DATE),
    numpassenger, numchild, railcard, grouptick);
    console.log(full_log);
    SubmitToPage(START_STN, END_STN, ticket_price, railcard, grouptick, numpassenger+numchild, START_DATE, 
        END_DATE, ANYTIME, full_log);

})

function reset_missed(){
    document.getElementById("remove-railcard").hidden = true;
    document.getElementById("end-date-div").hidden = true;
    document.getElementById("start-date").disabled = false;
    
}

function errorSubmit(){
    const start = document.getElementById("start-input").value;
    const end = document.getElementById("end-input").value;
    if (searchStation(start) == -1 || searchStation(end) == -1) {
        document.getElementById("station-name-error").hidden = false;
        document.getElementById("station-name-error").textContent = "That is not a valid station name";
        return true;
    }
    else{
        document.getElementById("station-name-error").hidden = true;
    }

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

/**
 * Calculates the distance between two stations given their names
 * @param {*} start The start destination
 * @param {*} end The end destination
 * @returns The distance
 */
function getDistanceByStation(start, end){
    let station1 = searchStation(start);
    let station2 = searchStation(end);
    let lat1 = stationlist[station1].latitude;
    let lat2 = stationlist[station2].latitude;
    let long1 = stationlist[station1].longitude;
    let long2 = stationlist[station2].longitude;
    
    var radius = 6378;
    var deglat = deg2rad(lat2-lat1);
    var deglong = deg2rad(long2 - long1);
    var a = Math.sin(deglat/2) * Math.sin(deglat / 2) + Math.cos(deg2rad(lat1)) * 
    Math.cos(deg2rad(lat2)) * Math.sin(deglong/2) * Math.sin(deglong/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = radius * c;
    return Math.ceil(d);   
}

function deg2rad(deg){
    return deg * (Math.PI/180);
}

function convertRailcardArray(){
    let modded_railcardlist = []
    for (let i=0; i<railcardlist.length; i++){
        modded_railcardlist.push(railcardlist[i].children[0].value);        
    }
    for (let i=0; i<railcardlist.length; i++){
        const dropped_rc = railcardlist.pop();
        document.getElementById("railcard-placement").removeChild(dropped_rc);        
    }
    return modded_railcardlist;
    
}

function CalcCongestion(start_location, end_location, start_date, end_date) {
    if (start_date == null) {return -1;}
    let cong = 0;
    let distance = getDistanceByStation(start_location, end_location);
    if (String(end_date) == "Invalid Date") {
        cong = getCongestionbyDatetime(start_date, distance);
    }
    else {
        cong =  0.5*(getCongestionbyDatetime(start_date, distance) + getCongestionbyDatetime(end_date, distance));
    }
    cong *=  getPopularityMult(start_location) * getPopularityMult(end_location)
    return cong;
}

/**
 * Rough and horrid guestimate of expected demand based on time of day
 * @param {*} date The given day
 * @param {*} distance Distance used to split long and short distance patterns
 * @returns expected usage as % of total capacity
 */
function getCongestionbyDatetime(date, distance){
    let hour = date.getHours();
    let minute = date.getMinutes();
    let timedec = hour + minute / 60.0;
    //Checks for weekend
    if (date.getDay() === 0 || date.getDay() === 6) {
        return getWeekendExpected(date, distance);
    }
    if (hour < 4){
        return 5;
    }
    if (hour >= 4 && hour < 6) {
        return 10 + 20 * (timedec - 4) / (6 - 4);
    }
    if (hour >= 6 && hour < 9){
        return -10/2.25 * (timedec - 7.5) * (timedec - 7.5) + 70;
    }
    if (distance > 100 && hour >= 9 && hour < 22) {
        return 60 * Math.exp(-0.25 * (timedec - 9)) + 30;
    }
    if (hour >= 9 && hour < 16) {
        return (30 / Math.pow(3.5,6)) * Math.pow(timedec - 12.5, 6) + 30;
    }
    if (hour >= 16 && hour < 19) {
        return -10/2.25 * (timedec - 17.5) * (timedec - 17.5) + 70;
    }
    if (hour >= 19 && hour < 24){
        return 60 * Math.exp((timedec-19)/1.3);
    }
    return 50;
}

/**
 * Rough and horrible guestimate at train usage based on time of day during weekends
 * @param {*} date given date
 * @param {*} distance used to split long and short distance
 * @returns expected usage as % of total capacity
 */
function getWeekendExpected(date, distance){
    let hour = date.getHours();
    let minute = date.getMinutes();
    let timedec = hour + minute / 60.0;
    if (timedec >= 6 && timedec < 22) {
        if (distance > 100) {return (-30 / Math.pow(8,6)) * Math.pow(timedec - 14, 6) + 40;}
        return (-10 /Math.pow(8,6)) * Math.pow(timedec - 14, 6) + 20; 
    }
    else {return 5;}

}


function checkOffpeak(date1, date2, distance) {
    const BAD_DATE = "Invalid Date";
    if (String(date1) == BAD_DATE) {return true;}
    if (date1.getDay() == 0 || date1.getDay() == 6) {
        return true && checkOffpeak(date2, BAD_DATE)
    }
    if (date1.getHours() < 6) {
        return true && checkOffpeak(date2, BAD_DATE);
    }
    if (date1.getHours() >= 9 && date1.getHours() < 16) {
        return true && checkOffpeak(date2, BAD_DATE);
    }
    if (distance > 100 && date1.getHours() >= 16) {
        return true && checkOffpeak(date2, BAD_DATE);
    }
    if (date1.getHours() > 19) {
        return true && checkOffpeak(date2, BAD_DATE);
    }
    return false;
}

function getPopularityMult(station){
    let avg = 0;
    for (let i=0; i<stationlist.length; i++){
        if (Math.sqrt(Math.log(stationlist[i].entry_exit)) > 0) {
            avg += Math.log(Math.log(stationlist[i].entry_exit));
        }
    }
    avg /= stationlist.length;
    let popmult = Math.log(Math.log(stationlist[searchStation(station)].entry_exit))
    if (!popmult > 0){
        return 0.5;
    }
    return popmult / avg;
}

function SubmitToPage(start_station, end_station, price_output, railcard, grouptick, passengers, start_date, 
    end_date, anytime, full_log) {
    let railcard_string = outputRailcard(sortRailcard(railcard, 
        getDistanceByStation(start_station, end_station), start_date, end_date, anytime));
    console.log(railcard_string);
    localStorage.setItem("start_loc", start_station);
    localStorage.setItem("end_loc", end_station);
    localStorage.setItem("price", price_output);
    localStorage.setItem("railcard",railcard_string);
    localStorage.setItem("group ticket", grouptick);
    localStorage.setItem("passengers",passengers);
    localStorage.setItem("start date",start_date);
    localStorage.setItem("end date", end_date);
    localStorage.setItem("full log", full_log);
    window.location.replace("./output.html");
}

function getTicket(start_location, end_location, isReturn, isFirst, start_date, end_date, anytime, numpassenger, 
    numchild, railcard, grouptick){
    let distance = Number(getDistanceByStation(start_location,end_location));
    let cap = CalcCongestion(start_location, end_location, new Date(start_date), new Date(end_date));    
    let price = CalcBaseFare(distance);
    const FIRST = 1.5;
    const RETURN = 1.5;
    let fullmult = 1;
    if (isFirst) {fullmult *= FIRST;}
    if (isReturn) {fullmult *= RETURN;}
    if (anytime) {fullmult *= 1.3;}
    else {fullmult *= GetCongestionMult(cap);}
    price = price*fullmult;
    let total = 0;
    total += CalcRailcard(railcard, price, distance, start_date, end_date, anytime);
    numpassenger -= railcard.length;
    const CHILD = 0.7;
    total += price*numpassenger + price*CHILD*numchild;
    total *= CalcGroupTicket(grouptick, numpassenger + numchild + railcard.length);
    total = Math.round(total*10)/10;
    total = total.toFixed(2);
    let outmsg = total + " ";
    if (isFirst) {outmsg = outmsg + "First class ";}
    if (anytime) {outmsg = outmsg + "anytime ";}
    if (isReturn) {outmsg = outmsg + "return";}
    else {outmsg = outmsg + "single"}
    return outmsg;
}

function deleete(distance, isReturn, isFirst, cap, numpassenger, numchild, railcard, grouptick){ 
    return distance + "\n" + isReturn + "\n" + isFirst + "\n" + cap + "\n" + numpassenger + "\n" + 
    numchild + "\n" + railcard + "\n" + grouptick;
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
    return 0.25 + 0.1*Math.exp(0.0625*(x-80)) / (0.04*(x-80) - Math.exp(0.0625*(x-80)));
}

function GetCongestionMult(cap){
    return 1.3-0.6/(Math.exp((cap-50)/10)+1);
}

function CalcRailcard(railcard, price, distance, start_date, end_date, anytime){
    let total = 0;
    for (let i = 0; i < railcard.length; i++) {
        if (!checkRailcardValid(railcard[i], anytime, start_date, end_date, distance)) {
            total += price;
            continue;
        }
        switch(railcard[i]){
            case RAILCARDS.OFFPEAK:
                if (!checkOffpeak(start_date, end_date, distance)) { 
                    total += price * 1; 
                    continue;
                }
                total += price * 2.0/3.0;
                continue;
            case RAILCARDS.SENIOR:
                total += price * 1.0/3.0;
                continue;
            case RAILCARDS.SAVER_16_17:
                if (anytime) { 
                    total += price * 1; 
                    continue;
                }
                if (!checkOffpeak(start_date, end_date, distance)) total += price * 1;
                total += price * 0.5;
                continue;
            case RAILCARDS.TOURIST:
                total += price * 2.0/3.0;
                continue;
            case RAILCARDS.WORKING:
                total += price * 2.0/3.0;
                continue;
            case RAILCARDS.DISABILITY:
                total += price * 1.0/3.0;
                continue;
            default:
                total += price;
        }
    }
    return total;
}

function checkRailcardValid(railcard, anytime, start_date, end_date, distance) {
    if (railcard == RAILCARDS.OFFPEAK && (anytime || checkOffpeak(start_date, end_date, distance))) {
        return false;
    }
    if (railcard == RAILCARDS.SAVER_16_17 && (anytime || checkOffpeak(start_date, end_date, distance))) {
        return false;
    }
    if (railcard == RAILCARDS.TOURIST && checkOffpeak(start_date, end_date, distance)) {
        return false;
    }
    return true;

}

function sortRailcard(railcard, distance, start_date, end_date, anytime) {
    let unique_railcard = [...new Set(railcard)];
    let sorted_railcard = [];
    for (let i=0; i<unique_railcard.length; i++) {
        sorted_railcard.push([unique_railcard[i], 
        railcard.filter((v) => (v === unique_railcard[i])).length]); 
        if (checkRailcardValid(unique_railcard[i], anytime, start_date, end_date, distance)) {
            sorted_railcard[i][1] = 0;
        }
    }
    return sorted_railcard;
}

function outputRailcard(railcard) {
    console.log(railcard);
    let output="";
    if (railcard.length == 0) {return output;}
    for (let i=0; i<railcard.length-1; i++) {
        if (Number(railcard[i][1]) == 0) {
            output = output + railcard[i][0] + " *" + railcard[i][1] + " (invalid) " + "\n";
        }
        else {
            output = output + railcard[i][0] + " *" + railcard[i][1] + "\n";
        }
    }
    if (Number(railcard[railcard.length-1][1]) == 0) {
        output = output + railcard[railcard.length-1][0] + " *" + 
        railcard[railcard.length-1][1] + " (invalid) " + "\n";
    }
    else {
        output += railcard[railcard.length-1][0] + " *" + railcard[railcard.length-1][1]
    }
    return output;
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

/**
 * Search algorithm that returns index in the station array based on a given station name
 * @param {*} tosearch station to search
 * @returns index of the given station or -1 if not found
 */
function searchStation(tosearch){
    let start = 0;
    let end = stationnames.length-1;
    while (start <= end){
        let mid = Math.floor((start + end) / 2);
        if(stationnames[mid] === tosearch) {
            return mid;
        }
        else if (stationnames[mid] < tosearch) {
            start = mid + 1;
        }
        else {
            end = mid - 1;
        }
    }
    return -1;
}

function getContactless(start_location, end_location, ispeak, railcard) {
    let distance = Number(getDistanceByStation(start_location,end_location));
    let price = CalcBaseFare(distance);
    if (ispeak) { price *= 1.3; }
    if (railcard.length != 0) 
    { 
        price = CalcRailcard([railcard], price);
    }
    price = Math.round(price*10)/10;
    price = price.toFixed(2);
    return price; 
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