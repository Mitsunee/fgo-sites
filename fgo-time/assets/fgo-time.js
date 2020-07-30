//globals
let naServerDST = spacetime.now('Pacific Time').isDST(),
    etInterval = new interval(etTimersUpdate, "1s"),
    ftClockInterval = new interval(ftClockUpdate, "1s"),
    settings = localStorage.getItem('fgo-time-settings'),
    clockFormat = '{hour-pad}:{minute-pad}{ampm}',
    jpToUTC = 0,//conversion offsets in minutes
    naToUTC = 0,
    localToUTC = 0;



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

    //setup event table
    if (etTableSetup() && settings.showEventTimers !== false) {
        etInterval.start();
    }
    //setup timetable
    ftClockUpdate();
    ttSetup();
    ftApCalcUpdate();
    ftClockInterval.start();
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
            etTableSetup(true);
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
 * EVENT TIMER FUNCTIONS
 */

async function etTableSetup(updateData) {
    //pull new data?
    if (updateData === true) {
        let newEventData = await asyncRequest("GET", "assets/events.php?json");
        newEventData = JSON.parse(newEventData);
        eventTimer = newEventData.eventTimer;
    }

    //insert banner images
    if (eventTimer.NA.banner !== null) {
        let src = "assets/img/" + eventTimer.NA.banner,
            img;
        if ($("#event-banner-na img").length == 0) {
            img = $("<img>");
            $("#event-banner-na").append(img);
        } else {
            img = $("#event-banner-na img");
        }
        if (img.attr("src") != src) img.attr("src", src);
    } else {
        $("#event-banner-na").empty();
    }
    if (eventTimer.JP.banner !== null) {
        let src = "assets/img/" + eventTimer.JP.banner,
            img;
        if ($("#event-banner-jp img").length == 0) {
            img = $("<img>");
            $("#event-banner-jp").append(img);
        } else {
            img = $("#event-banner-jp img");
        }
        if (img.attr("src") != src) img.attr("src", src);
    } else {
        $("#event-banner-jp").empty();
    }

    //insert notices
    if (eventTimer.NA.notice !== null) {
        $("#event-notice-na").html(eventTimer.NA.notice);
    } else {
        $("#event-notice-na").empty();
    }
    if (eventTimer.JP.notice !== null) {
        $("#event-notice-jp").html(eventTimer.JP.notice);
    } else {
        $("#event-notice-jp").empty();
    }

    //return false if there's no timers
    if (eventTimer.NA.timer.length < 1 && eventTimer.JP.timer.length < 1) return false;

    //how many rows needed?
    let timers = Math.max(eventTimer.NA.timer.length, eventTimer.JP.timer.length);

    //empty tbody before making new lines
    $("#events table tbody").empty();

    //generate tbody
    for (let i = 0; i < timers; i++) {
        let tr = $("<tr>"),
            na = $("<td>"),
            jp = $("<td>");
        if (eventTimer.NA.timer[i]) {
            na.append($("<span>").html(eventTimer.NA.timer[i].text + ": "));
            na.append($("<span>").addClass("timer").addClass("timer-na"));
        }
        if (eventTimer.JP.timer[i]) {
            jp.append($("<span>").html(eventTimer.JP.timer[i].text + ": "));
            jp.append($("<span>").addClass("timer").addClass("timer-jp"));
        }
        tr.append(na).append(jp);
        $("#events table tbody").append(tr);
    }

    //update Timers and return true
    etTimersUpdate();
    return true;
}

