let mainDiv = document.getElementById("main");
let loader = document.getElementsByClassName("loader");
let dateHeader = document.getElementById('date');

const url = "https://jul-on-sale.herokuapp.com/jul";

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
		showServerError("JSON data is missing");
		return;
	}

	if (data.message.length === 0) {
		showServerError("No categories received");
		return;
	}

	mainDiv.innerHTML = '';
	
	loadData(data.message);

	loader[0].style.display = "none";
};

xmlHttp.onerror = function(error) {
	console.error(error);
	showServerError(error);
};

xmlHttp.send();

function loadData(categories) {

	for (let index = 0; index < categories.length; index++)
	 {
		let category = categories[index];
		let div = document.createElement('div');
		let header = document.createElement('h3');
		let anchor = document.createElement('a');
		let image = document.createElement('img');

		header.innerHTML = category.name;
		image.src = 'https://github.com/TomerPacific/julOnSale/blob/master/assets/' + category.image + '.png?raw=true';
		image.setAttribute('class', 'category');
		anchor.href = "https://tomerpacific.github.io/julOnSale/categories/" + category.image + "/" + category.image + ".html";
		anchor.innerHTML = '<img src=' + image.src + ' class="category" alt=' + category.name + ' title=' + category.name + '>';

		div.appendChild(header);
		div.appendChild(anchor);
		div.setAttribute('class', 'container');
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

function showServerError(error) {
	loader[0].style.display = "none";
	let serverErrorDiv = document.getElementById("server-error");
	serverErrorDiv.innerHTML = "אוי לא! כנראה שישנה בעיה עם השרת. אנא נסו שנית מאוחר יותר."
}


setCurrentDate(dateHeader);