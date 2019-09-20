const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


function setCurrentDate() {
	var currentDate = new Date();
	dateHeader.innerHTML = "For the day of " + months[currentDate.getMonth()] + ' ' + currentDate.getDate() + ', ' + currentDate.getFullYear();
	dateHeader.style.display = "block";
}


/* Jquery tab title changer */

$(function() {
	// Get page title
  	var pageTitle = $("title").text();

	// Change page title on blur
	$(window).blur(function() {
	  $("title").text(" ❤️ U");
	});

	// Change page title back on focus
	$(window).focus(function() {
	  $("title").text(pageTitle);
	});
});