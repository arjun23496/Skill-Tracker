$(document).ready(function(){
  $("#n").click(function(){
    $.post('/user/seen',function(data){
      
      if(!data){
        location.reload();
      }
      
      $('.badge').css('background','#777').html("0");
      
    });
  });
          
});