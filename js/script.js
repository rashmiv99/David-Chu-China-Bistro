// We want the function below to start only when the DOM Content is loaded.
// We would ideally love to use straightforward JavaScript, but we can't because we need to use JQuery library.
// The collapse menu that we're trying to use here, is a plugin that is hosted in bootstrap.min.js.
// And that is based on, and dependent on JQuery.
// So we can't avoid the JQuery library, atleast for this particular piece.

//The JQuery function name is $
$(function () { // Function $ is the same as document.addEventListener("DOMContentLoaded"...)

	// In JQuery, the $ sign also serves another purpose: as a querySelector.
	// Same as document.querySelector("#navbarToggle").addEventListener("blur",...)
	$("#navbarToggle").blur(function (event) { // onblur: an event which describes that element has gone out of focus.
		var screenWidth = window.innerWidth; // window.innerWidth: width of the browser, not the monitor
		if (screenWidth < 768) {
			$("#collapsable-nav").collapse('hide'); //collapse is function, which is a plugin from bootstrap and depends on JQuery
		}
		// if the button lost focus and the screen width is < 768, then collapse the navbar.
	});
	// Ideally, by using just above, the functionality ought to work.
	// On some browsers, the click event doesn't retain focus on the clicked button.
	// Therefore, the blur event will not be fired, when the user clicks elsewhere in the page.
	// And so, the blur event handler will not be called.
	// Solution: force focus on the element that the click event fired on.
	
	$("#navbarToggle").click(function (event) { // when the button is clicked...
		$(event.target).focus(); // force focus on it. :)
	});
});
//---------------------------------------------------------------------------------------------------------

