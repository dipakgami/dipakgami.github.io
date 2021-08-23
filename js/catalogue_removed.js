var sheetAPIBaseURL = "https://sheets.googleapis.com/v4/spreadsheets"
var ExcelfileID = "1ydx9B9s00Jp_Q0PNjQOLERtUC-eAYm6S5_VKBDvBdwA";
var apiKey = "AIzaSyALYSx_H8_qXnLRJvuql7GzfTZ3MvlLdqI";

/*Read categories*/
var categorySheetName = "Categories";
var categoryFromRange = "A1";
var categoryToRange = "A12";

var readCategoryURL = sheetAPIBaseURL + "/" + ExcelfileID + "/values/" + categorySheetName + "!" + categoryFromRange + ":" + categoryToRange + "?key=" + apiKey;
/*Read categories ends*/

/*Read products*/
var productSheetName = "Products";
var productFromRange = "A1";
var productToRange = "E12";
var readProductURL = sheetAPIBaseURL + "/" + ExcelfileID + "/values/" + productSheetName + "!" + productFromRange + ":" + productToRange + "?key=" + apiKey;
/*Read products ends*/

/*Read products*/
var productVariantsSheetName = "ProductVariants";
var productVariantsFromRange = "A1";
var productVariantsToRange = "F15";
var readProductVariantsURL = sheetAPIBaseURL + "/" + ExcelfileID + "/values/" + productVariantsSheetName + "!" + productVariantsFromRange + ":" + productVariantsToRange + "?key=" + apiKey;
/*Read products ends*/

var categoryResult = null;
var productResult = null;
var productVariantsResult = null;

$(document).ready(function () {
    //fetch categories and products from local storage
    categoryResult = JSON.parse(localStorage.getItem("categoryResult"));
    productResult = JSON.parse(localStorage.getItem("productResult"));
    productVariantsResult = JSON.parse(localStorage.getItem("productVariantsResult"));

    if (categoryResult == null || categoryResult == '') {
        getCategoriesAjax();
    }
    else {
        loadMenuCategories(categoryResult);
        loadSearchCategories(categoryResult);
        loadProductsSideBarCategories(categoryResult);
        loadMobileViewMenuCat(categoryResult);
    }
    if (productResult == null || productResult == '') {
        getProductsAjax();
    }
    else {
        loadFeaturedProducts(productResult);
        loadProducts(productResult);
    }

    if (productVariantsResult == null || productVariantsResult == '') {
        getProductVariantsAjax();
    } else {
        loadProductDetails();
    }

    $("#txtSearch").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#productBlock .col-6").filter(function () {
            $(this).toggle($(this).find('.product-title a').text().toLowerCase().indexOf(value) > -1)
        });
    });

    $('#colorFilterOptions li').on('click', function (event) {
        $('#colorFilterOptions li').not(this).removeClass('active');
        $(this).addClass('active');
    });

    loadReviewCart();
});

function refreshData() {
    getCategoriesAjax();
    getProductsAjax();
    getProductVariantsAjax();

}

function getCategoriesAjax() {

    $.ajax({
        type: "GET",
        url: readCategoryURL,
        cache: false,
        dataType: "json",
        success: function (data) {
            categoryResult = data.values.slice(1); //removed first row. it contains column title
            localStorage.setItem("categoryResult", JSON.stringify(categoryResult));
            loadMenuCategories(categoryResult);
            loadSearchCategories(categoryResult);
            loadProductsSideBarCategories(categoryResult);
            loadMobileViewMenuCat(categoryResult);
        }
    });
}
function getProductsAjax() {

    $.ajax({
        type: "GET",
        url: readProductURL,
        cache: false,
        dataType: "json",
        success: function (data) {
            productResult = data.values.slice(1); //removed first row. it contains column title
            localStorage.setItem("productResult", JSON.stringify(productResult));
            loadFeaturedProducts(productResult);
            loadProducts(productResult);
        }
    });

}
function getProductVariantsAjax() {
    $.ajax({
        type: "GET",
        url: readProductVariantsURL,
        cache: false,
        dataType: "json",
        success: function (data) {
            productVariantsResult = data.values.slice(1); //removed first row. it contains column title
            localStorage.setItem("productVariantsResult", JSON.stringify(productVariantsResult));
            loadProductDetails();
        }
    });

}

