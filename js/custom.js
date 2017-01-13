$(document).ready(function(){

    'use strict';

        $(window).resize(function(){
                var footerHeight = $('.footer').outerHeight();
                var stickFooterPush = $('.push').height(footerHeight);
        
                $('.wrapper').css({'marginBottom':'-' + footerHeight + 'px'});
            });
        
            $(window).resize();
        });





$(document).ready( function(){

    'use strict';


    var launchDay = new Date(2020, 6-2, 7);
    $('#timer').countdown({
    until: launchDay
    });

  var sync1 = $("#sync1");
    var sync2 = $("#sync2");
     
    sync1.owlCarousel({
    singleItem : true,
    slideSpeed : 1000,
    navigation: false,
    pagination:false,
    autoHeight:true,
    transitionStyle : "goDown",
    afterAction : syncPosition,
    responsiveRefreshRate : 200,
    });
     
    sync2.owlCarousel({
    items : 3,
    itemsDesktop : [1199,3],
    itemsDesktopSmall : [979,3],
    itemsTablet : [768,3],
    itemsMobile : [479,3],
    pagination:false,
    responsiveRefreshRate : 100,
    afterInit : function(el){
    el.find(".owl-item").eq(0).addClass("synced");
    }
    });
     
    function syncPosition(el){
    var current = this.currentItem;
    $("#sync2")
    .find(".owl-item")
    .removeClass("synced")
    .eq(current)
    .addClass("synced")
    if($("#sync2").data("owlCarousel") !== undefined){
    center(current)
    }
    }
     
    $("#sync2").on("click", ".owl-item", function(e){
    e.preventDefault();
    var number = $(this).data("owlItem");
    sync1.trigger("owl.goTo",number);
    });
     
    function center(number){
    var sync2visible = sync2.data("owlCarousel").owl.visibleItems;
    var num = number;
    var found = false;
    for(var i in sync2visible){
    if(num === sync2visible[i]){
    var found = true;
    }
    }
     
    if(found===false){
    if(num>sync2visible[sync2visible.length-1]){
    sync2.trigger("owl.goTo", num - sync2visible.length+2)
    }else{
    if(num - 1 === -1){
    num = 0;
    }
    sync2.trigger("owl.goTo", num);
    }
    } else if(num === sync2visible[sync2visible.length-1]){
    sync2.trigger("owl.goTo", sync2visible[1])
    } else if(num === sync2visible[0]){
    sync2.trigger("owl.goTo", num-1)
    }
    }



$('#contactform').submit(function(){

    'use strict';

        var action = $(this).attr('action');

        $("#message").slideUp(300,function() {
        $('#message').hide();

        $('#submit')
            .after('<img src="img/ajax-loader.gif" class="loader" />')
            .attr('disabled','disabled');

        $.post(action, {
            name: $('#name').val(),
            email: $('#email').val(),
            comments: $('#comments').val()
        },
            function(data){
                document.getElementById('message').innerHTML = data;
                $('#message').slideDown(300);
                $('#contactform img.loader').fadeOut('slow',function(){$(this).remove()});
                $('#submit').removeAttr('disabled');
                if(data.match('success') != null) $('#contactform').slideUp('slow');

            }
        );

        });

        return false;

    });


});

jQuery(document).ready(function(){

        $("body");
            options = {
            speed: 4e3,
            transition_speed: 500,
            sub_selector: ".rotate"
         };
         $("#rotate").rotator(options);
});

jQuery(document).ready(function(){

'use strict';

    $('#subscribe').submit(function(){

        var action = $(this).attr('action');

        $("#message-subscribe").slideUp(300,function() {
        $('#message-subscribe').hide();

        $('#ssubmit')
            .after('<img src="img/ajax-loader.gif" class="subscribe-loader" />')
            .attr('disabled','disabled');

        $.post(action, {
            email: $('#semail').val()
        },
            function(data){
                document.getElementById('message-subscribe').innerHTML = data;
                $('#message-subscribe').slideDown(300);
                $('#subscribe img.subscribe-loader').fadeOut('slow',function(){$(this).remove()});
                $('#ssubmit').removeAttr('disabled');
                if(data.match('success') != null) $('#subscribe').slideUp('slow');

            }
        );

        });

        return false;

    });

});

(function (e) {


    e.fn.rotator = function (n) {
        function f() {
            u.stop().fadeOut(r.transition_speed, function () {
                if (i == o) {
                    u = s.first();
                    i = 0
                } else u = u.next();
                u.fadeIn(r.transition_speed);
                i++;
                setTimeout(f, r.speed)
            })
        }
        var r = e.extend({}, t, n);
        var i = 1;
        var s = this.children(r.sub_selector);
        var o = s.length;
        s.hide();
        var u = s.first();
        var a = this;
        u.fadeIn();
        setTimeout(f, r.speed);
        return this
    };
    var t = e.fn.defaults = {
        speed: 3e3,
        transition_speed: 500,
        sub_selector: ".rotate"
    }
})(jQuery)
