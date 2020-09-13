//globals
let naServerDST = spacetime.now('Pacific Time').isDST(),
    etInterval = new interval(etTimersUpdate, "1s"),
    ftClockInterval = new interval(ftClockUpdate, "1s"),
    settings = localStorage.getItem('fgo-time-settings'),
    clockFormat = '{hour-pad}:{minute-pad}{ampm}',
    naToUTC = 0,//conversion offsets in minutes
    localToUTC = 0,
    eventTimer;

//init
$(init);
//on unload save settings
$(window).on("unload", () => (localStorage.setItem('fgo-time-settings', JSON.stringify(settings))));

function init() {
    //Apply default settings or parse existing settings
    if (settings == null) {
        settings = {
            "showEventTimers":true,
            "showTimeTable":true,
            "showApCalc":true,
            "showLinks":true,
            "timerFormat":"colon"
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
    if (settings.timerFormat == "colon") {
        $("#events").addClass("timers-monospace");
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

    //run setup
    ftDataUpdate();
    if (settings.showEventTimers !== false) {
        etInterval.start();
    }
    ftClockUpdate();
    ftClockInterval.start();
    ftApCalcUpdate();
    //attach onclick functions
    $("main section > h1").on("click", sectionToggleDisplay);
    $("#ap-calc input").on("input", ftApCalcUpdate);
    $("#nav-button-settings").on("click", openSettingsMenu);
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
        if (section.attr("id") == "events") {
            ftDataUpdate();
            etInterval.start();
        }
        section.removeClass("section-hidden");
        section.find(".content").slideDown(200);
        settings["show" + section.data("name")] = true;
    } else {
        section.addClass("section-hidden");
        section.find(".content").slideUp(200);
        settings["show" + section.data("name")] = false;
        if (section.attr("id") == "events") etInterval.stop();
    }
}

/*
 * DATA UPDATE FUNCTIONS
 */
function ftDataUpdate() {
    let xh = new XMLHttpRequest(),
        url = "assets/events.php";
    xh.open("GET", url, true);
    xh.onload = function() {
        ftHandleDataUpdate(xh.responseText);
    }
    xh.send();
}
function ftHandleDataUpdate(eventData) {
    if (!eventData) throw new Error("Error while retrieving Event Data");
    eventData = JSON.parse(eventData);
    eventTimer = eventData;

    etTableSetup();
    etTimersUpdate();
    ftClockUpdate();
    ttSetup();
}

/*
* EVENT TIMER FUNCTIONS
*/
function etTableSetup() {
    //insert banner image
    if (eventTimer.banner !== null) {
        let src = "assets/img/" + eventTimer.banner,
            img;
        if ($("#event-banner img").length == 0) {
            img = $("<img>");
            $("#event-banner").append(img);
        } else {
            img = $("#event-banner img");
        }
        if (img.attr("src") != src) img.attr("src", src);
    } else {
        $("#event-banner").empty();
    }

    //insert notices
    if (eventTimer.notice !== null) {
        $("#event-notice").html(eventTimer.notice);
    } else {
        $("#event-notice").empty();
    }

    //return false if there's no timers
    if (eventTimer.timers.length < 1) return false;

    //empty tbody before making new lines
    $("#events table tbody").empty();

    //generate tbody
    for (let timer of eventTimer.timers) {
        let tr = $("<tr>"),
            td = $("<td>");
        td.append($("<span>").html(timer.text + ": "));
        td.append($("<span>").addClass("timer"));
        tr.append(td);
        $("#events table tbody").append(tr);
    }
}

function etTimersUpdate() {
    for (let timer in eventTimer.timers) {
        $("#events table tbody").children().eq(timer).find(".timer").html(etCalcTimer(eventTimer.timers[timer].time));
    }
}

/*
 * @param goalTime Number unix timestamp for when the event occurs
 * @returns String;
 */
function etCalcTimer(goalTime) {
    let difference = goalTime - (0| Date.now() / 1000);
    if (difference <= 0) {
        return (settings.timerFormat == "colon" ? "00:00:00:00" : "0d 0h 0m 0s");
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
        let t;
        if (settings.timerFormat == "colon") {
            t = (d < 10 ? "0" : "") + String(d) + ":" + (h < 10 ? "0" : "") + String(h) + ":" + (m < 10 ? "0" : "") + String(m) + ":" + (s < 10 ? "0" : "") + String(s);
        } else {
            t = String(d) + "d " + String(h) + "h " + String(m) + "m " + String(s) + "s";
        }
        return t;
    }
}

/*
 * TIME TABLE FUNCTIONS
 */
function ttSetup() {
    //compile events
    let events = [].concat(eventTimer.timeTable);

    //convert times
    for (let event of events) {
        //calculate times
        let time = (event.time * 60) + naToUTC,
            localTime = (event.time * 60) + localToUTC,
            h, m, timeAsString, localTimeAsString, sortTime;
        //fix if passed 0am in any direction and build time strings
        if (time < 0) time += 1440;
        if (time > 1439) time -= 1440;
        h = 0| time / 60;
        m = 0| time % 60;
        timeAsString = (h < 10 ? "0" : "") + String(h) + ":" + (m < 10 ? "0": "") + String(m);
        if (localTime < 0) localTime += 1440;
        if (localTime > 1439) localTime -= 1440;
        h = 0| localTime / 60;
        m = 0| localTime % 60;
        localTimeAsString = (h < 10 ? "0" : "") + String(h) + ":" + (m < 10 ? "0": "") + String(m);
        sortTime = (h * 100) + m;
        //add to Array
        event.serverTime = timeAsString;
        event.localTime = localTimeAsString;
        event.sortTime = Number(h+m);
    }

    //sort by local Time
    events.sort(function(a, b){
        return a.sortTime - b.sortTime;
    })

    $("#time-table table tbody").empty();

    //create table
    for (let event of events) {
        let tr = $("<tr/>");
        tr.append($("<td/>").html(
            event.localTime
        ));
        tr.append($("<td/>").html(
            event.serverTime.concat(" ", naServerDST ? "PDT" : "PST")
        ));
        tr.append($("<td/>").html(
            event.desc
        ));
        $("#time-table table tbody").append(tr);
    }
}

function ftClockUpdate() {
    let localTime = spacetime.now(),
        localOffset = (new Date).getTimezoneOffset(),
        localFormatted = localTime.format(clockFormat).toUpperCase(),
        utcTime = localTime.clone().add(localOffset, 'minutes'),
        naServerOffset = spacetime.now('Pacific Time').timezone().current.offset,
        naServerTime = utcTime.clone().add(naServerOffset, 'hours'),
        naServerFormatted = naServerTime.format(clockFormat).toUpperCase();
    //update globals conversion offsets
    naToUTC = naServerOffset * 60;
    localToUTC = localOffset * (-1);

    $("#clock-local > h2").html(localFormatted);
    $("#clock-na > h2").html(naServerFormatted);
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
 * MODALS
 */
function makeModalBox() {
    let modal = $("<div/>").addClass("modal-box"),
        modalClose = $("<button>").addClass("button-cancel").on("click", destroyModal);
    modal.append(modalClose);
    return modal;
}

function openModal(modalBox) {
    let modals = $("#modals");
    modals.append(modalBox);
    modals.show();
    $("body").css("overflow", "hidden");
}

function destroyModal() {
    let modals = $("#modals");
    modals.find(".modal-box").remove();
    modals.hide();
    $("body").css("overflow", "visible");
}

function openSettingsMenu() {
    let modal = makeModalBox();
    modal.append($("<h1/>").html("Settings"));

    //Section: Event Timers
    modal.append($("<h2>").html("Event Timers"));

    //Timer Format Setting
    modal.append($("<div/>").css({"margin": "0.5em 0"}).html("Timer Formats:"))
    let div = $("<div/>").addClass("radio-wrapper");
    //Option: colons
    div.append($("<input/>").attr({
        "type": "radio",
        "name": "settings-event-timer-format",
        "id": "event-timer-format-colons"
    })).append($("<label/>").html("Colons").attr({
        "for": "event-timer-format-colons"
    }).on("click", function(){
        settings.timerFormat = "colon";
        $("#events").addClass("timers-monospace");
        etTimersUpdate();
    }));
    //Option: units
    div.append($("<input/>").attr({
        "type": "radio",
        "name": "settings-event-timer-format",
        "id": "event-timer-format-units"
    })).append($("<label/>").html("Units").attr({
        "for": "event-timer-format-units"
    }).on("click", function(){
        settings.timerFormat = "unit";
        $("#events").removeClass("timers-monospace");
        etTimersUpdate();
    }));
    //default
    if (settings.timerFormat == "colon") {
        div.find("#event-timer-format-colons").prop("checked", true);
    } else {
        div.find("#event-timer-format-units").prop("checked", true);
    }
    modal.append(div);

    openModal(modal);
}
