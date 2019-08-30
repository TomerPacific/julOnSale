let mainDiv = document.getElementById("main");
let loader = document.getElementsByClassName("loader");
let dateHeader = document.getElementById('date');

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const url = "https://ironsrc.jul.co.il/";

var xmlHttp = new XMLHttpRequest();
xmlHttp.open("GET", url, true);
xmlHttp.setRequestHeader("Content-Type", "application/json");

xmlHttp.onload = function() {
	var responseText = xmlHttp.responseText;
	if (!responseText) {
		return;
	}

	mainDiv.style.display = "block";

	setCurrentDate();

	let data = parseJson(responseText);
	if (!data) {
		return;
	}
	
};

xmlHttp.onerror = function() {
	console.log("Error");
};

xmlHttp.send();

function parseJson(json) {
	let data = null;
	try {
		data = JSON.parse(json);
	} catch (e) {
		console.error("JSON parse error " + e.message);
	}

	return data;
}

function setCurrentDate() {
	var currentDate = new Date();
	dateHeader.innerHTML = "For the day of : " + months[currentDate.getMonth()] + ' ' + currentDate.getDate() + ' ' + currentDate.getFullYear();
	dateHeader.style.display = "block";
}