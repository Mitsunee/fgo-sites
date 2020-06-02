/*
 *
 * Event timers:
 * "NA" or "JP" regions
 * set banner to null to ignore
 * timer objects should hold:
 * - time Number timestamp of event occuering
 * - text String Description to display
 *
 */

const eventTimer = {
    "NA":{
        "banner": "banner_20200616_v5do3.png",
        "timer": [
            {
                "time":1591156740,
                "text": "Kogetsukan and Hunting Quests End"
            },{
                "time":1591171200,
                "text": "GUDAGUDA 3 Begins"
            },{
                "time":1591761540,
                "text":"10M DL Campaign Ends"
            }
        ]
    },
    "JP":{
        "banner":"requiem_event_banner.png",
        "timer": [
            {
                "time":1591588740,
                "text": "Fate/Requiem Event Ends"
            },{
                "time":1593529140,
                "text": "Deadline for Free SSR"
            }
        ]
    }
};

/*
 * DATA LOOKUP
 * Times in hours UTC
 */

const tt = [
    //PDT -7 (summer) / PST -8 (winter)
    {"time": 8, "desc": "Event Start Time", "server":"na"},
    {"time": 0, "desc": "Daily Quest Rotation and FP Gacha Reset", "server":"na"},
    {"time": 4, "desc": "Daily Login Reset and Event End Time", "server":"na"},
    {"time": 4, "desc": "Event Rotation (Hunting Quest NA)", "server":"na"},
    //JST +9
    {"time": 15, "desc": "Daily Quest Rotation and FP Gacha Reset", "server":"jp"},
    {"time": 19, "desc": "Daily Login Reset", "server":"jp"},
    {"time": 4, "desc": "Maintenance Start Time", "server":"jp"},
    {"time": 9, "desc": "Maintenance End Time", "server":"jp"}
];
