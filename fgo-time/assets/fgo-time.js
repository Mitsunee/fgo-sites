//globals
let naServerDST = spacetime.now('Pacific Time').isDST(),
    etInterval = new interval(etTimersUpdate, "1s"),
    ftClockInterval = new interval(ftClockUpdate, "1s"),
    settings = localStorage.getItem('fgo-time-settings'),
    jpToLocal = 0,
    naToLocal = 0;

const eventTimer = {
    "NA":{
        "main":{
            "time":1589947140000,
            "text": "Event Ends",
            "banner": "MeijiRestorationRevivalUS.png"
        },
        "secondary": null
    },
    "JP":{
        "main": {
            "time":1589687940000,
            "text": "Event Ends",
            "banner": "GudagudaHonnoji2019_Rerun_banner.png"
        },
        "secondary": null
    }
}
/**

Event timers:
"NA" or "JP" regions
both regions have one main and one secondary timer
if timer not needed put null
if main is null secondary will be ignored
timer objects should hold:
- time Number timestamp of event occuering
- text String Description to display
- banner String relative url to the image or null if no image //only used for main timer

**/

//init
$(init);
//on unload save settings
$(window).on("unload", () => (localStorage.setItem('fgo-time-settings', JSON.stringify(settings))));

function init() {
    //Apply default settings or parse existing settings
    if (settings == null) {
        settings = {
            "showNa":true,
            "showJp":true,
            "showEventTimers":true,
            "showTimeTable":true,
            "showApCalc":true,
            "showLinks":true
        };
    } else {
        settings = JSON.parse(settings);
    }

    //Apply settings
    //Show sections
    if (settings.showEventTimers === false) {
        $("#events").addClass("section-hidden");
        $("#events > .content").hide();
    }
    if (settings.showTimeTable === false) {
        $("#time-table").addClass("section-hidden");
        $("#time-table > .content").hide();
    }
    if (settings.showApCalc === false) {
        $("#ap-calc").addClass("section-hidden");
        $("#ap-calc > .content").hide();
    }
    if (settings.showLinks === false) {
        $("#links").addClass("section-hidden");
        $("#links > .content").hide();
    }
    //TimeTable Settings
    if (settings.showNa === false) {
        $("#show-na").prop("checked", false);
    }
    if (settings.showJp === false) {
        $("#show-jp").prop("checked", false);
    }
    //AP Calc settings
    if (settings.maxAp) {
        $("#ap-calc-max-ap").val(settings.maxAp);
    }
    if (settings.targetAp) {
        $("#ap-calc-target-ap").val(settings.targetAp);
    }
    if (settings.currAp) {
        $("#ap-calc-current-ap").val(settings.currAp);
    }

    //setup event table
    etTableSetup();
    etTimersUpdate();
    //setup timetable
    ftTimeTableSetup();
    ftClockUpdate();
    ftApCalcUpdate();
    //attach onclick functions
    $("main section > h1").on("click", sectionToggleDisplay);
    $("#ap-calc input").on("input", ftApCalcUpdate);
    //start intervals
    etInterval.start();
    ftClockInterval.start();

    //show site
    $("main").show();
    $("#loading").hide();
}

/*
 * SECTION TOGGLE
 */
function sectionToggleDisplay() {
    section = $(this).parent();
    while(section && !section.is("section")) {
        section = section.parent();
    }
    if (section.hasClass("section-hidden")) {
        section.removeClass("section-hidden");
        section.find(".content").slideDown(200);
        settings["show" + section.data("name")] = true;
    } else {
        section.addClass("section-hidden");
        section.find(".content").slideUp(200);
        settings["show" + section.data("name")] = false;
    }
}

/*
 * EVENT TIMER FUNCTIONS
 */

function etTableSetup() {
    //NA
    if (eventTimer.NA.main !== null) {
        //Banner image
        if (eventTimer.NA.main.banner !== null) {
            let img = $("<img>").attr("src", "assets/img/" + eventTimer.NA.main.banner);
            $("#event-banner-na").append(img);
        }
        //Timer
        $("#event-main-na").append($("<span>").html(eventTimer.NA.main.text + ": "))
            .append($("<span>").attr("id","event-timer-na"));
        //Secondary timer
        if (eventTimer.NA.secondary !== null) {
            $("#event-sec-na").append($("<span>").html(eventTimer.NA.secondary.text + ": "))
                .append($("<span>").attr("id","event-timer2-na"));
        }
    }
    //JP
    if (eventTimer.JP.main !== null) {
        //Banner image
        if (eventTimer.JP.main.banner !== null) {
            let img = $("<img>").attr("src", "assets/img/" + eventTimer.JP.main.banner);
            $("#event-banner-jp").append(img);
        }
        //Timer
        $("#event-main-jp").append($("<span>").html(eventTimer.JP.main.text + ": "))
            .append($("<span>").attr("id","event-timer-jp"));
        //Secondary timer
        if (eventTimer.JP.secondary !== null) {
            $("#event-sec-jp").append($("<span>").html(eventTimer.JP.secondary.text + ": "))
                .append($("<span>").attr("id","event-timer2-jp"));
        }
    }
}

