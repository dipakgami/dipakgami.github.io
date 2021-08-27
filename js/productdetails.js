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
    var mobileViewMenuCat = '<li><a href="javascript:" onclick="navigateToProducts(\'All\')" >All Categories</a></li>';
    for (var i = 0; i < categories.length; i++) {
        var encodedURL = encodeURIComponent(categories[i]);
        mobileViewMenuCat += '<li><a href="javascript:" onclick="navigateToProducts(\'' + categories[i] + '\')">' + categories[i] + '</a></li>';
        $('#mobileViewMenuCat').html(mobileViewMenuCat);
    }
}
function loadProductDetails() {

    var productID = "";
    if (sessionStorage.getItem("cartProductToEdit") != null && sessionStorage.getItem("cartProductToEdit") != '') {
        productID = sessionStorage.getItem("cartProductToEdit");
    } else {
        productID = sessionStorage.getItem("selectedProductID");
    }

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
            variantTableHeaderBlock += '<th class="">' + obj + '</th>';
        });

        if (variantCollection.length > 0) {
            variantTableHeaderBlock += '<th class="" style="width:115px">Quantity</th><th class="text-center">Delete</th></tr>';
        }
        else {
            variantTableHeaderBlock += '<th class="" style="width:115px">Quantity</th></tr>';
            $('#btnAddRow').addClass('hide');
        }


        $('#tblVariantsHeader').html(variantTableHeaderBlock);

        if (sessionStorage.getItem("cartProductToEdit") != null && sessionStorage.getItem("cartProductToEdit") != '') {

            var productIDtoEdit = sessionStorage.getItem("cartProductToEdit");
            var existingCart = JSON.parse(localStorage.getItem("cart"));
            existingCart = existingCart.filter(function (obj) {
                return (obj.ProductID === productIDtoEdit)
            });

            for (var i = 0; i < existingCart.length; i++) {
                addRow();
                var existingCartItem = existingCart[i];

                var trow = $('#tblVariantsBody tr')[i];
                $(trow).find('td').each(function (ind, obj) {

                    if ($(obj).attr('data-variant') == "quantity") {
                        $(obj).find("input").val(existingCartItem.Quantity)
                    }
                    else if ($(obj).attr('data-variant') != null) {
                        var existingCartItemVariant = existingCartItem.cartItemVariant[$(obj).attr('data-variant')];
                        $(obj).find('select').val(existingCartItemVariant);
                    }
                });
                responsiveTable();
                initalizeSelect2();
            }
        }
        else {
            addRow();
        }
        sessionStorage.setItem("cartProductToEdit", '');
    }
}

function addRow() {

    var productID = $('#hdnProductID').val();

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

        var variantTableTdBlock = '';
        if (obj == "Color") {
            variantTableTdBlock = '<td class="" data-variant="' + obj + '"><select class="custom-ddl-color" type="dropdown" style="height:34px"><option value="">Select one</option>';
        } else {
            variantTableTdBlock = '<td class="" data-variant="' + obj + '"><select class="custom-ddl" type="dropdown" style="height:34px;"><option value="">Select one</option>';
        }

        productDetails.filter(function (obj2) {
            if (obj == obj2[3]) {
                if (obj == "Color") {
                    variantTableTdBlock += '<option value="' + obj2[2] + '">' + obj2[4] + '</option>';
                }
                else {
                    variantTableTdBlock += '<option value="' + obj2[2] + '">' + obj2[4] + '</option>';
                }
            }
        });
        variantTableTdBlock += '</select></td>';
        variantTableTrBlock += variantTableTdBlock;
    });

    if (variantCollection.length > 0) {
        variantTableTrBlock += '<td class="" data-variant="quantity"><input type="number" class="form-input qty-number" style="height:34px;" placeholder="Quantity"></td><td class="text-center"><button onclick="removeRow(this)" type="button" class="btn btn-danger btn-xs removeRow"><i class="fa fa-trash"></i></button> </td></tr>';
    }
    else {
        variantTableTrBlock += '<td class="text-center" data-variant="quantity"><input type="number" class="form-input qty-number" style="height:34px;" placeholder="Quantity"></td></tr>';

    }


    $('#tblVariantsBody').append(variantTableTrBlock);


    if ($('#tblVariantsBody tr').length == 1) {
        $('.removeRow').addClass('hide');
    }
    else {
        $($('.removeRow')[0]).removeClass('hide');
    }
    responsiveTable();
    initalizeSelect2();

}

function removeRow(current) {
    if (confirm("Are you sure?")) {
        $(current).closest('tr').remove();
        if ($('#tblVariantsBody tr').length == 1) {
            $($('.removeRow')[0]).addClass('hide');
        }
    }
}

