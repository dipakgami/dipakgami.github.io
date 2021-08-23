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
var productVariantsToRange = "F20";
var readProductVariantsURL = sheetAPIBaseURL + "/" + ExcelfileID + "/values/" + productVariantsSheetName + "!" + productVariantsFromRange + ":" + productVariantsToRange + "?key=" + apiKey;
/*Read products ends*/

var categoryResult = null;
var productResult = null;
var productVariantsResult = null;

var variantCollection = [];

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
        loadMobileViewMenuCat(categoryResult);
    }
    if (productResult == null || productResult == '') {
        getProductsAjax();
    }

    if (productVariantsResult == null || productVariantsResult == '') {
        getProductVariantsAjax();
    } else {
        loadProductDetails();
    }

    updateCartCount();


});

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

            $('.qty-number').keyup(function (e) {
                var charCode = (e.which) ? e.which : event.keyCode
                if (!String.fromCharCode(charCode).match(/^[0-9,]+$/)) {
                    $(this).val(function (index, value) {
                        return '';
                    });
                }
                if ($(this).val().replaceAll(",", "") > 9900000) {
                    $(this).parent().children('span').remove();
                    $(this).after("<span class='text-secondary'><br/>Max limit:99,00,000 </span>");
                }
                else {
                    $(this).parent().children('span').remove();
                }

                $(this).val(function (index, value) {
                    return value
                        .replace(/\D/g, '')
                        .replace(/(\d)(?=(\d\d)+\d$)/g, "$1,")
                        ;
                });

            });

        }
    });
}
function loadMenuCategories(categories) {
    var catPart1 = '<li><a href="javascript:" onclick="navigateToProducts(\'All\')" >All Categories</a></li>';
    var catPart2 = '';
    var partition = Math.round((categories.length / 2));

    for (var i = 0; i < partition; i++) {
        catPart1 += '<li><a href="javascript:" onclick="navigateToProducts(\'' + categories[i] + '\')"> ' + categories[i] + '</a ></li >';
    }
    for (var j = partition; j < categories.length; j++) {
        catPart2 += '<li><a href="javascript:" onclick="navigateToProducts(\'' + categories[j] + '\')"> ' + categories[j] + '</a ></li >';
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
function loadMobileViewMenuCat(categories) {
    var mobileViewMenuCat = '';
    for (var i = 0; i < categories.length; i++) {
        var encodedURL = encodeURIComponent(categories[i]);
        mobileViewMenuCat += '<li><a href="javascript:" onclick="navigateToProducts(\'' + categories[i] + '\')">' + categories[i] + '</a></li>';
        $('#mobileViewMenuCat').html(mobileViewMenuCat);
    }
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

        var variantTableHeaderBlock = '<tr>';

        variantCollection.filter(function (obj) {
            variantTableHeaderBlock += '<th>' + obj + '</th>';
        });
        variantTableHeaderBlock += '<th style="width:115px">Quantity</th><th>Action</th></tr>';
        $('#tblVariantsHeader').html(variantTableHeaderBlock);
        addRow();
    }
}

function addRow() {

    var productID = localStorage.getItem("selectedProductID");
    var productDetails = productVariantsResult.filter(function (obj) {
        return (obj[0] === productID)
    });

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

    var variantTableTrBlock = '<tr>';

    variantCollection.filter(function (obj) {
        var variantTableTdBlock = '<td data-variant="' + obj + '"><select type="dropdown" style="height:34px"><option value="0">Select one</option>';

        productDetails.filter(function (obj2) {
            if (obj == obj2[3]) {
                if (obj == "Color") {
                    variantTableTdBlock += '<option class="fa" style="color:' + obj2[2] + '" value="' + obj2[2] + '"><span>&#xf111;</span> ' + obj2[4] + '</span></option>';
                }
                else {
                    variantTableTdBlock += '<option value="' + obj2[2] + '">' + obj2[4] + '</option>';
                }
            }
        });
        variantTableTdBlock += '</select></td>';
        variantTableTrBlock += variantTableTdBlock;
    });

    variantTableTrBlock += '<td data-variant="quantity"><input type="text" class="form-input qty-number" style="height:34px; width:115px" placeholder="Quantity"></td><td class="text-center"><input onclick="removeRow(this)" type="button" class="removeRow" value="X"/> </td></tr>';

    $('#tblVariantsBody').append(variantTableTrBlock);


    if ($('#tblVariantsBody tr').length == 1) {
        $('.removeRow').attr('disabled', 'disabled');
    }
    else {
        $($('.removeRow')[0]).removeAttr('disabled')
    }
}

function removeRow(current) {
    $(current).closest('tr').remove();
    if ($('#tblVariantsBody tr').length == 1) {
        $('.removeRow').attr('disabled', 'disabled');
    }
}

function addToCart(finalize) {
    var isValid = true;
    var cartObj = [];

   
    $("#tblVariantsBody tr").each(function (index, object) {

        var cartItem = {};
        var cartItemVariant = {};
        cartItem["ProductID"] = $('#hdnProductID').val();
        $(object).find('td').each(function (ind, obj) {

            if ($(obj).attr('data-variant') == "quantity") {

                if ($(obj).find("input").val() != null && $(obj).find("input").val() != "") {
                    cartItem["Quantity"] = $(obj).find("input").val();
                }
                else {
                    isValid = false;
                }
            }
            else if ($(obj).attr('data-variant') != null) {

                if ($(obj).find("select").val() != null && $(obj).attr('data-variant') != "") {
                    cartItemVariant[$(obj).attr('data-variant')] = $(obj).find("select").val();
                }
                else {
                    isValid = false;
                }

            }
        });
        cartItem.cartItemVariant = cartItemVariant;
        cartObj.push(cartItem);

    });


    if (isValid) {

        if (localStorage.getItem("cart") != null && localStorage.getItem("cart") != '') {
            cartObj = cartObj.concat(JSON.parse(localStorage.getItem("cart")));
        }

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
    updateCartCount();
}
function updateCartCount() {
    if (localStorage.getItem("cart") != null && localStorage.getItem("cart") != "") {
        var cartObj = JSON.parse(localStorage.getItem("cart"));
        $('#cartItemCount').html(cartObj.length);
    }
    else {
        $('#cartItemCount').html('0');
    }
}

function navigateToProducts(Category) {
    localStorage.setItem("selectedCategory", Category);
    window.location.href = "products.html";
}