function etTimersUpdate() {
    if (eventTimer.NA.main !== null) {
        $("#event-timer-na").html(etCalcTimer(eventTimer.NA.main.time));
        if (eventTimer.NA.secondary !== null) {
            $("#event-timer2-na").html(etCalcTimer(eventTimer.NA.secondary.time));
        }
    }
    if (eventTimer.JP.main !== null) {
        $("#event-timer-jp").html(etCalcTimer(eventTimer.JP.main.time));
        if (eventTimer.JP.secondary !== null) {
            $("#event-timer2-jp").html(etCalcTimer(eventTimer.JP.secondary.time));
        }
    }
}

/*
 * @param goalTime Number timestamp with milliseconds for when the event occurs
 * @returns String;
 */
function etCalcTimer(goalTime) {
    let difference = goalTime - Date.now();
    difference = 0| difference / 1000;//Cull milliseconds
    if (difference <= 0) {
        return "00:00:00:00";
    } else {
        let s = difference;
        //days
        let d = 0| s / 86400;
        s = s % 86400;
        //hours
        let h = 0| s / 3600;
        s = s % 3600;
        //minutes
        let m = 0| s / 60;
        s = s % 60;
        //build string and return
        let t = (d < 10 ? "0" : "") + String(d) + ":" + (h < 10 ? "0" : "") + String(h) + ":" + (m < 10 ? "0" : "") + String(m) + ":" + (s < 10 ? "0" : "") + String(s);
        return t;
    }
}

/*
 * TIME TABLE FUNCTIONS
 */

function ftTimeTableSetup() {
    //Apply toogle function
    $("input[type='checkbox']").on("change", ftTimeTableToggleDisplay);

    //compile events
    let events = [];
    if (naServerDST) {
        events = events.concat(ftTimeTableEvents["NA_DST"]);
    } else {
        events = events.concat(ftTimeTableEvents["NA"]);
    }
    events = events.concat(ftTimeTableEvents["JP"]);

    //convert times
    for (let i in events) {
        let time, h, m;
        if (events[i].server == "na") {
            time = (events[i].time * 60) - naToLocal;
        } else {
            time = (events[i].time * 60) - jpToLocal;
        }
        if (time < 0) time += 1440;
        if (time > 1439) time -= 1440;
        h = 0| time / 60;
        m = String(time - (h * 60)).padStart(2, "0");
        h = String(h).padStart(2, "0");
        events[i].localTime = h+":"+m;
        events[i].sortTime = Number(h+m);
    }

    //sort by local Time
    events.sort(function(a, b){
        return a.sortTime - b.sortTime;
    })

    //create table
    for (let event of events) {
        let tr = $("<tr/>").attr("data-server", event.server),
            localTime = event.localTime,
            time = String(event.time).padStart(2, '0');

        tr.append($("<td/>").html(
            localTime
        ));
        tr.append($("<td/>").html(
            time.concat(":00 ", (event.server == "na" ? (naServerDST ? "PDT" : "PST") : "JST"))
        ));
        tr.append($("<td/>").html(
            event.server.toUpperCase()
        ));
        tr.append($("<td/>").html(
            event.desc
        ));
        $("#time-table table tbody").append(tr);
    }

    //update filter
    ftTimeTableUpdateFilter();
}

function ftTimeTableToggleDisplay() {
    switch(this.id) {
        case "show-na":
            settings.showNa = this.checked;
            break;
        case "show-jp":
            settings.showJp = this.checked;
            break;
        default:
            return false;
    }
    ftTimeTableUpdateFilter();
}

function ftTimeTableUpdateFilter() {
    let times = $("#time-table table tbody").children();

    for (let time of times) {
        let server = $(time).data("server");
        if(server === "na") {
            if (settings.showNa) {
                $(time).show();
            } else {
                $(time).hide()
            }
            continue;
        }
        if(server === "jp") {
            if (settings.showJp) {
                $(time).show();
            } else {
                $(time).hide()
            }
        }
    }
}