function addToCart(finalize) {
    var isValid = true;
    var isDuplicate = false;
    var cartObj = [];

    $("#tblVariantsBody tr").each(function (index, object) {

        var cartItem = {};
        var cartItemVariant = {};
        cartItem["ProductID"] = $('#hdnProductID').val();

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = dd + '/' + mm + '/' + yyyy;
        cartItem["CreatedDate"] = today;
        cartItem["CartRowIndex"] = '';

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
                if ($(obj).find("select").val() != null && $(obj).find("select").val() != "" && $(obj).attr('data-variant') != "") {
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

    var compareToIndex = 0;

    cartObj.filter(function (obj) {

        var compareWithIndex = 0;
        cartObj.filter(function (obj2) {
            if (compareToIndex != compareWithIndex) {
                if (JSON.stringify(obj.cartItemVariant) == JSON.stringify(obj2.cartItemVariant)) {
                    isDuplicate = true;
                    isValid = false;

                }
            }

            compareWithIndex = compareWithIndex + 1;
        })
        compareToIndex = compareToIndex + 1;
    })



    if (isValid) {

        if (localStorage.getItem("cart") != null && localStorage.getItem("cart") != '') {

            var existingCart = JSON.parse(localStorage.getItem("cart"));

            existingCart = existingCart.filter(function (obj) {
                return obj.ProductID != $('#hdnProductID').val();
            });

            cartObj = cartObj.concat(existingCart);
        }

        for (var i = 0; i < cartObj.length; i++) {
            cartObj[i].CartRowIndex = i;
        }

        localStorage.setItem("cart", JSON.stringify(cartObj));

        if (finalize == 'true') {
            window.location.href = "review.html"
        }
        $('#validationMsg').removeClass('alert alert-danger');
        $('#validationMsg').addClass('alert alert-success');
        $('#validationMsg').html('Item added..')
    }
    else {

        $('#validationMsg').removeClass('alert alert-success');
        $('#validationMsg').addClass('alert alert-danger');

        if (isDuplicate) {
            $('#validationMsg').html('Duplicate variants selected..')
        }
        else {
            $('#validationMsg').html('Select all options..')
        }

    }
    $('#validationMsg').fadeIn('fast').delay(2000);
    $('#validationMsg').fadeOut('slow').delay(3000).hide(0);
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
    sessionStorage.setItem("selectedCategory", Category);
    window.location.href = "products.html";
}

function responsiveTable() {

    // inspired by http://jsfiddle.net/arunpjohny/564Lxosz/1/
    $('.table-responsive-stack').each(function (i) {
        var id = $(this).attr('id');
        //alert(id);
        $(this).find("th").each(function (i) {
            $('#' + id + ' td:nth-child(' + (i + 1) + ')').find('.table-responsive-stack-thead').remove();
            if ($(this).text() != "Delete") {
                $('#' + id + ' td:nth-child(' + (i + 1) + ')').prepend('<span class="table-responsive-stack-thead" style="width: 40%; display:inline-block">' + $(this).text() + ':</span> ');
            }
        });
    });

    $('.table-responsive-stack').each(function () {
        var thCount = $(this).find("th").length;
        var rowGrow = 100 / thCount + '%';
        //console.log(rowGrow);
        $(this).find("th, td").css('flex-basis', rowGrow);
    });

    function flexTable() {
        if ($(window).width() < 768) {

            $(".table-responsive-stack").each(function (i) {
                $(this).find(".table-responsive-stack-thead").show();
                $(this).find('thead').hide();
            });
            $($('.table-responsive-stack').find('.select2')).each(function (ind, obj) { $(obj).css('width', '50%') })
            $($('.table-responsive-stack').find('input[type=number]')).each(function (ind, obj) { $(obj).css('width', '50%') })

        } else {
            $(".table-responsive-stack").each(function (i) {
                $(this).find(".table-responsive-stack-thead").hide();
                $(this).find('thead').show();
            });

            $($('.table-responsive-stack').find('.select2')).each(function (ind, obj) { $(obj).css('width', '100%') })
            $($('.table-responsive-stack').find('input[type=number]')).each(function (ind, obj) { $(obj).css('width', '100%') })
        }
        // flextable   
    }

    flexTable();

    window.onresize = function (event) {
        flexTable();
    };
    // document ready  

}
function initalizeSelect2() {
    $('.custom-ddl-color').select2({
        templateResult: formatState
    });
    $('.custom-ddl').select2();
}
function formatState(state) {
    if (!state.id) {
        return state.text;
    }
    var baseUrl = "/user/pages/images/flags";
    var $state = $(
        '<span><i class="fa fa-square" style="font-size:20px; color:' + state.element.value.toLowerCase() + '" /> ' + state.text + '</span>'
    );
    return $state;
};