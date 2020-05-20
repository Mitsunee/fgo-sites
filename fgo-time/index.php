<?php
/**
 * Echoes $path and adds file mod time
 *
 * @param string $path relative path pointing to the file
 * @static
 */
function htmllink($path) {
    echo "$path?_=".filemtime($path);
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>FGO Time - Current Server Times for Fate/Grand Order</title>
	<meta charset="utf-8">
	<link rel="shortcut icon" href="favicon.ico">
	<meta name="description" content="Current Server Times for Fate/Grand Order">
	<meta name="twitter:card" content="summary">
	<meta name="twitter:title" content="FGO Time">
	<meta name="twitter:description" content="Current Server Times for Fate/Grand Order">
	<meta name="twitter:image" content="/fgo-time/assets/icon.png">
	<meta name="twitter:creator" content="@Mitsunee">
	<meta property="og:title" content="FGO Time">
	<meta property="og:image" content="/fgo-time/assets/icon.png">
	<meta property="og:description" content="Current Server Times for Fate/Grand Order">

    <link rel="stylesheet" href="<?php htmllink("assets/fgo-time.css");?>">
    <link href="https://fonts.googleapis.com/css2?family=Dosis:wght@700&family=Noto+Sans&family=Overpass+Mono:wght@300&display=swap" rel="stylesheet">
    <script src="<?php htmllink("assets/events.js");?>"></script>
    <script src="<?php htmllink("assets/libs.bundle.js");?>"></script>
    <script src="<?php htmllink("assets/fgo-time.min.js");?>"></script>
</head>
<body>
    <header>
        <section>
            <img src="assets/icon.png" id="icon" alt="icon">
            <h1>FGO Time</h1>
            <h2>Current Server Times for Fate/Grand Order</h2>
        </section>
    </header>
    <div id="loading">Loading...</div>
    <main style="display:none;">
        <div id="clocks">
            <div class="clock" id="clock-local">
                <h1>Local</h1>
                <h2>00:00AM</h2>
            </div>
            <div class="clock">
                <h1>UTC</h1>
                <h2>XX:XXAM</h2>
            </div>
            <div class="clock" id="clock-na">
                <h1>NA Server</h1>
                <h2>00:00AM</h2>
            </div>
            <div class="clock" id="clock-jp">
                <h1>JP Server</h1>
                <h2>00:00AM</h2>
            </div>
        </div>
        <section id="events" data-name="EventTimers">
            <h1>Events</h1>
            <div class="content">
                <table>
                    <thead>
                        <tr>
                            <th>NA Server</th>
                            <th>JP Server</th>
                        </tr>
                        <tr>
                            <td id="event-banner-na"></td>
                            <td id="event-banner-jp"></td>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>Murder at Kogetsukan chapter release at 21PDT every day.</td>
                            <td>A livestream has been announced for May 25, 2020 19:00 ~ JST</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </section>
        <section id="time-table" data-name="TimeTable">
            <h1>Time Table</h1>
            <div class="content">
                <p>This is a list of commonly used times. They may differ for events and banners, please double check with the official news channels. All listed times are in 24h-formatting.</p>
                <p class="center"><input type="checkbox" name="show-na" id="show-na" checked><label for="show-na">Show NA Server Times</label> | <input type="checkbox" name="show-jp" id="show-jp" checked><label for="show-jp">Show JP Server Times</p>
                <table>
                    <thead>
                        <tr>
                            <th>Local Time</th>
                            <th>Server Time</th>
                            <th>Server</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
                <p>Note: Due to a bug the Free 10x Friend Point Gacha only updates at midnight device time. This means it can either not show up or get stuck, based on if you roll before or after reset. Therefore it is recommended to roll between midnight and reset if you are not in the JST timezone.</p>
            </div>
        </section>
        <section id="ap-calc" data-name="ApCalc">
            <h1>AP Calculator</h1>
            <div class="content">
                <table>
                    <tr>
                        <td>Max AP</td>
                        <td><input type="number" id="ap-calc-max-ap" value="140" min="0" max="142"></td>
                        <td rowspan="3">You will reach your target AP in <span id="ap-calc-target-mins"></span> (<span id="ap-calc-target-time"></span>)<br>and your max AP at <span id="ap-calc-max-mins"></span> (<span id="ap-calc-max-time"></span>)</td>
                    </tr>
                    <tr>
                        <td>Target AP</td>
                        <td><input type="number" id="ap-calc-target-ap" value="140" min="0" max="142"></td>
                    </tr>
                    <tr>
                        <td>Current AP</td>
                        <td><input type="number" id="ap-calc-current-ap" value="0" min="0" max="141"></td>
                    </tr>
                </table>
            </div>
        </section>
        <section id="links" data-name="Links">
            <h1>Useful links</h1>
            <div class="content">
                <table>
                    <tr>
                        <th>Resources</th>
                        <th>Guides &amp; Wikis</th>
                    </tr>
                    <tr>
                        <td>
                            <ul>
                                <li><a href="https://apps.atlasacademy.io/drop-lookup/#/" title="FGO Dropsheet Lookup Tool">fgo-lookup</a></li>
                                <li><a href="https://rayshift.io/" title="Friend ID Lookup and Raid Tracking">Rayshift.io</a></li>
                                <li><a href="https://apps.atlasacademy.io/drop-serializer/" title="Submission form for community droprate data">Drop Serializer</a></li>
                                <li><a href="https://maketakunai.github.io/">maketakunai's Damage Calculator</a></li>
                            </ul>
                        </td>
                        <td>
                            <ul>
                                <li><a href="https://www.kscopedia.net/" titles="Lord Ashura's Event Guides">Kscopedia</a></li>
                                <li><a href="https://fategrandorder.fandom.com/wiki/Fate/Grand_Order_Wikia">Fandom Wiki</a></li>
                                <li><a href="https://grandorder.wiki/Main_Page">Grandorder.wiki</a></li>
                                <li><a href="https://gamepress.gg/grandorder/">Gamepress</a></li>
                                <li><a href="https://fate-go.cirnopedia.org/">Cirnopedia</a></li>
                            </ul>
                        </td>
                    </tr>
                </table>
            </div>
        </section>
    </main>
</body>
