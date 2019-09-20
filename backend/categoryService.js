/* CategoryService.js */

const cheerio = require('cheerio');
const shoppingCategoriesClass = ".product-category.product";
const CATEGORY_WORD_LENGTH = 8;

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
	            let categoryName = header.children[0].data.trim();
	            category.name = categoryName;
	            category.image = this.assignCategoryImage(category.link);
	            categoriesArr.push(category);
	            category = {};
	      	}
	   	 }
  		}

  	return categoriesArr;
	},
	assignCategoryImage: function(link) {
	  let catroryWordIndex = link.indexOf('category');
	  let categoryName = link.substring(catroryWordIndex + CATEGORY_WORD_LENGTH, link.length - 1);
	  return categoryName;
	}
};