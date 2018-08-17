// Sticky Plugin v1.0.4 for jQuery
// =============
// Author: Anthony Garand
// Improvements by German M. Bravo (Kronuz) and Ruud Kamphuis (ruudk)
// Improvements by Leonardo C. Daronco (daronco)
// Created: 02/14/2011
// Date: 07/20/2015
// Website: http://stickyjs.com/
// Description: Makes an element on the page stick on the screen as you scroll
//              It will only set the 'top' and 'position' of your element, you
//              might need to adjust the width in some cases.

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    var slice = Array.prototype.slice; // save ref to original slice()
    var splice = Array.prototype.splice; // save ref to original slice()

    var defaults = {
        topSpacing: 0,
        bottomSpacing: 0,
        className: 'is-sticky',
        wrapperClassName: 'sticky-wrapper',
        center: false,
        getWidthFrom: '',
        widthFromWrapper: true, // works only when .getWidthFrom is empty
        responsiveWidth: false,
        zIndex: 'inherit'
    },
        $window = $(window),
        $document = $(document),
        sticked = [],
        windowHeight = $window.height(),
        scroller = function () {
            var scrollTop = $window.scrollTop(),
                documentHeight = $document.height(),
                dwh = documentHeight - windowHeight,
                extra = (scrollTop > dwh) ? dwh - scrollTop : 0;

            for (var i = 0, l = sticked.length; i < l; i++) {
                var s = sticked[i],
                    elementTop = s.stickyWrapper.offset().top,
                    etse = elementTop - s.topSpacing - extra;

                //update height in case of dynamic content
                s.stickyWrapper.css('height', s.stickyElement.outerHeight());

                if (scrollTop <= etse) {
                    if (s.currentTop !== null) {
                        s.stickyElement
                            .css({
                                'width': '',
                                'position': '',
                                'top': '',
                                'z-index': ''
                            });
                        s.stickyElement.parent().removeClass(s.className);
                        s.stickyElement.trigger('sticky-end', [s]);
                        s.currentTop = null;
                    }
                }
                else {
                    var newTop = documentHeight - s.stickyElement.outerHeight()
                        - s.topSpacing - s.bottomSpacing - scrollTop - extra;
                    if (newTop < 0) {
                        newTop = newTop + s.topSpacing;
                    } else {
                        newTop = s.topSpacing;
                    }
                    if (s.currentTop !== newTop) {
                        var newWidth;
                        if (s.getWidthFrom) {
                            padding = s.stickyElement.innerWidth() - s.stickyElement.width();
                            newWidth = $(s.getWidthFrom).width() - padding || null;
                        } else if (s.widthFromWrapper) {
                            newWidth = s.stickyWrapper.width();
                        }
                        if (newWidth == null) {
                            newWidth = s.stickyElement.width();
                        }
                        s.stickyElement
                            .css('width', newWidth)
                            .css('position', 'fixed')
                            .css('top', newTop)
                            .css('z-index', s.zIndex);

                        s.stickyElement.parent().addClass(s.className);

                        if (s.currentTop === null) {
                            s.stickyElement.trigger('sticky-start', [s]);
                        } else {
                            // sticky is started but it have to be repositioned
                            s.stickyElement.trigger('sticky-update', [s]);
                        }

                        if (s.currentTop === s.topSpacing && s.currentTop > newTop || s.currentTop === null && newTop < s.topSpacing) {
                            // just reached bottom || just started to stick but bottom is already reached
                            s.stickyElement.trigger('sticky-bottom-reached', [s]);
                        } else if (s.currentTop !== null && newTop === s.topSpacing && s.currentTop < newTop) {
                            // sticky is started && sticked at topSpacing && overflowing from top just finished
                            s.stickyElement.trigger('sticky-bottom-unreached', [s]);
                        }

                        s.currentTop = newTop;
                    }

                    // Check if sticky has reached end of container and stop sticking
                    var stickyWrapperContainer = s.stickyWrapper.parent();
                    var unstick = (s.stickyElement.offset().top + s.stickyElement.outerHeight() >= stickyWrapperContainer.offset().top + stickyWrapperContainer.outerHeight()) && (s.stickyElement.offset().top <= s.topSpacing);

                    if (unstick) {
                        s.stickyElement
                            .css('position', 'absolute')
                            .css('top', '')
                            .css('bottom', 0)
                            .css('z-index', '');
                    } else {
                        s.stickyElement
                            .css('position', 'fixed')
                            .css('top', newTop)
                            .css('bottom', '')
                            .css('z-index', s.zIndex);
                    }
                }
            }
        },
        resizer = function () {
            windowHeight = $window.height();

            for (var i = 0, l = sticked.length; i < l; i++) {
                var s = sticked[i];
                var newWidth = null;
                if (s.getWidthFrom) {
                    if (s.responsiveWidth) {
                        newWidth = $(s.getWidthFrom).width();
                    }
                } else if (s.widthFromWrapper) {
                    newWidth = s.stickyWrapper.width();
                }
                if (newWidth != null) {
                    s.stickyElement.css('width', newWidth);
                }
            }
        },
        methods = {
            init: function (options) {
                return this.each(function () {
                    var o = $.extend({}, defaults, options);
                    var stickyElement = $(this);

                    var stickyId = stickyElement.attr('id');
                    var wrapperId = stickyId ? stickyId + '-' + defaults.wrapperClassName : defaults.wrapperClassName;
                    var wrapper = $('<div></div>')
                        .attr('id', wrapperId)
                        .addClass(o.wrapperClassName);

                    stickyElement.wrapAll(function () {
                        if ($(this).parent("#" + wrapperId).length == 0) {
                            return wrapper;
                        }
                    });

                    var stickyWrapper = stickyElement.parent();

                    if (o.center) {
                        stickyWrapper.css({ width: stickyElement.outerWidth(), marginLeft: "auto", marginRight: "auto" });
                    }

                    if (stickyElement.css("float") === "right") {
                        stickyElement.css({ "float": "none" }).parent().css({ "float": "right" });
                    }

                    o.stickyElement = stickyElement;
                    o.stickyWrapper = stickyWrapper;
                    o.currentTop = null;

                    sticked.push(o);

                    methods.setWrapperHeight(this);
                    methods.setupChangeListeners(this);
                });
            },

            setWrapperHeight: function (stickyElement) {
                var element = $(stickyElement);
                var stickyWrapper = element.parent();
                if (stickyWrapper) {
                    stickyWrapper.css('height', element.outerHeight());
                }
            },

            setupChangeListeners: function (stickyElement) {
                if (window.MutationObserver) {
                    var mutationObserver = new window.MutationObserver(function (mutations) {
                        if (mutations[0].addedNodes.length || mutations[0].removedNodes.length) {
                            methods.setWrapperHeight(stickyElement);
                        }
                    });
                    mutationObserver.observe(stickyElement, { subtree: true, childList: true });
                } else {
                    if (window.addEventListener) {
                        stickyElement.addEventListener('DOMNodeInserted', function () {
                            methods.setWrapperHeight(stickyElement);
                        }, false);
                        stickyElement.addEventListener('DOMNodeRemoved', function () {
                            methods.setWrapperHeight(stickyElement);
                        }, false);
                    } else if (window.attachEvent) {
                        stickyElement.attachEvent('onDOMNodeInserted', function () {
                            methods.setWrapperHeight(stickyElement);
                        });
                        stickyElement.attachEvent('onDOMNodeRemoved', function () {
                            methods.setWrapperHeight(stickyElement);
                        });
                    }
                }
            },
            update: scroller,
            unstick: function (options) {
                return this.each(function () {
                    var that = this;
                    var unstickyElement = $(that);

                    var removeIdx = -1;
                    var i = sticked.length;
                    while (i-- > 0) {
                        if (sticked[i].stickyElement.get(0) === that) {
                            splice.call(sticked, i, 1);
                            removeIdx = i;
                        }
                    }
                    if (removeIdx !== -1) {
                        unstickyElement.unwrap();
                        unstickyElement
                            .css({
                                'width': '',
                                'position': '',
                                'top': '',
                                'float': '',
                                'z-index': ''
                            })
                            ;
                    }
                });
            }
        };

    // should be more efficient than using $window.scroll(scroller) and $window.resize(resizer):
    if (window.addEventListener) {
        window.addEventListener('scroll', scroller, false);
        window.addEventListener('resize', resizer, false);
    } else if (window.attachEvent) {
        window.attachEvent('onscroll', scroller);
        window.attachEvent('onresize', resizer);
    }

    $.fn.sticky = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.sticky');
        }
    };

    $.fn.unstick = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.unstick.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.sticky');
        }
    };
    $(function () {
        setTimeout(scroller, 0);
    });
}));

