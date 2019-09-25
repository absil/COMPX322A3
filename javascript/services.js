let mymap = L.map('mapId').setView([-37.78121, 175.27303], 13);	//set the map to be initially showing hamilton
let lat = 0;
let long = 0;
let town = "";
let townsList = [];
let list = document.getElementById('infoList');
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
}).addTo(mymap);	//set up for the map

/* a constructor function for the Town object, contains a town name, latitude and longitude*/
function Town(name, lat, long){
    var _name = name;
    var _lat = lat;
    var _long = long;
    
    this.getName = function(){	//function to get the name of the town
        return _name;
    }
    
    this.getLat = function(){	//function to return the latitiude of the town
        return _lat;
    }
    
    this.getLong = function(){	//functon to return the longitude of the town
        return _long;
    }
}

/* onclick event for the search button
takes the town/city entered in the textbox and sets the global lat and long variables using a fetch request to the mapquest geocoding api*/
function searchTown(){
	document.getElementById('info').style.backgroundColor = "darkcyan";

	//clear all the information about the previous town
	while(list.hasChildNodes()){
		list.removeChild(list.firstChild);
	}

    var _town = document.getElementById('townInput').value;	//get the town name from the text input
    town = _town.charAt(0).toUpperCase() + _town.slice(1).toLowerCase();	//set the global variable town to the inputted town
    var _location = _town + ",NZ";	//append 'NZ' to the end of the town
    var _apiKey = 'v8XbHyXGIpUho1U3G5Qk1gpst7nrRA9Z';    //the api key for mapquest
    var _url = "https://www.mapquestapi.com/geocoding/v1/address?key=" + _apiKey + "&location=" + _location;   //create the url from the request (needs location and API key)
    fetch(_url).then(function(response) { 
	if(response.ok){
		return response.json();
	}
	else{
		document.getElementById('infoHead').innerHTML = "Unable to find town <span id='highlight'>" + town + "</span> at this time due to network issues. Please try again later.";
	}
	}).then(json => updateMap(json));	//make the fetch request given the url. parse the response as json, give the response to the callback function
}

/* call back function for the geocode retrival fetch*/
 function updateMap(info){
	if(info.info.statuscode == 0){	//if the request was successful (status code 0)
	     var _found = false;
	     for(i = 0; i < info.results[0].locations.length; i++){	//loop through all the locations that the geocode API has sent back
		 if(info.results[0].locations[i].geocodeQuality == "CITY" && info.results[0].locations[i].adminArea1 == "NZ" && info.results[0].locations[i].adminArea5.toLowerCase() == town.toLowerCase()){	//check that the input entered is a city and is in New Zealand
		    lat = info.results[0].locations[i].latLng.lat;	//set the global latitude and longitude
		    long = info.results[0].locations[i].latLng.lng;
		    _found = true;	//set found to true - a town has been found matching the user input	
			var find = townsList.find(findtown => findtown.getName() === town);	//check if the town is already in the list of recent searches
			if(find == null){	//if the town hasn't been added already
				townsList.push(new Town(town, lat, long));	//add the town to the list	
				var recentList = document.getElementById('recent');	//get the list container for the recent searches list
				var newTown = document.createElement('li');	//add the town to the recent searches list
				newTown.innerHTML = town;	//set the innerhtml of the list element to the town
				newTown.id = town;		
				newTown.onclick = function() {	//if the object is clicked on, update the map and infomation to that town
					currTown = this.id;
					town = currTown;
					var _townObj = townsList.find(town => town.getName() === currTown);	//find the town object with the given name in the list of towns
					lat = _townObj.getLat();	//get the latitude of the town
					long = _townObj.getLong();	//get the longitude of the town
					updateAll();			//call update all to change the map and information to the clicked on town
				};
				recentList.appendChild(newTown);
			}
			updateAll();	//call update all to change map view, update weather and sun rise/set info			
		    break;
		 }			
	     }
	     if(_found == false){	//if the location was unable to be found as a city in new zealand, display this as a message
		document.getElementById('infoHead').innerHTML = "Unable to find town <span id='highlight'>" + town + "</span> in New Zealand.<br> <span id='small'> Please ensure your spelling is correct and you're searching for a town/city.</span>";
	     }     
	}else{	//if the request was unsuccessful
		document.getElementById('infoHead').innerHTML = "Unable to find town <span id='highlight'>" + town + "</span> in New Zealand.<br> <span id='small'> Please ensure your spelling is correct and you're searching for a town/city.</span>";	//display an error message to the user
		console.log(info.info.statuscode)	//print the status code to the console for debugging
	}
	
 }

