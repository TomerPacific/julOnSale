var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
const puppeteer = require('puppeteer');
const CATEGORY_WORD_LENGTH = 9;
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
  let productOnSale = {};

  for (let index = 0; index < products.length; index++) {
    let product = products[index];
    let productLink = product.children[1];
    let onSaleSpan = productLink.children[8];

    if (onSaleSpan && onSaleSpan.attribs.class === 'onsale') {
      productOnSale.link = productLink.attribs.href;
      let children = productLink.children;
      let image = children[0];
      productOnSale.image = image.attribs.src;

      let priceParent = children[2];
      let salePrice = priceParent.children[2];
      let innerChild = salePrice.children[0].children[1].data;
      productOnSale.price = innerChild;
    
      productsOnSale.push(productOnSale);
      productOnSale = {};
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