function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function extractThumbnail(content) {
    var thumbnail = "";

    var findUrl = false;
    for (var i = 0; i < 500; i++) {
        if (!findUrl) {
            if (content[i] == "'") {
                findUrl = true;
            }

        } else {

            if (content[i] == "'" && findUrl) {
                break;
            }

            thumbnail += content[i];
        }
    }

    return thumbnail;
}

//Load more trang danh sách
displayNumber = 8;
postMaxPublished = "";

function requestLoadMore() {
    if (document.referrer == "" || (document.referrer != "" && document.referrer.indexOf('tatlon.com') < 0)) {
        $("#loader").css('display', 'inline-block');

        var nextLink = $("#next-button").attr('href');
        nextLink += "&m=1";
        $.get(nextLink, function (response) {
            var responseDOM = $(response);

            $("#post-list").append(responseDOM.find("#post-list").html());
            nextPage = responseDOM.find("#next-button").attr('href');
            $("#next-button").attr('href', nextPage);

            $("#loader").css('display', 'none');
        });
    }
    else {
        $("#next-button").removeClass('btn-next');
        $("#next-button").addClass('btn-previous');
        $("#next-button").attr('href', "javascript:history.go(-1)");
        $("#next-button").html('<span class="arrow-left"></span><span class="label">Quay lại</span>');
        $("#next-button").parent().addClass('col-xs-6');
        $("#next-button").css('margin-left', '10px');
    }
}