<?php

    $lat = $_GET['lat'];
    $long = $_GET['long'];

    //create the url for the request
    $request = "https://api.sunrise-sunset.org/json?lat=" . $lat . "&lng=" . $long;
    
    //initialise the connection
    $conn = curl_init($request);

    curl_setopt($conn, CURLOPT_RETURNTRANSFER, TRUE);

    //make the request and get the response
    $response = curl_exec($conn);

    $error = curl_error($conn);

    //close the connection
    curl_close($conn);

    //return the response from the request as a json object
    echo json_encode($response);
?>
