let mainDiv = document.getElementById("main");
let loader = document.getElementsByClassName("loader");
let dateHeader = document.getElementById('date');

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const url = "https://jul-on-sale.herokuapp.com/jul";

var xmlHttp = new XMLHttpRequest();
xmlHttp.open("GET", url, true);
xmlHttp.setRequestHeader("Content-Type", "application/json");

xmlHttp.onload = function() {
	var responseText = xmlHttp.responseText;
	if (!responseText) {
		return;
	}

	setCurrentDate();

	let data = parseJson(responseText);
	if (!data || !data.message) {
		return;
	}
	
	let categories = data.message;

	for (let index = 0; index < categories.length; index++) {
		let category = categories[index];
		let div = document.createElement('div');
		let anchor = document.createElement('a');
		a.href = category.link;
		a.innerHTML = category.name;
		div.appendChild(anchor);
		mainDiv.appendChild(div);
	}

	loader[0].style.display = "none";
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