function ftClockUpdate() {
    let clockFormat = '{hour-pad}:{minute-pad}{ampm}',
        localTime = spacetime.now(),
        localOffset = (new Date).getTimezoneOffset(),
        localFormatted = localTime.format(clockFormat).toUpperCase(),
        utcTime = localTime.clone().add(localOffset, 'minutes'),
        utcFormatted = utcTime.format(clockFormat).toUpperCase(),
        naServerOffset = spacetime.now('Pacific Time').timezone().current.offset,
        naServerTime = utcTime.clone().add(naServerOffset, 'hours'),
        naServerFormatted = naServerTime.format(clockFormat).toUpperCase(),
        jpServerOffset = spacetime.now('Asia/Tokyo').timezone().current.offset,
        jpServerTime = utcTime.clone().add(jpServerOffset, 'hours'),
        jpServerFormatted = jpServerTime.format(clockFormat).toUpperCase();
    jpToLocal = (jpServerOffset * 60) + localOffset;
    naToLocal = (naServerOffset * 60) + localOffset;

    $("#clock-local > h2").html(localFormatted);
    $("#clock-utc > h2").html(utcFormatted);
    $("#clock-na > h2").html(naServerFormatted);
    $("#clock-jp > h2").html(jpServerFormatted);
}

/*
 * AP CALCULATOR
 */
function ftApCalcUpdate() {
    let maxAp = Number($("#ap-calc-max-ap").val()),
        targetAp = Number($("#ap-calc-target-ap").val()),
        currAp = Number($("#ap-calc-current-ap").val());

    //Keep numbers legal
    if (maxAp > 142) {
        maxAp = 142;
        $("#ap-calc-max-ap").val(142);
    }
    if (maxAp == 0) {
        maxAp = 1;
        $("#ap-calc-max-ap").val(1);
    }
    if (targetAp > maxAp) {
        targetAp = maxAp;
        $("#ap-calc-target-ap").val(targetAp);
    }
    $("#ap-calc-target-ap").attr("max", maxAp);
    if (currAp >= targetAp) {
        currAp = targetAp - 1;
        $("#ap-calc-current-ap").val(currAp);
    }
    $("#ap-calc-current-ap").attr("max", (targetAp - 1));

    // Calculate target
    apToTarget = targetAp - currAp;
    minsToTarget = 5 * apToTarget;
    timeToTarget = spacetime.now().add(minsToTarget, "minutes").format("{hour-pad}:{minute-pad}{ampm}");
    hoursToTarget = 0| minsToTarget / 60;
    minsToTarget -= hoursToTarget * 60;

    // Calculate max
    apToMax = maxAp - currAp;
    minsToMax = 5 * apToMax;
    timeToMax = spacetime.now().add(minsToMax, "minutes").format("{hour-pad}:{minute-pad}{ampm}");
    hoursToMax = 0| minsToMax / 60;
    minsToMax -= hoursToMax * 60;

    //Print
    $("#ap-calc-target-mins").html((hoursToTarget > 0 ? hoursToTarget+"h": "").concat(minsToTarget,"m"));
    $("#ap-calc-target-time").html(timeToTarget);
    $("#ap-calc-max-mins").html((hoursToMax > 0 ? hoursToMax+"h": "").concat(minsToMax,"m"));
    $("#ap-calc-max-time").html(timeToMax);

    //commit to settings
    settings.maxAp = maxAp;
    settings.targetAp = targetAp;
    settings.currAp = currAp;
}

/*
 * DATA LOOKUP
 */

const ftTimeTableEvents = {
    "NA": [
        {"time": 0, "desc": "Event Start Time", "server":"na"},
        {"time": 16, "desc": "Daily Quest Rotation and FP Gacha Reset", "server":"na"},
        {"time": 20, "desc": "Daily Login Reset and Event End Time", "server":"na"},
    ],
    "NA_DST": [
        {"time": 1, "desc": "Event Start Time", "server":"na"},
        {"time": 17, "desc": "Daily Quest and FP Gacha Reset", "server":"na"},
        {"time": 21, "desc": "Daily Login Reset and Event End/Maintenance Start Time", "server":"na"},
    ],
    "JP": [
        {"time": 0, "desc": "Daily Quest Rotation and FP Gacha Reset", "server":"jp"},
        {"time": 4, "desc": "Daily Login Reset", "server":"jp"},
        {"time": 13, "desc": "Maintenance Start Time", "server":"jp"},
    ]
}
