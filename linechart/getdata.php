<?php

$servername = "127.0.0.1";
$username = "ece480ms_wimax";
$password = "wiMAX4dayz";
$dbname = "ece480ms_wimax";
$port = "3306";

// Create connection
$con = mysqli_connect($servername, $username, $password, $dbname, $port);
// Check connection
if (mysqli_connect_errno()) {
     echo "Connection failed: " . mysqli_connect_error();
}

$sql = "SELECT * FROM profile";
$result = mysqli_query($con, $sql);

$array = array();

while ($arr = mysqli_fetch_assoc($result)){
    $array[] = array(($arr["time"]), (float)$arr["voltage"], (float)$arr["flow"]);
}

$toggleval = $array[1][1];
$toggle = array();

$toggle[] = ($toggleval & 8) == 8;
$toggle[] = ($toggleval & 4) == 4;
$toggle[] = ($toggleval & 2) == 2;
$toggle[] = ($toggleval & 1) == 1;

$x = 1;

$start = $array[0][1]-1;

$reorder_array = array();
$reorder_array[] = ["Date Time", "Voltage", "Flow"];

while ($x <= 100){
    if ($start > 102){
        $start = 3;
    }
    $reorder_array[] = $array[$start];
    $start = $start + 1;
    $x = $x + 1;
}

// Free result set
mysqli_free_result($result);

mysqli_close($con);

$jsonarray = array($toggle, $reorder_array);

echo json_encode($jsonarray);

?> 
