<?php

$format = "F j, Y H:i T";

//Handle arguments
if (!isset($argv)) {
    echo "[ERROR] Must run in CLI";
    die;
}

/*
 * -help, --help
 */
if (
    in_array("-help", $argv) ||
    in_array("--help", $argv)
) {
    echo "make-timestamp [string]".PHP_EOL;
    echo "Format must be: ".$format.PHP_EOL;
    die;
}

$timestring = "";
for($i=1; $i<count($argv); $i++) {
    if($i > 1) $timestring .= " ";
    $timestring .= $argv[$i];
}
$date = DateTime::createFromFormat($format, $timestring);
echo $date->format('U').PHP_EOL;
?>