/** Home page scripts**/

function loadMenuCategories(categories) {
    var catPart1 = "<li><a href='products.html'>All Categories</a></li>";
    var catPart2 = '';
    var partition = Math.round((categories.length / 2));

    for (var i = 0; i < partition; i++) {
        catPart1 += "<li><a href='products.html?category=" + categories[i] + "'>" + categories[i] + "</a></li>";
    }
    for (var j = partition; j < categories.length; j++) {
        catPart2 += "<li><a href='products.html?category=" + categories[j] + "'>" + categories[j] + "</a></li>";
    }
    $('#catPart1').html(catPart1);
    $('#catPart2').html(catPart2);
}
function loadSearchCategories(categories) {
    var ddlOptions = "<option value=''>All Categories</option>";
    for (var i = 0; i < categories.length; i++) {
        ddlOptions += "<option value=''>" + categories[i] + "</option>";
    }
    $('#searchCat').html(ddlOptions);
}

/** Product page scripts**/

function loadMobileViewMenuCat(categories) {
    var mobileViewMenuCat = '';
    for (var i = 0; i < categories.length; i++) {
        var encodedURL = encodeURIComponent(categories[i]);
        mobileViewMenuCat += "<li><a href='products.html?category=" + encodedURL + "'>" + categories[i] + "</a></li>";
        $('#mobileViewMenuCat').html(mobileViewMenuCat);
    }
}
function loadProductsSideBarCategories(categories) {
    var sidebarCat = "<li><a href='products.html'>All Categories</a></li>";
    for (var i = 0; i < categories.length; i++) {
        var encodedURL = encodeURIComponent(categories[i]);
        sidebarCat += "<li><a href='products.html?category=" + encodedURL + "'>" + categories[i] + "</a></li>";
    }
    $('#sidebarCat').html(sidebarCat);
}

function loadProducts(products) {

    var locationValue = (new URL(location.href)).searchParams.get('category')
    if (locationValue != null) {

        products = products.filter(function (obj) {
            return (obj[0] === locationValue)
        });
    }
    var productBlock = '';
    for (var i = 0; i < products.length; i++) {
        productBlock += '<div class="col-6 col-sm-4"><div class="product-default inner-quickview inner-icon"><figure><a onclick="navigateToProductDetails(\'' + products[i][1] + '\')\" href="javascript:"><img src="ProductImages/' + products[i][3] + '"></a><a href="javascript:" class="btn-quickview" onclick="quickView(\'' + products[i][1] + '\')" title="Quick View">Quick View</a></figure><div class="product-details"><div class="category-wrap"><div class="category-list"><a href="javascript:" class="product-category">' + products[i][0] + '</a></div></div><h3 class="product-title"><a onclick="navigateToProductDetails("' + products[i][1] + '")" href="javascript:">' + products[i][2] + '</a></h3></div></div></div>';

    }
    $('#productBlock').html(productBlock);
}
function loadFeaturedProducts(products) {
    var featuredProductBlock = '';
    for (var i = 0; i < 8; i++) {
        var product = products[Math.floor(Math.random() * products.length)];
        featuredProductBlock += '<div class="product-default inner-quickview inner-icon"><figure><a onclick="navigateToProductDetails(\'' + product[1] + '\')\" href="javascript:"><img src="ProductImages/' + product[3] + '"></a><a href="javascript:" class="btn-quickview" onclick="quickView(\'' + product[1] + '\')"  title="Quick View">Quick View</a> </figure> <div class="product-details"> <div class="category-wrap"> <div class="category-list"> <a href="javascript:" class="product-category">' + product[0] + '</a> </div> </div> <h3 class="product-title"> <a href="productdetails.html">' + product[2] + '</a> </h3>  </div></div>';
    }

    $('#featuredProductBlock').html(featuredProductBlock);

    var newSliderOptions = {
        "loop": false,
        "margin": 20,
        "responsiveClass": true,
        "nav": false,
        "navText": [
            "<i class=\"icon-angle-left\">",
            "<i class=\"icon-angle-right\">"
        ],
        "dots": true,
        "autoplay": false,
        "autoplayTimeout": 15000,
        "items": 2,
        "responsive": {
            "576": {
                "items": 3
            },
            "992": {
                "items": 4
            }
        }
    };
    $('#featuredProductBlock').addClass('products-slider owl-carousel');
    $('#featuredProductBlock').owlCarousel(newSliderOptions);

}

