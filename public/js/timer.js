var time = 100000;

function timer(){
  
  setTimeout(function(){
    time--;
    console.log(time);
    if(time==0){
      $.get(logoutPrefix+'/logout',{sessionTimeout:"true"},function(data){
        if(data){
          
          $("body").append('<div class="modal fade" id="logout-modal" role="dialog" style="margin-top:5em;"><div class="modal-dialog"><div class="modal-content"><div class="modal-body" style="color:red">You have been Logged out due to inactivity. Please Login again.&emsp;&emsp;<a href="'+logoutPrefix+'/" class="btn btn-default">Login</a></div></div></div></div>');
      
          $("#logout-modal").modal({backdrop:"static"});
          
        }
      });

    } else {
      timer();
    }
  },1000);
  
}


$(document).ready(function(){
  
  timer();
  
  $("html").click(function(){
    time = 100000;
  });
});
