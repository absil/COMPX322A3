<?php

    $key = "0ad9ad0f7cc27ff2980304505a07f921";
	//set up the url for the request (lat, long, api key and metric units
    $url = "api.openweathermap.org/data/2.5/weather?lat=" . $_GET['lat'] . "&lon=" . $_GET['long'] . "&APPID=" . $key . "&mode=xml&units=metric";
    
	//initailise the connection
    $conn = curl_init($url);

    curl_setopt($conn, CURLOPT_RETURNTRANSFER, true);

	//make the request and get the response
    $response = curl_exec($conn);

	//convert the response to an xml object
    $xml= simplexml_load_string($response) or die("Error: Cannot create object");
	header('Content-type: text/xml');
	//return the response as xml
    echo $xml->asXML(); //return the response as xml
    
	//close the connection
    curl_close($conn); //close the connection
?>