function etTimersUpdate() {
    for (let timer in eventTimer.NA.timer) {
        $("#events table tbody").children().eq(timer).find(".timer-na").html(etCalcTimer(eventTimer.NA.timer[timer].time));
    }
    for (let timer in eventTimer.JP.timer) {
        $("#events table tbody").children().eq(timer).find(".timer-jp").html(etCalcTimer(eventTimer.JP.timer[timer].time));
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
    //Apply toogle function
    $("input[type='checkbox']").on("change", ttToggleDisplay);

    //compile events
    let events = [].concat(tt);

    //convert times
    for (let i in events) {
        //calculate times
        let time = (events[i].time * 60) + (events[i].server == "na" ? naToUTC : jpToUTC),
            localTime = (events[i].time * 60) + localToUTC,
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
        events[i].serverTime = timeAsString;
        events[i].localTime = localTimeAsString;
        events[i].sortTime = Number(h+m);
    }

    //sort by local Time
    events.sort(function(a, b){
        return a.sortTime - b.sortTime;
    })

    console.log(events);

    //create table
    for (let event of events) {
        let tr = $("<tr/>").attr("data-server", event.server);
        tr.append($("<td/>").html(
            event.localTime
        ));
        tr.append($("<td/>").html(
            event.serverTime.concat(" ", event.server == "na" ? (naServerDST ? "PDT" : "PST") : "JST")
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
    ttUpdateFilter();
}

function ttToggleDisplay() {
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
    ttUpdateFilter();
}

function ttUpdateFilter() {
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
    let localTime = spacetime.now(),
        localOffset = (new Date).getTimezoneOffset(),
        localFormatted = localTime.format(clockFormat).toUpperCase(),
        utcTime = localTime.clone().add(localOffset, 'minutes'),
        naServerOffset = spacetime.now('Pacific Time').timezone().current.offset,
        naServerTime = utcTime.clone().add(naServerOffset, 'hours'),
        naServerFormatted = naServerTime.format(clockFormat).toUpperCase(),
        jpServerOffset = spacetime.now('Asia/Tokyo').timezone().current.offset,
        jpServerTime = utcTime.clone().add(jpServerOffset, 'hours'),
        jpServerFormatted = jpServerTime.format(clockFormat).toUpperCase();
    //update globals conversion offsets
    jpToUTC = jpServerOffset * 60;
    naToUTC = naServerOffset * 60;
    localToUTC = localOffset * (-1);

    $("#clock-local > h2").html(localFormatted);
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

    //Section: Time Table
    modal.append($("<h2>").html("Time Table"));

    //Show NA Setting
    modal.append($("<div/>").css({"margin": "0.5em 0"}).html("Show NA Times:"))
    div = $("<div/>").addClass("radio-wrapper");
    //Option: Yes
    div.append($("<input/>").attr({
        "type": "radio",
        "name": "settings-show-na-times",
        "id": "show-na-times-yes"
    })).append($("<label/>").html("Yes").attr({
        "for": "show-na-times-yes"
    }).on("click", function(){
        settings.showNa = true;
        ttUpdateFilter();
    }));
    //Option: No
    div.append($("<input/>").attr({
        "type": "radio",
        "name": "settings-show-na-times",
        "id": "show-na-times-no"
    })).append($("<label/>").html("No").attr({
        "for": "show-na-times-no"
    }).on("click", function(){
        settings.showNa = false;
        ttUpdateFilter();
    }));
    //default
    if (settings.showNa) {
        div.find("#show-na-times-yes").prop("checked", true);
    } else {
        div.find("#show-na-times-no").prop("checked", true);
    }
    modal.append(div);

    //Show JP Setting
    modal.append($("<div/>").css({"margin": "0.5em 0"}).html("Show JP Times:"))
    div = $("<div/>").addClass("radio-wrapper");
    //Option: Yes
    div.append($("<input/>").attr({
        "type": "radio",
        "name": "settings-show-jp-times",
        "id": "show-jp-times-yes"
    })).append($("<label/>").html("Yes").attr({
        "for": "show-jp-times-yes"
    }).on("click", function(){
        settings.showJp = true;
        ttUpdateFilter();
    }));
    //Option: No
    div.append($("<input/>").attr({
        "type": "radio",
        "name": "settings-show-jp-times",
        "id": "show-jp-times-no"
    })).append($("<label/>").html("No").attr({
        "for": "show-jp-times-no"
    }).on("click", function(){
        settings.showJp = false;
        ttUpdateFilter();
    }));
    //default
    if (settings.showJp) {
        div.find("#show-jp-times-yes").prop("checked", true);
    } else {
        div.find("#show-jp-times-no").prop("checked", true);
    }
    modal.append(div);

    openModal(modal);
}
