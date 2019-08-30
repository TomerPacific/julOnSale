var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
const rp = require('request-promise');
const cheerio = require('cheerio');
var port = process.env.PORT || 3000;
var app = express();

const url = "https://ironsrc.jul.co.il/";
const onSaleClass = "onsale";
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

app.get('/jul', function (req, res) {
 
    rp(url)
    .then(function(html){
      cheerio('.service-status', html);

      let categories = parseCategoriesFromHtml(html);

      res.status(200).json({ message: categoriesArr});
    })
    .catch(function(err){
      console.log(err);
    });
});


app.listen(port, function () {
 console.log('Jul app listening on port ' + port);
});


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
                categoriesArr.push(category);
                category = {};
              }
          
            }
      }
   return categories;
}