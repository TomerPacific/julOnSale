var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
const rp = require('request-promise');
const cheerio = require('cheerio');
const CATEGORY_WORD_LENGTH = 9;
var port = process.env.PORT || 3000;
var app = express();
const MAIN_URL = "https://ironsrc.jul.co.il/";
const shoppingCategoriesClass = ".product-category.product";
let categoriesArr = [];
let category = {};

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
 
    rp(MAIN_URL)
    .then(function(html){
      categoriesArr = [];
      let categories = parseCategoriesFromHtml(html);

      res.status(200).json({ message: categoriesArr});
    })
    .catch(function(err){
      console.log(err);
    });
});

//Routes for categories
app.get('/category/baby', function (req, res) {
    rp(MAIN_URL + '/product-category/baby/')
    .then(function(html){
      let products = getProductsOnSale(html);
      res.status(200).json({ message: products});
    })
    .catch(function(err){
      console.log(err);
    });
});


app.listen(port, function () {
 console.log('Jul app listening on port ' + port);
});

function getProductsOnSale(html) {
  let products = cheerio('.product.type-product', html);
  let productsOnSale = [];

  for (let index = 0; index < products.length; index++) {
    let product = products[index];
    let productLink = product.children[1];
    let onSaleSpan = productLink.children[8];
    if (onSaleSpan && onSaleSpan.attribs.class === 'onsale') {
      productsOnSale.push(product);
    }
  }

  return productsOnSale;
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