(function (global) { //IIFE
	var dc = {}; // David Chu's. Whatever properties we apply to dc, is going to get exposed a global object in the end.
	
	var homeHtml = "snippets/home-snippet.html";
	var allCategoriesUrl = "https://davids-restaurant.herokuapp.com/categories.json"; //server content
	var categoriesTitleHtml = "snippets/categories-title-snippet.html";
	var categoryHtml = "snippets/category-snippet.html";
	var menuItemsUrl = "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
	var menuItemsTitleHtml = "snippets/menu-items-title.html";
	var menuItemHtml = "snippets/menu-item.html";

	//Convenience function for inserting innerHTML for 'select'
	var insertHtml = function (selector, html) {
		var targetElem = document.querySelector(selector);
		targetElem.innerHTML = html;
	};

	// Ajax request will go to the server and bring us back some content, but what will be displayed till then?
	// Show loading icon inside element identified by 'selector'.
	var showLoading = function (selector) { // gimme a selector, to which I should attach this loading icon
		var html = "<div class='text-center'>";
		html += "<img src='images/ajax-loader.gif'></div>";
		insertHtml(selector, html);
	};

	// Return substitute of '{{propName}}'
	// with propValue in given 'string'
	// Will be used in category-snippet.html
	var insertProperty = function (string, propName, propValue) {
		var propToReplace = "{{" + propName + "}}";
		string = string.replace(new RegExp(propToReplace, "g"), propValue); // "g": go ahead and replace it everywhere you find in the string.
		return string;
	}

	// Remove the class 'active' from home, and switch to Menu button
	// var switchMenuToActive = function () {
	// 	// Remove 'active' from home button
	// 	var classes = document.querySelector("#navHomeButton").className;
	// 	classes = classes.replace(new RegExp("active", "g"), "");
	// 	document.querySelector("#navHomeButton").className = classes;

	// 	// Add 'active' to menu button if not already there
	// 	classes = document.querySelector("#navMenuButton").className;
	// 	if (classes.indexOf("active") == -1) { //returns -1 if "active" cannot be found
	// 		classes += " active";
	// 		document.querySelector("#navMenuButton").className = classes;
	// 	}
	// };

	var switchMenuToActive = function () {
  		// Remove 'active' from home button
  		var classes = document.querySelector("#navHomeButton").className;
  		classes = classes.replace(new RegExp("active", "g"), "");
  		document.querySelector("#navHomeButton").className = classes;

  		// Add 'active' to menu button if not already there
  		classes = document.querySelector("#navMenuButton").className;
  		if (classes.indexOf("active") == -1) {
    		classes += " active";
    		document.querySelector("#navMenuButton").className = classes;
  		}
	};


	// On page load (before images or CSS)
	document.addEventListener("DOMContentLoaded", function (event) {

		// On first load, show home view
		showLoading("#main-content");
		$ajaxUtils.sendGetRequest( //ajax-utils.js
			homeHtml, 
			function (responseText) {
				document.querySelector("#main-content")
					.innerHTML = responseText;
		}, 
		false); //AjaxRequest (homeURL, responsetext, true/false) False means that I don't want you to preprocess this as JSON, because it is an HTML snippet.
	});

	// Load the menu categories view
	dc.loadMenuCategories = function () {
		showLoading("#main-content");
		$ajaxUtils.sendGetRequest(
			allCategoriesUrl,
			buildAndShowCategoriesHTML); // function below. true is default, because it is JSON
	};

	// Load the menu items view
	// 'categoryShort' is a short_name for a category
	dc.loadMenuItems = function (categoryShort) {
		showLoading("#main-content");
		$ajaxUtils.sendGetRequest(
			menuItemsUrl + categoryShort,
			buildAndShowMenuItemsHTML);
	};

	// Builds HTML for the categories page based on the data from the server
	function buildAndShowCategoriesHTML (categories) {
		// Load title snippet of the categories page
		$ajaxUtils.sendGetRequest(
			categoriesTitleHtml, //snippet which gets the category
			function (categoriesTitleHtml) {
				// Retrieve single category snippet
				$ajaxUtils.sendGetRequest( // The second ajax request is inside the first because it makes sense for this one to get executed first, right?
					categoryHtml, //category-snippet.html
					function (categoryHtml) {
						switchMenuToActive();

						var categoriesViewHtml = 
							buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml); //synchronous
						insertHtml("#main-content", categoriesViewHtml);
					},
					false); //html snippets aren't JSON
			},
			false); // html snippets aren't JSON
	}

	// Using categories data and snippets html
	// build categories view HTML to be inserted into page
	function buildCategoriesViewHtml (categories, categoriesTitleHtml, categoryHtml) {
		var finalHtml = categoriesTitleHtml; // it's the final html snippet
		finalHtml += "<section class='row'>"; // the whole things needs to be put into a row

		// Loop over categories
		for (var i = 0; i < categories.length; i++) {
			// Insert category values
			var html = categoryHtml;
			var name = "" + categories[i].name;
			var short_name = categories[i].short_name;
			html = insertProperty(html, "name", name);
			html = insertProperty(html, "short_name", short_name);
			finalHtml += html;
		}

		finalHtml += "</section>";
		return finalHtml;
	}

	// Builds HTML for the single category page based on the data
	// from the server
	function buildAndShowMenuItemsHTML (categoryMenuItems) {
		// Load title snippet of menu items page
		$ajaxUtils.sendGetRequest(
			menuItemsTitleHtml,
			function (menuItemsTitleHtml) {
				// Retrieve single menu item snippet
				$ajaxUtils.sendGetRequest(
					menuItemHtml,
					function (menuItemHtml) {
						var menuItemsViewHtml = 
							buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemHtml);
						insertHtml("#main-content", menuItemsViewHtml);
					},
					false);
			},
			false);
	}

	// Using category and menu items data and snippets html
	// build menu items view HTML to be inserted into page
	// similar to a previous function
	function buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemHtml) {
		menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "name", categoryMenuItems.category.name);
		menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "special_instructions", categoryMenuItems.category.special_instructions);
		var finalHtml = menuItemsTitleHtml;
		finalHtml += "<section class='row'>";

		// Loop over menu items
		var menuItems = categoryMenuItems.menu_items;
		var catShortName = categoryMenuItems.category.short_name;
		for (var i = 0; i < menuItems.length; i++) {
			// Insert menu item values
			var html = menuItemHtml;
			html = insertProperty(html, "short_name", menuItems[i].short_name);
			html = insertProperty(html, "catShortName", catShortName);
			html = insertItemPrice(html, "price_small", menuItems[i].price_small);
			html = insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);
			html = insertItemPrice(html, "price_large", menuItems[i].price_large);
			html = insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);
			html = insertProperty(html, "name", menuItems[i].name);
			html = insertProperty(html, "description", menuItems[i].description);

			//Add clearfix after every second menu item; to clear floated content. the description could be big for some, and small for some others.
			if (i % 2 != 0) { // arrays are 0 based here
				html += "<div class='clearfix visible-lg-block visible-md-block'></div>";
			}

			finalHtml += html;
		}
		finalHtml += "</section>";
		return finalHtml;
	}

	//Appends price with '$' if price exists
	function insertItemPrice(html, pricePropName, priceValue) {
		// If not specified, replace with empty string
		if (!priceValue) {
			return insertProperty(html, pricePropName, "");;
		}

		priceValue = "$" + priceValue.toFixed(2); //decimal places
		html = insertProperty(html, pricePropName, priceValue);
		return html;
	}

	// Appends portion name in parens if it exists
	function insertItemPortionName(html, portionPropName, portionValue) {
		// If not specified, return original string
		if (!portionValue) {
			return insertProperty(html, portionPropName, "");
		}
		portionValue = "(" + portionValue + ")";
		html = insertProperty(html, portionPropName, portionValue);
		return html;
	}

	global.$dc = dc; //exposing dc globally so that home-snippet.html can use it.
})(window);




