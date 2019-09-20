var express = require('express');
var bodyParser = require('body-parser');
const cheerio = require('cheerio');
const axios = require('axios');
const ar = require('async-request');
const cors = require('cors');
const categoryService = require('./categoryService');
var port = process.env.PORT || 3000;
var app = express();

const MAIN_URL = "https://ironsrc.jul.co.il/";
const productClassSelector = 'li.product.type-product';
const ON_SALE_CLASS = 'onsale';
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
  fetchAmountOfPages(url,req.url, res);
});


function parseProducts(response, res) {
   let productsOnSale = [];
    const $ = cheerio.load(response.data);
    let products = $(productClassSelector);
    
    for(let i = 0; i < products.length; i++) {
      let product = products[i];

      let anchor = product.children[1];
      let onSaleSpan = anchor.children[8];
      if(onSaleSpan && onSaleSpan.attribs.class === ON_SALE_CLASS) {
      
        let image = anchor.children[0].attribs.src;
        let productName = anchor.children[4].children[0].data.trim();
        let price = anchor.children[2].children[2].children[0].children[1].data.trim();

        let productOnSale = {};
        productOnSale.name = productName;
        productOnSale.image = image;
        productOnSale.price = '₪' + price;
        productOnSale.link = anchor.attribs.href;

        productsOnSale.push(productOnSale);
        productOnSale = {};
      }
    }

     res.status(200).json({ message: productsOnSale});
}


function getProducts(url, category, maxAmountOfPages, res) {
  url = `https://ironsrc.jul.co.il/product-category` + category + `/?fwp_load_more=${maxAmountOfPages}`;
  
  axios.get(url).then(response => {
    parseProducts(response, res);
  })
  .catch(error => {
    console.log(error);
  })
}

async function fetchAmountOfPages(url,category,res) {

  const resp = await ar(url, {
        method: 'POST',
        data: {
            action: 'facetwp_refresh',
            'data[template]': 'wp'
        }
    });

    const data = JSON.parse(resp.body);

    let settings = data.settings;
    let max = settings.pager.total_pages;
    max--;

    getProducts(url, category, max, res);
}



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