olderLastPublishedTime = null;

function soundToggle(id) {
    var video = $("#id-" + id + " video")[0];
    $(video).attr('id', id);


    if (video.muted) {
        video.muted = false;
        $("#sound-" + id).addClass('on');
        $("#sound-" + id).removeClass('off');

        $("video[id!='" + id + "']").each(function () {
            this.muted = true;

            $("#sound-" + this.getAttribute('id')).addClass('off');
            $("#sound-" + this.getAttribute('id')).removeClass('on');
        });
    }
    else {
        video.muted = true;
        $("#sound-" + id).addClass('off');
        $("#sound-" + id).removeClass('on');
    }

}

function assignVideoHandler(element) {

    $(element).attr('parsed', true);
    $(element).attr('loop', true);

    $(element).on('inview', function (event, isInView) {

        var postId = $(this).attr('id');

        if (isInView) {
            // element is now visible in the viewport
            if (this.paused == true && this.muted == false) {
                this.muted = true;

                // Chuyển nút điều khiển âm lượng về chế độ tắt
                if (postId != "") {
                    $("#sound-" + postId).addClass('off');
                    $("#sound-" + postId).removeClass('on');
                }
            }

            if ($(this).attr('data-autoplay') == "true") {
                this.muted = false;

                // Chuyển nút điều khiển âm lượng về chế độ mở
                if (postId != "") {
                    $("#sound-" + id).addClass('on');
                    $("#sound-" + id).removeClass('off');
                }

            }

            this.play();

        } else {
            this.pause()
        }
    });
}

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