function sunUpdate(){
    var _url = "php/sun.php?lat=" + lat + "&long=" + long;
    fetch(_url).then(function(response) { 
	if(response.ok){	//check that the request was successful, return the response as json if it was
		return response.json();
	}
	else{	//if unsuccessful, tell the user
		var error = document.createElement("li");
		error.innerHTML = "Unable to display sunrise & sunset information.";
		list.appendChild(error);
	}
	}).then(json => sunCallback(json));	//make a fetch request to sun.php, parse the respsonse as JSON
}
function sunCallback(info){
	var _info = JSON.parse(info);
	
	if(_info.status == "OK"){	//if the fetch request was successful
		var srLength = _info.results.sunrise.length;					//get the length of the sunrise string
		var ssLength = _info.results.sunset.length;
		var nzSunrise = _info.results.sunrise.substring(0, srLength - 6) + " AM";	//convert the UTC time to NZ time by changing the PM to AM (NZ is 12 hours ahead)
		var nzSunset = _info.results.sunset.substring(0, ssLength - 6) + " PM";		//convert the UTC time to NZ time by changing the PM to AM (NZ is 12 hours ahead) also remove the seconds to make it more readable
		var sunrise = document.createElement("li");			//create a new list item element to hold the sunset value
		sunrise.innerHTML = "<span id='b'>Sunrise: </span>" + nzSunrise;	//set the innerhtml to the sunrise data from the fetch request
		var sunset = document.createElement("li");			//create a new list item element to hold the sunrise value
		sunset.innerHTML = "<span id='b'>Sunset: </span>" + nzSunset;		//set the innerhtml to the sunset data from the json response

		//append the list items to the list element
		list.appendChild(sunrise);
		list.appendChild(sunset);
	}else{
		var error = document.createElement("li");
		error.innerHTML = "Unable to display sunrise & sunset information.";
		list.appendChild(error);
	}
}

/*
Creates an ajax request to get the weather information for the current town
*/
function weatherUpdate(){
    let request = new XMLHttpRequest();	//create a ajax request
    var _url = "php/weather.php?lat=" + lat + "&long=" + long; //create the url to use for getting the weather information
    request.open("GET", _url, true);	//open the request using the "get" method, the url created and make it async
    
    request.onreadystatechange = function(){	//when the readystate changes
        if(request.readyState == 4){	//if the request has completed
            if(request.status == 200){	//if the request was successful
                let response = request.responseXML;	//get the response xml from the request
                weatherCallback(response);	//call the callback function, passing int the xml response
            } else{	//if the request was unsuccessful
		var unable = document.createElement("li");
		unable.innerHTML = "Unable to display weather information.";	//display a message to the user letting them know the weather is unable to be shown
		list.appendChild(unable);
            }
        }
    }
    request.send();
}

/* call back function for the weather ajax request
- takes the xml data returned by the request and adds the relevant data to the list div as list elements*/
function weatherCallback(xmlData) {
	var _error = xmlData.getElementsByTagName("cod")[0];
	if(_error != null){	//if an error has been sent back as response, display a message to the user
		var unable = document.createElement("li");
		unable.innerHTML = "Unable to display weather information.";	//display a message to the user letting them know the weather is unable to be shown
		list.appendChild(unable);
		console.log(_error.childNodes[0].nodeValue); //output the error code to the console for debugging
	}else{
	    	var _weather = xmlData.getElementsByTagName("weather")[0];
		var _temp = xmlData.getElementsByTagName("temperature")[0];

		var weather = document.createElement("li");	//create a list item to hold the current weather
		var value = _weather.getAttribute('value').charAt(0).toUpperCase() + _weather.getAttribute('value').slice(1).toLowerCase();	//format the weather string 
		weather.innerHTML = "<span id='b'>Current Weather: </span>" + value;	//add the weather data to the innerhtml of the weather list item
		var maxT = document.createElement("li");	//create a list item to hold the max temp
		maxT.innerHTML = "<span id='b'>Max Temp: </span>" + _temp.getAttribute('max') + " °C";	//set the inner html of the max temp element to the max temp from the xml data
		var minT = document.createElement("li");	//create a list item to hold the min temp
		minT.innerHTML = "<span id='b'>Min Temp: </span>" + _temp.getAttribute('min') + " °C";	//set the innerhtml to the min temp from the xml data

		//add all the list nodes to the list
		list.appendChild(weather);
		list.appendChild(minT);
		list.appendChild(maxT);
	}
}

/* function to update all information when a new town is searched/selected from recent search list */
function updateAll(){
	while(list.hasChildNodes()){	//remove all the previous town's weather information
		list.removeChild(list.firstChild);
	}
	document.getElementById('infoHead').innerHTML = town;
    	mymap.setView([lat, long], 13);	//change the map view to the current town
   	sunUpdate();	//get the sunrise/sunset info for the current town
    	weatherUpdate();	//get the weather info for the current town
}
