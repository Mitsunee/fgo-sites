<?php
$file = file_get_contents("events.json");
$data = json_decode($file, true);
echo json_encode($data);
die;
?>