function quickView(productID) {
    var product = productResult.filter(function (obj) {
        return (obj[1] === productID)
    });

    $('#quickViewProductImage').attr('src', 'ProductImages/' + product[0][3]);
    $('#quickViewProductName').html(product[0][2]);
    $('#quickViewProductDescription').html(product[0][4]);
    $('#quickView').modal('show');
}

function navigateToProductDetails(productID) {
    localStorage.setItem("selectedProductID", productID);
    window.location.href = "productdetails.html";
}
function loadProductDetails() {

    var productID = localStorage.getItem("selectedProductID");

    if (productID != null) {
        $('#hdnProductID').val(productID);
        var product = productResult.filter(function (obj) {
            return (obj[1] === productID)
        });
        var productDetails = productVariantsResult.filter(function (obj) {
            return (obj[0] === productID)
        });
        $('#productDetailImage').attr('src', 'ProductImages/' + product[0][3]);
        $('#productDetailProductName').html(product[0][2]);
        $('#productDetailProductDescription').html(product[0][4]);

        var colorBlock = '';

        var variantCollection = [];
        var variantsArray = [];

        for (var i = 0; i < productDetails.length; i++) {
            var isUniqueVariant = true;
            for (var j = 0; j < variantCollection.length; j++) {
                if (productDetails[i][3] == variantCollection[j]) {
                    isUniqueVariant = false;
                    break;
                }
            }
            if (isUniqueVariant == true) {
                variantCollection.push(productDetails[i][3]);
            }
        }

        var productDetailTitleBlock = '';
        variantCollection.filter(function (obj) {
            var productDetailVariantBlock = '';
            if (obj != "Color") {
                if (productDetailTitleBlock == '') {
                    productDetailTitleBlock = '<div class="product-single-filter"> <div class="col-xs-6 col-sm-12 col-md-3"> <label>' + obj + ': </label> </div><div class="col-xs-6 col-sm-6 col-md-9"> <div class="row">@@VariantOptions</div></div></div>';
                }

                productDetails.filter(function (obj2) {
                    if (obj == obj2[3]) {
                        productDetailVariantBlock += '<div class="col-md-4 col-sm-6 col-xs-6 pt-3"> <input type="radio" name="' + obj + '" id="' + obj2[3] + '"_"' + obj2[2] + '" value="' + obj2[2] + '"> <label style="margin-left: 5px;" for="' + obj2[3] + '"_"' + obj2[2] + '">' + obj2[4] + '</label></div>';
                    }
                });
                productDetailTitleBlock = productDetailTitleBlock.replace("@@VariantOptions", productDetailVariantBlock);
                variantsArray.push(productDetailTitleBlock);
                productDetailTitleBlock = '';

            }
        });
        var divider = '<hr class="divider">';
        $('#otherVariants').html(variantsArray.join(divider));

        productDetails.filter(function (obj) {
            if (obj[3] == "Color") {
                colorBlock += '<li data-val="' + obj[2] + '"><div style="padding:2px;"><a href="javascript:" title="' + obj[4] + '" style="background-color:' + obj[2] + '"></a></div></li>';
            }
        });

        if (colorBlock != '') {
            $('#colorFilterOptions').html(colorBlock);
        }


    }
}