// Hiển thị bài viết chi tiết Ajax
function displayAjaxDetail(json) {
    $("#ajax-detail-container").show();
    $("#ajax-loading-container").hide();

    var entry = json.entry;
    var id = entry.id.$t;
    var url = entry.link[2].href;
    var category = entry.category[0].term;

    var date = new Date(entry.published.$t);

    var afterVideoAds = "";
    var bottomAds = "";

    if (category != "video") {
        afterVideoAds = "";

        $("#mobile-ajax-detail").html("<h1 class='title' id='ajax-title'>" + entry.title.$t + " </h1> <div class='publish-date'> <div class='post-header'> <div class='published'>" + date.toLocaleString() + "</div> </div> </div> <div class='tool top'> <a class='zalo-share zalo-share-button' data-customize='true' data-href='" + url + "' data-layout='icon' data-oaid='579745863508352884' data-type='zalo' href='javascript:;' rel='nofollow'> <i class='spr spr-social-zalo'></i></a> <a class='fb-share' data-href='" + url + "' data-type='facebook' href='javascript:;'> <i class='spr spr-social-fb'></i> </a> </div> <div class='content' id='ajax-content'>" + entry.content.$t + "</div> <div class='tool bottom'> <a class='zalo-share zalo-share-button' data-customize='true' data-href='" + url + "' data-layout='icon' data-oaid='579745863508352884' data-type='zalo' href='javascript:;' rel='nofollow'> <i class='spr spr-social-zalo'></i> <span>zalo</span> </a> <a class='fb-share' data-href='" + url + "' data-type='facebook' href='javascript:;'> <i class='spr spr-social-fb'></i> <span>facebook</span> </a> </div><div id='ajax-fb-comment' ><div class='fb-comments'  data-href='" + url + "' data-numposts='2'></div></div>");
    }
    else {
        $("#mobile-ajax-detail").html("<div class='content' id='ajax-content'>" + entry.content.$t + "</div> <h1 class='video-title' id='ajax-title'>" + entry.title.$t + " </h1> <div class='publish-date'> <div class='post-header'> <div class='published'>" + date.toLocaleString() + "</div> </div> </div><div class='tool bottom'> <a class='zalo-share zalo-share-button' data-customize='true' data-href='" + url + "' data-layout='icon' data-oaid='579745863508352884' data-type='zalo' href='javascript:;' rel='nofollow'> <i class='spr spr-social-zalo'></i> <span>zalo</span> </a> <a class='fb-share' data-href='" + url + "' data-type='facebook' href='javascript:;'> <i class='spr spr-social-fb'></i> <span>facebook</span> </a> </div><div id='ajax-fb-comment' ><div class='fb-comments'  data-href='" + url + "' data-numposts='2'></div></div>");
    }



    // Quảngg cáo chèn giữa bài viết
    $("<center class='mobile-footer-ads'><ins class='adsbygoogle' data-ad-client='ca-pub-8618945885313646' data-ad-slot='9417749014' style='display:inline-block;width:300px;height:250px'></ins></center><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>").insertAfter($($("#mobile-ajax-detail p")[Math.ceil($("#mobile-ajax-detail p").length / 2)]));


    if (typeof ZaloSocialSDK != 'undefined') {
        ZaloSocialSDK.reload();
    }

    FB.XFBML.parse(document.getElementById("ajax-fb-comment"));
}

