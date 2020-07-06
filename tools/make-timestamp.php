<?php

$formatWiki = "F j, Y H:i T";
$formatNA = "Y\-m\-d H:i T";
$formatJP = "Y年n月j日 G:i";

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
    echo "make-timestamp [format] [string]".PHP_EOL;
    echo "format:".PHP_EOL;
    echo "\twiki: ".$formatWiki.PHP_EOL;
    echo "\tna: ".$formatNA.PHP_EOL;
    echo "\tjp: ".$formatJP." (timezone is added automatically for JP)".PHP_EOL;
    die;
}

$timestring = "";
$startedString = false;
foreach ($argv as $a) {
    if ($startedString) {
        if($timestring != "") {
            $timestring .= " ";
        }
        $timestring .= $a;
    } else {
        switch ($a) {
            case "wiki":
                $format = $formatWiki;
                echo "Using wiki format".PHP_EOL;
                $startedString = true;
                break;
            case "na":
                $format = $formatNA;
                echo "Using NA format".PHP_EOL;
                $startedString = true;
                break;
            case "jp":
                $format = $formatJP;
                echo "Using jp format".PHP_EOL;
                $startedString = true;
                break;
            default:
                continue;
                break;
        }
    }
}
echo "Input:  ".$timestring.PHP_EOL;
echo "Format: ".$format.PHP_EOL;
if($format == $formatJP) {
    $date = DateTime::createFromFormat($format." T", $timestring." JST");
} else {
    $date = DateTime::createFromFormat($format, $timestring);
}
echo "Output: ".$date->format('U').PHP_EOL;
?>
