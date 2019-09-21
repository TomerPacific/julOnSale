var express = require('express');
var bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const categoryService = require('./categoryService');
const productsService = require('./productsService');


var port = process.env.PORT || 3000;
var app = express();
const MAIN_URL = "https://ironsrc.jul.co.il/";
const daysPassedToScrapeAgain = 1;

let categoriesArr = [];
let lastDateScraped;


app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});

app.use(cors({
  credentials: true,
  origin: 'https://tomerpacific.github.io'
}));


//Main route for getting categories
app.get('/jul', function (req, res) {
  if (categoriesArr.length !== 0 && !enoughDaysHavePassed()) {
    res.status(200).json({ message: categoriesArr});
  }

  axios.get(MAIN_URL).then(response => {
    lastDateScraped = new Date();
    categoriesArr = categoryService.parseCategoriesFromHtml(response.data);
    res.status(200).json({ message: categoriesArr});
  })
  .catch(error => {
    console.log(error);
  })
  
  
});

//Route for categories
app.get('/category/*', function (req, res) {
  let url = `https://ironsrc.jul.co.il/product-category` + req.url + `/?fwp_load_more=1`;
  productsService.fetchAmountOfPages(url,req.url, res);
});



app.listen(port, function () {
 console.log('Jul app listening on port ' + port);
});


function enoughDaysHavePassed(lastDateScraped) {
  
  if (!lastDateScraped) {
    return true;
  }
  
  let timeDifference = new Date().getTime() - lastDateScraped.getTime();
  let dayDifference = Math.floor(timeDifference / 1000*60*60*24);

  return dayDifference > daysPassedToScrapeAgain;
}