isDetailAjaxPage = false; // Xác định đang mở xem chi tiết = ajax
$(document).ready(function () {
    // construct an instance of Headroom, passing the element
    var headroom = new Headroom(document.getElementById("sticker"), {
        "offset": 45,
        "tolerance": 5,
        "classes": {
            "initial": "animated",
            "pinned": "slideDown",
            "unpinned": "slideUp"
        }
    });
    // initialise
    headroom.init();

    $("video:not([parsed='true'])").each(function () {
        assignVideoHandler(this);
    });

    getArticleStatistics();
    listLoadMore();
});

// Chia sẽ bài viết qua facebook
$(document).on('click', 'a[class*="share-facebook"]', function (e) {
    e.preventDefault();
    var button = this;
    window.FB.ui({
        method: "share",
        href: $(this).attr('href')
    }, function (e) {
        alert("Cảm ơn bạn đã chia sẽ <3");
        $(button).addClass('has-share')
    });

});


$(document).on('click', '#post-list a', function (e) {
    if (getParameterByName("m") == "1") {
        e.preventDefault();

        isDetailAjaxPage = true;

        $("#ajax-loading-container").show();
        $('#detail-modal').show();
        $.get('/feeds/posts/default/' + $(this).attr('data-id') + '?alt=json-in-script&callback=displayAjaxDetail');

        $("#pure-body").hide();

        history.pushState(null, null, $(this).attr('href') + "?m=1");
    }
});

window.onpopstate = function (event) {
    video[0].pause();

    $("#pure-body").show();
    $('#detail-modal').hide();

    $("#ajax-detail-container").hide();
    $("#ajax-loading-container").hide();

    isDetailAjaxPage = false;

    $("#mobile-ajax-detail").html("");
};

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
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



loadTime = 0;
function displayDesktopSuggest(json) {
    var html = "";
    for (var i = 0; i < json.feed.entry.length; i++) {
        var entry = json.feed.entry[i];
        var title = entry.title.$t;
        var url = entry.link[2].href;
        var thumbnail = extractThumbnail(entry.content.$t);

        html += "<article> <a href='" + url + "'> <img src='" + thumbnail + "' alt='" + title + "' /></a> <div> <a href='" + url + "' class='title'>" + title + "</a> </div> </article>";
        if (i == json.feed.entry.length - 1) {
            suggestUpdated = "&published-max=" + entry.updated.$t.replace('+', '%2B') + "&start=2";
        }
    }

    $('#suggest-list').append(html);

    $("video:not([parsed='true'])").each(function () {
        assignVideoHandler(this);
    });
}


