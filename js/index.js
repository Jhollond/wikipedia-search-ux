var initial_load = 0;
var randomG_collapsed = true;
var buttons_are_gone = false;
var random_page_title;
var prev_search = "";
var prev_limit;

function toggle_random_guy(collapse) {
    if (collapse && randomG_collapsed)
        return
        
    if (randomG_collapsed) {
        $("#random-guy-button")
            .velocity({
            translateZ: 0, // Force HA by animating a 3D property
            translateX: " -100px",
            paddingRight: "108px",
        }, {
            duration: "fast",
            complete: function() {
                $("#random-word")
                    .html("Random Article");
                document.querySelector("body").focus()
            },
        })
        randomG_collapsed ^= true;
    }
    else {
        $("#random-word")
            .html("");
        $("#random-guy-button")
            .velocity("reverse");
        $("#random-icon")
            .velocity("reverse");
        randomG_collapsed ^= true;
    }
}

function expand_textarea(collapse,txtFocus) {
    if((collapse && buttons_are_gone)||(!collapse && !buttons_are_gone))
        return
    
    if(initial_load === 1){
        $("#anchor_frame").velocity({
            top: "10%"
        }, {
            duration: "fast"
        });
        initial_load++;
    } initial_load++;
    
    if (collapse) {
        $("#searchy").css("visibility","hidden");
        $("#inputter").css("visibility","hidden");
        $("#minied").html(function() {
            return $("#status").val() === "" ?
                "Search Wikipedia" : $("#status").val();
        });
        $("#minimizy").css({"font-size": function() {
            var text_width = $("#minied").width();
            return text_width < 250 ?
                "18.25px" : (250 / text_width)*18.30 + "px";
            }
        })
        $("#minimizy").css("visibility","inherit");
        
        
        $("#texty-typey").velocity({
            width: "300px",
            height: "37px",
        }, {
            duration: "fast"
        });
        buttons_are_gone = true;
    }
    else {
        $("#texty-typey").velocity(
            "reverse"
        , {
            complete: function() {
                $("#searchy").css("visibility","inherit");
                $("#inputter").css("visibility","inherit");
                $("#minimizy").css("visibility","hidden");
                $("#minimizy").css("font-size","18.33px");
                if (txtFocus) {
                document.querySelector("#status").focus();
                    }
            }});
        buttons_are_gone = false;
    }
}

function generate_random_article() {
    $.ajax({
        type:"GET",
        url: "https://en.wikipedia.org/w/api.php?" +
        "action=query&format=json&prop=info&list=&meta=&indexpageids=1&" +
        "pageids=&generator=random&redirects=1&callback=%3F&utf8=1&" +
        "inprop=url&grnnamespace=0&grnfilterredir=nonredirects&grnlimit=1",
        dataType: 'jsonp',
        success:function(data) {
            var page_num = data.query.pageids
            console.log(data.query.pages[page_num]);
            random_page_title = data.query.pages[page_num].title;
            $("#status").val(random_page_title);
        }
    });
}

function opensearch_articles(query,limit) {
    $.ajax({
        type:"GET",
        url: "https://en.wikipedia.org/w/api.php?action=opensearch&" +
        "format=json&search="+ query +"&namespace=0&limit=" + limit + "&callback=%3F&utf8=1",
        dataType: 'jsonp',
        success:function(data) {
            populate_results_lister(data);
        }
    })
}

function card_template(href,num,title,paragraph) {
    async_image_loader(title,num);
    var linkDiv   = "<a class='card-outer-shadow' href='" +
                      href + "' target='_blank'>";
    var mainDiv     = "<div id='card_"+num+"' class='result_card'>";
    var titleEl   = "<h5 class='card-heading'>"+title+"</h5>";
    var paragraEl   = "<p class='card-paragra'>"+paragraph+"</p>";
    var closeDiv    = "</div></a>";
    var imageEl = "<img id='card_"+num+"_img' class='card-img' src=''></img>";
    return linkDiv + mainDiv + imageEl + titleEl + paragraEl + closeDiv;
}

function populate_results_lister(results_arr) {
    var parent_div  = document.getElementById("results-lister");
    parent_div.innerHTML = "";
    var i = 0;
    
    for (let value of results_arr[3]) {
        var href        = value;
        var title     = results_arr[1][i];
        var paragraph   = results_arr[2][i];
        var num         = i;
        i++;
        
        var cardHTML = card_template(href,num,title,paragraph);
        parent_div.insertAdjacentHTML('beforeend',cardHTML);
    }
    
        //$("#results-anchor").velocity({
            //top: "20%"
       // }, {
          //  duration: "fast"
          //  })
}

function async_image_loader(title,num) {
    title = encodeURIComponent(title);
    $.ajax({
        type: "GET",
        url: "https://en.wikipedia.org/w/api.php?action=mobileview&format=json&page="+ title + "&prop=image%7Cthumb&thumbwidth=128&callback=%3F&utf8=1",
        dataType: 'jsonp',
        success: function(data) {
            if (data.mobileview.thumb == undefined)
                return
            console.log(data.mobileview.thumb.url)
            var card_El = "card_" + num;
            var thumb_URL = "https:" + data.mobileview.thumb.url;
            var cardEl = document.getElementById(card_El);
            var imgEl = cardEl.getElementsByTagName('img');
            imgEl[0].src = thumb_URL;
            console.log(imgEl);
        }
    })
}

function search_sender(){
    var search_query = $("#status").val();
    var limit = document.getElementById("limit-num").innerHTML;
    console.log("DANK MEMES " + limit + " DANK")
    if ((search_query == prev_search)&&(limit === prev_limit))
        return
        
    opensearch_articles(search_query,limit);
    expand_textarea(true,false);
    prev_search = search_query;
    prev_limit  = limit;
    
}

function load_spinner(target,loading){
    if (loading) {
        $(target)
    }
}

$(document)
    .ready(function () {
        //set cursor on search input box on load
        expand_textarea(true);
        $("body").on("click", function(){
            if ($("#status").is(":focus")) {
               toggle_random_guy(true);
            }
        })
    
        
        //When typed in input, close random article button
        $("#status")
            .keydown( function(event) {
                toggle_random_guy(true);
        });
        $("#status").keyup( function(event) {
            if (event.keyCode == 13) {
        //Pressing Enter submits input field
                search_sender();
            }
        })
        $("#mainframe")
            .on("click",function() {
                expand_textarea(false,true);
        })
        $("#random-guy-button")
            .on("click",function() {
                expand_textarea(false);
                toggle_random_guy();
                
        })
        $("#random-guy-button")
            .on("click","#random-word", function () {
                generate_random_article()
        })
        $("#click-catcher")
            .on("click",function() {
                expand_textarea(true);
                toggle_random_guy(true);
        })
        $("#searchy")
            .on("click",function() {
                toggle_random_guy(true);
                search_sender();
        })
        $("#fewer-btn")
            .on("click",function() {
                var limit = document.getElementById("limit-num").innerHTML;
                if (limit > 1) {
                    limit--; 
                    document.getElementById("limit-num").innerHTML = limit;
                }  
        })
        $("#more-btn")
            .on("click",function() {
                var limit = document.getElementById("limit-num").innerHTML;
                if (limit < 500) {
                    limit++; 
                    document.getElementById("limit-num").innerHTML = limit;
                }
        })
                

  })