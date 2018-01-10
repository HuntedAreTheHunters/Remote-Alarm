$(document).ready(function(){
  //These functions deal with the side bar

  $(".sidebutton").hover(function(){
    //Enter function
    $(this).css("background-color", "#434447");
    $(this).animate({left: '10px'}, 'fast');
  }, function(){
    //Leave function
    $(this).css("background-color", "#5c5d60");
    $(this).animate({left: '0px'}, 'fast');
  });


  //Functions for alarms
  $('#alarms').on('click', '.title', function() {
    $(this).parent().find(".alarm_information").slideToggle("slow");
  });

  $(".title").hover(function(){
    //Enter function
    $(this).css("background-color", "#191918");
    $(this)
  }, function (){
    //Leave function
    $(this).css("background-color", "#232322");
  });
  //Dangerous links
  $('.confirm').click(function(e) {
        e.preventDefault();
        if (window.confirm("Are you sure?")) {
            location.href = this.href;
        }
    });

});