loadTime = 0;
suggestUpdated = "";
function requestSuggest() {
    $("#loader").css('display', 'inline-block');
    var callback = (getParameterByName("m") == "1") ? "displayMobileSuggest" : "displayDesktopSuggest";

    var label = "news";
    if (location.href.indexOf("label/news") > 0) label = "media";
    $.get('/feeds/posts/default/-/' + label + '?alt=json-in-script' + suggestUpdated + '&max-results=6&callback=' + callback);
}



function getMetaContent(e) {

    for (var t = document.getElementsByTagName("meta"), n = 0; n < t.length; n++)if (t[n].getAttribute("property") === e) return t[n].getAttribute("content"); return "";
}

$(document).on("click touch", ".fb-share, .zalo-share", function () {

    var e = getMetaContent("og:title"),
        n = getMetaContent("og:description"),
        i = getMetaContent("og:url");


    var r = $(this).attr("data-type"), o = $(this).attr("data-href");
    var title = getMetaContent("og:title");

    switch (window.ga && window.ga("send", {
        hitType: "event",
        eventCategory: "mobile_" + r,
        eventAction: "share",
        eventLabel: getMetaContent("og:title")
    }), r) {
        case "facebook":
            if ("undefined" !== window.FB) {
                var a = window.FB;

                a.ui({
                    method: "share",
                    href: o
                }, function (e) { })
            }
            break;
        default:
    }
})


//Load more trang danh sách
function listLoadMore() {
    allowLoadMore = true;

    $(window).scroll(function () {
        if ($(window).scrollTop() + $(window).height() > $(document).height() - 2000 && allowLoadMore) {
            requestLoadMore();
        }
    });

}

function requestLoadMore() {
    $("#loader").css('display', 'inline-block');

    allowLoadMore = false;
    var nextLink = $("#next-button").attr('href');
    $.get(nextLink, function (response) {
        var responseDOM = $(response);

        $("#post-list").append(responseDOM.find("#post-list").html());
        nextPage = responseDOM.find("#next-button").attr('href');
        $("#next-button").attr('href', nextPage);

        $("#loader").css('display', 'none');

        allowLoadMore = true;

        $("video:not([parsed='true'])").each(function () {
            assignVideoHandler(this);
        });

        eval(responseDOM.find("#ids").html());
        getArticleStatistics();
    });
}

function insertCommentBox(e, t) {
    $("#comment-area-" + e).html("<div class='fb-comments' data-href='" + t + "' data-numposts='2' data-width='100%'></div>"),
        FB.XFBML.parse(document.getElementById("comment-area-" + e))
}

function getArticleStatistics() {
    if (typeof (ids) != "undefined") {
        var keyIndex = [];
        var queryGraph = "https://graph.facebook.com/?ids=";

        for (var i = 0; i < ids.length; i++) {
            if ($("#id-" + ids[i] + " h3 a").length > 0) {
                var postUrl = $("#id-" + ids[i] + " h3 a")[0].href;
                queryGraph += postUrl + ",";
                keyIndex.push(postUrl);
            }
        }

        queryGraph = queryGraph.substring(0, queryGraph.length - 1)
        $.ajax({
            url: queryGraph,
            type: "GET",
            success: function (data) {
                for (var i = 0; i <= keyIndex.length - 1; i++) {
                    var record = data[keyIndex[i]];
                    if (typeof (record.share) != "undefined") {
                        if (document.getElementById('total-share-' + ids[i]) != null) {
                            var likeContent = (record.share.share_count == 0) ? "" : (record.share.share_count + " Chia sẽ");
                            if (likeContent != "") {
                                $('#s-c-' + ids[i]).show();
                                document.getElementById('total-share-' + ids[i]).innerHTML = "<a href='" + keyIndex[i] + "'>" + likeContent + "</a>";
                                $('#total-share-' + ids[i]).addClass('has-share');
                            }
                        }

                        if (document.getElementById('total-comments-' + ids[i]) != null && record.share.comment_count > 0) {
                            $('#total-comments-' + ids[i]).addClass('has-comment');
                            document.getElementById('total-comments-' + ids[i]).innerHTML = record.share.comment_count + " Bình luận";
                        }
                    }
                }
            }
        });
    }
}
