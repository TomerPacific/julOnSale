var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
const puppeteer = require('puppeteer');
var port = process.env.PORT || 3000;
var app = express();
const MAIN_URL = "https://ironsrc.jul.co.il/";
const shoppingCategoriesClass = ".product-category.product";

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
  })();
  
})
  

//Routes for categories
app.get('/category/baby', function (req, res) {
   getProductsOnSale(res);
});


app.listen(port, function () {
 console.log('Jul app listening on port ' + port);
});

function getProductsOnSale(res) {
  (async (res) => {
    
     const browser = await puppeteer.launch({devtools: true, headless: false})
     const page = await browser.newPage()
     await page.goto('https://ironsrc.jul.co.il/product-category/baby/')

     const productsOnSale = await page.evaluate(() => {
        let products = [...document.querySelectorAll(".product.type-product")];
        let productsArr = [];
        let productForSale = {};
        for(let i = 0; i < products.length; i++) {
          let product = products[i];
 
          let onSale = product.children[0].children[4];
          if (!onSale) {
            continue;
          }

          productForSale.image = product.children[0].children[0].src;
          productForSale.link = product.children[0].href;
          productForSale.price = product.children[0].children[1].children[1].textContent.trim();
          productForSale.name = product.children[0].children[2].textContent.trim();
        
          productsArr.push(productForSale);
          productForSale = {};
            
        }

           return productsArr;
        })

     res.status(200).json({ message: productsOnSale});
  })();
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