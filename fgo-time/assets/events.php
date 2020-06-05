<?php
switch (true) {
    case isset($_GET["js"]):
        $data = getEventsData();
        echo "let eventTimer = ".json_encode($data["eventTimer"]).", tt = ".json_encode($data["tt"]).";";
        break;

    case isset($_GET["json"]):
        $data = getEventsData();
        echo json_encode($data);
        break;

    default:
        http_response_code(404);
        die;
}

function getEventsData() {
    $file = file_get_contents("events.json");
    return json_decode($file, true);
}
?>