// $(function () { // Same as document.addEventListener("DOMContentLoaded"...

//   // Same as document.querySelector("#navbarToggle").addEventListener("blur",...
//   $("#navbarToggle").blur(function (event) {
//     var screenWidth = window.innerWidth;
//     if (screenWidth < 768) {
//       $("#collapsable-nav").collapse('hide');
//     }
//   });

//   // In Firefox and Safari, the click event doesn't retain the focus
//   // on the clicked button. Therefore, the blur event will not fire on
//   // user clicking somewhere else in the page and the blur event handler
//   // which is set up above will not be called.
//   // Refer to issue #28 in the repo.
//   // Solution: force focus on the element that the click event fired on
//   $("#navbarToggle").click(function (event) {
//     $(event.target).focus();
//   });
// });

// (function (global) {

// var dc = {};

// var homeHtml = "snippets/home-snippet.html";
// var allCategoriesUrl =
//   "https://davids-restaurant.herokuapp.com/categories.json";
// var categoriesTitleHtml = "snippets/categories-title-snippet.html";
// var categoryHtml = "snippets/category-snippet.html";
// var menuItemsUrl =
//   "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
// var menuItemsTitleHtml = "snippets/menu-items-title.html";
// var menuItemHtml = "snippets/menu-item.html";

// // Convenience function for inserting innerHTML for 'select'
// var insertHtml = function (selector, html) {
//   var targetElem = document.querySelector(selector);
//   targetElem.innerHTML = html;
// };

// // Show loading icon inside element identified by 'selector'.
// var showLoading = function (selector) {
//   var html = "<div class='text-center'>";
//   html += "<img src='images/ajax-loader.gif'></div>";
//   insertHtml(selector, html);
// };

// // Return substitute of '{{propName}}'
// // with propValue in given 'string'
// var insertProperty = function (string, propName, propValue) {
//   var propToReplace = "{{" + propName + "}}";
//   string = string
//     .replace(new RegExp(propToReplace, "g"), propValue);
//   return string;
// }

// // Remove the class 'active' from home and switch to Menu button
// var switchMenuToActive = function () {
//   // Remove 'active' from home button
//   var classes = document.querySelector("#navHomeButton").className;
//   classes = classes.replace(new RegExp("active", "g"), "");
//   document.querySelector("#navHomeButton").className = classes;

//   // Add 'active' to menu button if not already there
//   classes = document.querySelector("#navMenuButton").className;
//   if (classes.indexOf("active") == -1) {
//     classes += " active";
//     document.querySelector("#navMenuButton").className = classes;
//   }
// };

// // On page load (before images or CSS)
// document.addEventListener("DOMContentLoaded", function (event) {

// // On first load, show home view
// showLoading("#main-content");
// $ajaxUtils.sendGetRequest(
//   homeHtml,
//   function (responseText) {
//     document.querySelector("#main-content")
//       .innerHTML = responseText;
//   },
//   false);
// });

// // Load the menu categories view
// dc.loadMenuCategories = function () {
//   showLoading("#main-content");
//   $ajaxUtils.sendGetRequest(
//     allCategoriesUrl,
//     buildAndShowCategoriesHTML);
// };


// // Load the menu items view
// // 'categoryShort' is a short_name for a category
// dc.loadMenuItems = function (categoryShort) {
//   showLoading("#main-content");
//   $ajaxUtils.sendGetRequest(
//     menuItemsUrl + categoryShort,
//     buildAndShowMenuItemsHTML);
// };


// // Builds HTML for the categories page based on the data
// // from the server
// function buildAndShowCategoriesHTML (categories) {
//   // Load title snippet of categories page
//   $ajaxUtils.sendGetRequest(
//     categoriesTitleHtml,
//     function (categoriesTitleHtml) {
//       // Retrieve single category snippet
//       $ajaxUtils.sendGetRequest(
//         categoryHtml,
//         function (categoryHtml) {
//           // Switch CSS class active to menu button
//           switchMenuToActive();

