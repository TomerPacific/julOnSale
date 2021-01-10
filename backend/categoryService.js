/* CategoryService.js */

const cheerio = require('cheerio');
const shoppingCategoriesClass = ".product-category.product";
const CATEGORY_WORD_LENGTH = 8;
const CATEGORIES = ['baby', 'electronics', 'fresh-market', 'gifts', 'health', 'household', 'kitchenware', 'liquor-tobacco', 'personal-care', 'pets', 'sales', 'sports', 'supermarket'];

module.exports = {
 	parseCategoriesFromHtml: function(html) {
	  let categories = cheerio(shoppingCategoriesClass, html);
	  let category ={};
	  let categoriesArr = [];
	  for(let i = 0; i < categories.length; i++) {
	       let children = categories[i].children;
	        for(let j = 0; j < children.length; j++) {
	          if (children[j].name === 'a') {
	            category.link = children[j].attribs.href;
	            let innerChildren = children[j].children;
	            let header = innerChildren[2];
	            let categoryNameInHebrew = header.children[0].data.trim();

	            let categoryName = this.getCategoryNameFromLink(category.link);
	            categoryName = categoryName.substring(1);
	            
	            if (!CATEGORIES.includes(categoryName)) {
	            	continue;
	            }
	            
	            category.name = categoryNameInHebrew;
	            category.image = this.getCategoryNameFromLink(category.link);
	            categoriesArr.push(category);
	            category = {};
	      	}
	   	 }
  		}

  	return categoriesArr;
	},
	getCategoryNameFromLink: function(link) {
	  let catroryWordIndex = link.indexOf('category');
	  let categoryName = link.substring(catroryWordIndex + CATEGORY_WORD_LENGTH, link.length - 1);
	  return categoryName;
	}
};