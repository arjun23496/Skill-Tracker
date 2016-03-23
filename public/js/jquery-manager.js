$(document).ready(function(){
  
  
  function updateLevel(){
    $(".up-lv").unbind().click(function(){
      var skillId = $(this).attr("data-skillId");
      var user = $(this).attr("data-user");
      $("#"+skillId).html("");
      $("#"+skillId).append('&nbsp;<select id="lv'+skillId+'" class="btn btn-default"><option value="select">Select level</option>  <option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option>  <option value="Expert">Expert</option></select>&nbsp;<button class="up-lv-submit btn btn-primary" data-skillId="'+skillId+'" data-user="'+user+'">Save</button>&nbsp;<button class="up-lv-cancel btn btn-warning" data-skillId="'+skillId+'" data-user="'+user+'" >Cancel</button>');
              
      submitLevel();
              
    });
  }
          
 
  function getEmpData(emp){
  $("#"+emp).html("loading...");
  $.post('/user/getEmployeeData/'+emp,function(data){
    if(data){
      $("#"+emp).html("");
      $("#"+emp).append('<table class="table table-striped">\
                                 <thead>\
                                 <tr>  \
                                 <th>Role</th>\
                                 <th>Skill</th>\
                                 <th>Type</th>\
                                 <th>Level</th><th></th>\
                                 </tr>\
                                 </thead><tbody><tr></tr></tbody></table>');
                      
        for(i=0;i<data.length;i++){
          $("#"+emp+" tr:last").after('<tr>\
                      <td>'+data[i].role+'</td>\
                      <td>'+data[i].skillName+'</td>\
                      <td>'+data[i].skillType+'</td>\
                      <td>'+data[i].level+'</td><td><span id="'+data[i]._id+'">&nbsp;&nbsp;<button class="up-lv btn btn-info" data-skillId="'+data[i]._id+'" data-user="'+emp+'">Update level</button></span></td>\
                      </tr>')
                      }
                                  

        updateLevel();
      }
    });
  }

 function submitLevel(){
    $(".up-lv-submit").unbind().click(function(){
      var skillId = $(this).attr("data-skillId");
      var user = $(this).attr("data-user");
      var level = $("#lv"+skillId).val();
      
              
      if(level!="Beginner" && level!="Intermediate" && level!="Expert"){
        alert("Invalid level");
      }
      else{
        $.post('/user/updateLevel',{skillId:skillId,user:user,level:level},function(dat){
          
            getEmpData(user);
          
        });
      }
    }); 


$(".up-lv-cancel").unbind().click(function(){
      var skillId = $(this).attr("data-skillId");
      var user = $(this).attr("data-user");
      var level = $("#lv"+skillId).val();
      $("#"+skillId).html("").append('&nbsp;<button class="up-lv btn btn-info" data-skillId="'+skillId+'" data-user="'+user+'">Update Level</button>');
      updateLevel();
    });

 }        
  
$(".see-employee").unbind().click(function(){
    var emp = $(this).attr('data-employee');
    if($("#"+emp).html()==""){
      getEmpData(emp);
    }
  
    if($("#"+emp).is(":visible")){
      $(".employee-skills").hide();  
    } else {
      $(".employee-skills").hide();
      $("#"+emp).show();
      }
  });
            
          
})     