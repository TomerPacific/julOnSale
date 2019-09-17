var express = require('express');
var bodyParser = require('body-parser');
const cheerio = require('cheerio');
const axios = require('axios');
const ar = require('async-request');
var cors = require('cors');
const puppeteer = require('puppeteer');
var port = process.env.PORT || 3000;
var app = express();
const MAIN_URL = "https://ironsrc.jul.co.il/";
const shoppingCategoriesClass = ".product-category.product";
const daysPassedToScrapeAgain = 1;
var lastDateScraped;


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

 (async () => {
    
     const browser = await puppeteer.launch({
        'args' : [
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ]
      })
     const page = await browser.newPage()
     await page.goto(MAIN_URL)

     const categories = await page.evaluate(() => {
        let cats = [...document.querySelectorAll(".product-category.product")];
        let categoriesArr = [];
        let cat = {};
        const CATEGORY_WORD_LENGTH = 9;

        for(let i = 0; i < cats.length; i++) {
            let anchor = cats[i].children[0];
            cat.link = anchor.attributes.href.textContent;
            
            cat.name = anchor.children[1].textContent.trim();

            let categoryWordIndex = cat.link.indexOf('category');
            let categoryName = cat.link.substring(categoryWordIndex + CATEGORY_WORD_LENGTH, cat.link.length - 1);
            cat.image = categoryName;
            categoriesArr.push(cat);
            cat = {};
          }

           return categoriesArr;
        })

     res.status(200).json({ message: categories});
     browser.close();
  })();
  
})
  

//Routes for categories
//BABY CATEGORY
app.get('/category/baby', function (req, res) {
  let url = `https://ironsrc.jul.co.il/product-category` + req.url + `/?fwp_load_more=1`;
  fetchAmountOfPages(url,req.url, res);
});


//ELECTRONIC CATEGORY

app.get('/category/electronic', function (req, res) {
  let url = `https://ironsrc.jul.co.il/product-category` + req.url + `/?fwp_load_more=1`;
  fetchAmountOfPages(url,req.url, res);
});


//CATEGORY FRESH MARKET
app.get('/category/fresh-market', function (req, res) {
  let url = `https://ironsrc.jul.co.il/product-category` + req.url + `/?fwp_load_more=1`;
  fetchAmountOfPages(url,req.url, res);
});


function parseProducts(response, res) {
   let productsOnSale = [];
    const $ = cheerio.load(response.data);
    let products = $('li.product.type-product');
    
    for(let i = 0; i < products.length; i++) {
      let product = products[i];

      let anchor = product.children[1];
      let onSaleSpan = anchor.children[8];
      if(onSaleSpan && onSaleSpan.attribs.class === 'onsale') {
      
        let image = anchor.children[0].attribs.src;
        let productName = anchor.children[4].children[0].data.trim();
        let price = anchor.children[2].children[2].children[0].children[1].data.trim();

        let productOnSale = {};
        productOnSale.name = productName;
        productOnSale.image = image;
        productOnSale.price = price;
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

function parseCategoriesFromHtml(html) {
  let categories = cheerio(shoppingCategoriesClass, html);
      for(let i = 0; i < categories.length; i++) {
           let children = categories[i].children;
            for(let j = 0; j < children.length; j++) {
              if (children[j].name === 'a') {
                category.link = children[j].attribs.href;
                let innerChildren = children[j].children;
                let header = innerChildren[2];
                let categoryName = header.children[0].data.trim();
                category.name = categoryName;
                category.image = assignCategoryImage(category.link);
                categoriesArr.push(category);
                category = {};
              }
          
            }
      }
   return categories;
}


function assignCategoryImage(link) {
  let catroryWordIndex = link.indexOf('category');
  let categoryName = link.substring(catroryWordIndex + CATEGORY_WORD_LENGTH, link.length - 1);
  return categoryName;
}