function addToCart(finalize) {

    //if (finalize == 'true') {
    //    localStorage.setItem("cart", '');
    //}
    var selectedColor = null;
    var thickness = null;
    var RAM = null;
    var quantity = $('#txtQty').val();
    var productID = $('#hdnProductID').val();

    selectedColor = $('#colorFilterOptions .active').attr('data-val');
    $(".Thickness").each(function () {
        if ($(this).is(":checked")) {
            thickness = $(this).attr('value');
        }
    });

    $(".RAM").each(function () {
        if ($(this).is(":checked")) {
            RAM = $(this).attr('value');
        }
    });

    var cartObj = [];

    if (localStorage.getItem("cart") != null && localStorage.getItem("cart") != '') {
        cartObj = JSON.parse(localStorage.getItem("cart"));
    }

    if (productID != null && selectedColor != null && thickness != null && RAM != null && quantity != null && quantity != '' && productID != '') {
        cartItem = {}
        cartItem["ProductID"] = productID;
        cartItem["Color"] = selectedColor;
        cartItem["Thickness"] = thickness;
        cartItem["RAM"] = RAM;
        cartItem["Quantity"] = quantity;
        cartObj.push(cartItem);
        localStorage.setItem("cart", JSON.stringify(cartObj));

        if (finalize == 'true') {
            window.location.href = "review.html"
        }
        $('#validationMsg').removeClass('alert alert-danger');
        $('#validationMsg').addClass('alert alert-success');
        $('#validationMsg').html('Item added..')
        $('#validationMsg').fadeIn('fast').delay(2000);
        $('#validationMsg').fadeOut('slow').delay(3000).hide(0);
    }
    else {
        $('#validationMsg').removeClass('alert alert-success');
        $('#validationMsg').addClass('alert alert-danger');
        $('#validationMsg').html('Select all options..')
        $('#validationMsg').fadeIn('fast').delay(2000);
        $('#validationMsg').fadeOut('slow').delay(3000).hide(0);
    }



}
function loadReviewCart() {
    var cartObj = [];

    if (localStorage.getItem("cart") != null && localStorage.getItem("cart") != '') {
        cartObj = JSON.parse(localStorage.getItem("cart"));


        var cartItemBlock = '';
        for (var i = 0; i < cartObj.length; i++) {

            var product = productResult.filter(function (obj) {
                return (obj[1] == cartObj[i].ProductID);
            });
            var productThickness = productVariantsResult.filter(function (obj) {
                return (obj[2] == cartObj[i].Thickness);
            });
            var productRam = productVariantsResult.filter(function (obj) {
                return (obj[2] == cartObj[i].RAM);
            });
            cartItemBlock += '<tr><td class="product-col"><figure class="product-image-container"><a href="javascript:" class="product-image"> <img id="reviewProductImage" src="ProductImages/' + product[0][3] + '" alt="product"> <input type="hidden" id="reviewProductID" /> </a> </figure> <div class="widget widget-categories"> <h4 class="widget-title">' + product[0][2] + '</h4> <ul class="list"> <li><a href="javascript;">Color: <div style="background-color: ' + cartObj[i].Color + '; height: 20px; width: 20px; display: inline-block; margin-bottom: -5px;"></div></a> </li> <li><a href="#">Thickness: <span class="">' + productThickness[0][4] + '</span></a></li> <li><a href="#">RAM: <span class="">' + productRam[0][4] + '</span></a></li> </ul>  </div> </td>  <td class="price-col">Quanitity: <span class="">' + cartObj[i].Quantity + '</span></td>  </tr>';
        }
        $('#reviewCart').html(cartItemBlock);
    }
    else {
        $('#reviewCart').html('<tr><td  colspan="3">No Items..</td></tr>');
    }

}
function clearCart() {
    localStorage.setItem("cart", '');
    $('#reviewCart').html('<tr><td  colspan="3">No Items..</td></tr>');
    //window.location.href = "products.html";
}
function getUserAgent() {
    var txt = navigator.userAgent;
    txt += "<br>Resolution: " + Math.round(window.screen.width) + "x" + Math.round(window.screen.height);
    txt += "<br>Browser Online: " + navigator.onLine;
    $('#userAgent').html(txt);
}