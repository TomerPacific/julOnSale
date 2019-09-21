/* ProductsService  */

const cheerio = require('cheerio');
const axios = require('axios');
const ar = require('async-request');
const productClassSelector = 'li.product.type-product';
const ON_SALE_CLASS = 'onsale';

module.exports = {

	parseProducts: function(response, res) {
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
	},


	getProducts: function(url, category, maxAmountOfPages, res) {
	  url = `https://ironsrc.jul.co.il/product-category` + category + `/?fwp_load_more=${maxAmountOfPages}`;
	  
	  axios.get(url).then(response => {
	    this.parseProducts(response, res);
	  })
	  .catch(error => {
	    console.log(error);
	  })
	},

	fetchAmountOfPages: async function(url,category,res) {

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

	    this.getProducts(url, category, max, res);
	}


};
