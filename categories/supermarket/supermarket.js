let mainDiv = document.getElementById("main");
let loader = document.getElementsByClassName("loader");
let dateHeader = document.getElementById('date');

const url = "https://jul-on-sale.herokuapp.com/category/supermarket";

var xmlHttp = new XMLHttpRequest();
xmlHttp.open("GET", url, true);
xmlHttp.setRequestHeader("Content-Type", "application/json");

xmlHttp.onload = function() {
	var responseText = xmlHttp.responseText;
	if (!responseText) {
		return;
	}

	let data = parseJson(responseText);
	if (!data || !data.message) {
		return;
	}

	mainDiv.innerHTML = '';
	
	loadData(data.message);

	loader[0].style.display = "none";
};

xmlHttp.onerror = function() {
	console.log("Error");
};

xmlHttp.send();

function loadData(items) {
	for (let index = 0; index < items.length; index++)
	 {
		let item = items[index];
		let div = document.createElement('div');
		let nameHeader = document.createElement('h3');
		let priceHeader = document.createElement('h2');
		let anchor = document.createElement('a');
		let image = document.createElement('img');

		nameHeader.innerHTML = item.name;
		image.src = item.image;
		anchor.href = item.link;
		priceHeader.innerHTML = item.price;

		image.setAttribute('class', 'item');
		anchor.innerHTML = '<img src=' + image.src + ' class="item" alt=' + item.name + ' title=' + item.name + '>';

		div.appendChild(nameHeader);
		div.appendChild(anchor);
		div.appendChild(priceHeader);
		mainDiv.appendChild(div);
	}
}

function parseJson(json) {
	let data = null;
	try {
		data = JSON.parse(json);
	} catch (e) {
		console.error("JSON parse error " + e.message);
	}

	return data;
}

setCurrentDate(dateHeader);
