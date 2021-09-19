
$(document).ready(function () {

    /* fetches categories and products from local storage,
    if doesnt found, makes an ajax call and then loads Menu and products.*/

    categoryResult = JSON.parse(localStorage.getItem("categoryResult"));
    productResult = JSON.parse(localStorage.getItem("productResult"));

    if (categoryResult == null || categoryResult == '') {
        getCategoriesAjax();
        categoryResult = JSON.parse(localStorage.getItem("categoryResult"));
        loadMenuCategories(categoryResult);
        loadSearchCategories(categoryResult);
        loadProductsSideBarCategories(categoryResult);
        loadMobileViewMenuCat(categoryResult);
    }
    else {
        loadMenuCategories(categoryResult);
        loadSearchCategories(categoryResult);
        loadProductsSideBarCategories(categoryResult);
        loadMobileViewMenuCat(categoryResult);
    }
    if (productResult == null || productResult == '') {
        getProductsAjax();
        productResult = JSON.parse(localStorage.getItem("productResult"));
        loadProducts(productResult);
    }
    else {
        loadProducts(productResult);
    }

    $("#txtSearch").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#productBlock .col-6").filter(function () {
            $(this).toggle(
                ($(this).find('.product-title a').text().toLowerCase().indexOf(value) > -1 ||
                    $(this).find('.category-list a').text().toLowerCase().indexOf(value) > -1)
            )
        });
    });
    updateCartCount();
});

function refreshData() {
    getCategoriesAjax();
    getProductsAjax();
}
function loadProductsSideBarCategories(categories) {
    var sidebarCat = '<li><a href="javascript:" onclick="navigateToProducts(\'All\')" >All Categories</a></li>';
    for (var i = 0; i < categories.length; i++) {
        sidebarCat += '<li><a href="javascript:" onclick="navigateToProducts(\'' + categories[i] + '\')">' + categories[i] + '</a></li>';
    }
    $('#sidebarCat').html(sidebarCat);
}
function loadProducts(products) {

    var selectedCategory = null;

    selectedCategory = sessionStorage.getItem("selectedCategory");
    if (selectedCategory != null && selectedCategory != '' && selectedCategory != "All") {

        products = products.filter(function (obj) {
            return (obj[0] === selectedCategory)
        });
    }
    $('#breadcrumb-selected-category').html(selectedCategory);
    var productBlock = '';
    for (var i = 0; i < products.length; i++) {
        productBlock += '<div class="col-6 col-sm-4"><div class="product-default inner-quickview inner-icon"><figure><a onclick="navigateToProductDetails(\'' + products[i][1] + '\')\" href="javascript:"><img src="ProductImages/' + products[i][3] + '"></a><div class="btn-icon-group"><button class="btn-icon-buy btn btn-info" id="btnQuickBuy" onclick="showQuickBuy(\'' + products[i][1] + '\')" >Buy</button></div><a href="javascript:" class="btn-quickview" onclick="quickView(\'' + products[i][1] + '\')" title="Quick View">Quick View</a></figure><div class="product-details"><div class="category-wrap">  <div class="category-list"><a href="javascript:" class="product-category">' + products[i][0] + '</a></div> </div><h3 class="product-title"><a onclick="navigateToProductDetails(\'' + products[i][1] + '\')" href="javascript:">' + products[i][2] + '</a></h3> </div>  </div></div>';
    }
    $('#productBlock').html(productBlock);
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
    sessionStorage.setItem("selectedProductID", productID);
    window.location.href = "productdetails.html";
}

function getUserAgent() {
    var txt = navigator.userAgent;
    txt += "<br>Resolution: " + Math.round(window.screen.width) + "x" + Math.round(window.screen.height);
    txt += "<br>Browser Online: " + navigator.onLine;
    $('#userAgent').html(txt);
}