//           var categoriesViewHtml =
//             buildCategoriesViewHtml(categories,
//                                     categoriesTitleHtml,
//                                     categoryHtml);
//           insertHtml("#main-content", categoriesViewHtml);
//         },
//         false);
//     },
//     false);
// }


// // Using categories data and snippets html
// // build categories view HTML to be inserted into page
// function buildCategoriesViewHtml(categories,
//                                  categoriesTitleHtml,
//                                  categoryHtml) {

//   var finalHtml = categoriesTitleHtml;
//   finalHtml += "<section class='row'>";

//   // Loop over categories
//   for (var i = 0; i < categories.length; i++) {
//     // Insert category values
//     var html = categoryHtml;
//     var name = "" + categories[i].name;
//     var short_name = categories[i].short_name;
//     html =
//       insertProperty(html, "name", name);
//     html =
//       insertProperty(html,
//                      "short_name",
//                      short_name);
//     finalHtml += html;
//   }

//   finalHtml += "</section>";
//   return finalHtml;
// }



// // Builds HTML for the single category page based on the data
// // from the server
// function buildAndShowMenuItemsHTML (categoryMenuItems) {
//   // Load title snippet of menu items page
//   $ajaxUtils.sendGetRequest(
//     menuItemsTitleHtml,
//     function (menuItemsTitleHtml) {
//       // Retrieve single menu item snippet
//       $ajaxUtils.sendGetRequest(
//         menuItemHtml,
//         function (menuItemHtml) {
//           // Switch CSS class active to menu button
//           switchMenuToActive();

//           var menuItemsViewHtml =
//             buildMenuItemsViewHtml(categoryMenuItems,
//                                    menuItemsTitleHtml,
//                                    menuItemHtml);
//           insertHtml("#main-content", menuItemsViewHtml);
//         },
//         false);
//     },
//     false);
// }


// // Using category and menu items data and snippets html
// // build menu items view HTML to be inserted into page
// function buildMenuItemsViewHtml(categoryMenuItems,
//                                 menuItemsTitleHtml,
//                                 menuItemHtml) {

//   menuItemsTitleHtml =
//     insertProperty(menuItemsTitleHtml,
//                    "name",
//                    categoryMenuItems.category.name);
//   menuItemsTitleHtml =
//     insertProperty(menuItemsTitleHtml,
//                    "special_instructions",
//                    categoryMenuItems.category.special_instructions);

//   var finalHtml = menuItemsTitleHtml;
//   finalHtml += "<section class='row'>";

//   // Loop over menu items
//   var menuItems = categoryMenuItems.menu_items;
//   var catShortName = categoryMenuItems.category.short_name;
//   for (var i = 0; i < menuItems.length; i++) {
//     // Insert menu item values
//     var html = menuItemHtml;
//     html =
//       insertProperty(html, "short_name", menuItems[i].short_name);
//     html =
//       insertProperty(html,
//                      "catShortName",
//                      catShortName);
//     html =
//       insertItemPrice(html,
//                       "price_small",
//                       menuItems[i].price_small);
//     html =
//       insertItemPortionName(html,
//                             "small_portion_name",
//                             menuItems[i].small_portion_name);
//     html =
//       insertItemPrice(html,
//                       "price_large",
//                       menuItems[i].price_large);
//     html =
//       insertItemPortionName(html,
//                             "large_portion_name",
//                             menuItems[i].large_portion_name);
//     html =
//       insertProperty(html,
//                      "name",
//                      menuItems[i].name);
//     html =
//       insertProperty(html,
//                      "description",
//                      menuItems[i].description);

//     // Add clearfix after every second menu item
//     if (i % 2 != 0) {
//       html +=
//         "<div class='clearfix visible-lg-block visible-md-block'></div>";
//     }

//     finalHtml += html;
//   }

//   finalHtml += "</section>";
//   return finalHtml;
// }


// // Appends price with '$' if price exists
// function insertItemPrice(html,
//                          pricePropName,
//                          priceValue) {
//   // If not specified, replace with empty string
//   if (!priceValue) {
//     return insertProperty(html, pricePropName, "");;
//   }

//   priceValue = "$" + priceValue.toFixed(2);
//   html = insertProperty(html, pricePropName, priceValue);
//   return html;
// }


// // Appends portion name in parens if it exists
// function insertItemPortionName(html,
//                                portionPropName,
//                                portionValue) {
//   // If not specified, return original string
//   if (!portionValue) {
//     return insertProperty(html, portionPropName, "");
//   }

//   portionValue = "(" + portionValue + ")";
//   html = insertProperty(html, portionPropName, portionValue);
//   return html;
// }


// global.$dc = dc;

// })(window);
