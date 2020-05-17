const eventTimer = {
    "NA":{
        "main":{
            "time":1589947140,
            "text": "Event Ends",
            "banner": "MeijiRestorationRevivalUS.png"
        },
        "secondary": {
            "time":1590638340,
            "text": "Okita Banner Ends"
        }
    },
    "JP":{
        "main": {
            "time":1590937200,
            "text": "Fate/Requiem Collab Pre-Release Ends",
            "banner": "EYNZ_2tVAAAAY0Y.png"//info_image_02.png for SSR
        },
        "secondary": {
            "time":1593529140,
            "text": "Deadline for Free SSR"
        }
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
