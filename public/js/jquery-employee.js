

function getEmpData(emp){
  $("#"+emp).html("loading...");
  $("#read"+emp).html("loading...");
  $.post('/user/getEmployeeData/'+emp,function(data){
    
      
      
      $("#"+emp).html("");
      $("#"+emp).append('<table class="table table-striped">\
                                 <thead>\
                                 <tr>  \
                                 <th>Role</th>\
                                 <th>Skill</th>\
                                 <th>Type</th>\
                                 <th>Level</th> \
                                 <th>Experience</th><th></th>\
                                 </tr>\
                                 </thead><tbody><tr></tr></tbody></table>');
                      
        for(i=0;i<data.length;i++){
          $("#"+emp+" tr:last").after('<tr>\
                      <td>'+data[i].role+'</td>\
                      <td>'+data[i].skillName+'</td>\
                      <td>'+data[i].skillType+'</td>\
                      <td>'+data[i].level+'</td>\
                      <td>'+data[i].exp+' yrs</td>\
                      <td><span id="'+data[i]._id+'">&nbsp;&nbsp;<button class="up-lv btn btn-info" data-skillId="'+data[i]._id+'" data-user="'+emp+'">Update</button>&nbsp;<button class="btn delete-skill" data-skillId="'+data[i]._id+'" data-user="'+emp+'" style="color:white;background:#d9534f"><span class="glyphocon glyphicon-minus"></span></button></span></td>\
                      </tr>');
        }
      
      $("#read"+emp).html("");
      $("#read"+emp).append('<table class="table table-striped">\
                                 <thead>\
                                 <tr>  \
                                 <th>Role</th>\
                                 <th>Skill</th>\
                                 <th>Type</th>\
                                 <th>Level</th>\
                                 <th>Experience</th>\
                                 </tr>\
                                 </thead><tbody><tr></tr></tbody></table>');
                      
        for(i=0;i<data.length;i++){
          $("#read"+emp+" tr:last").after('<tr>\
                      <td>'+data[i].role+'</td>\
                      <td>'+data[i].skillName+'</td>\
                      <td>'+data[i].skillType+'</td>\
                      <td>'+data[i].level+'</td>\
                      <td>'+data[i].exp+' yrs</td>\
                      </tr>');
        }
                                  

        uplv();
        deleteSkill();
      
    });
  }


function sessionSkills(emp){
  
  
  $("#session-skills").html("Loading...");
  $.post('/user/sessionSkills/'+emp,function(data){
    if(data){
      $("#session-skills").html("");
      $("#session-skills").append('<table class="table table-striped">\
                                 <thead>\
                                 <tr>  \
                                 <th>Role</th>\
                                 <th>Skill</th>\
                                 <th>Type</th>\
                                 <th>Level</th>\
                                 <th>Experience</th>\
                                 </tr>\
                                 </thead><tbody><tr></tr></tbody></table>');
                      
        for(i=0;i<data.length;i++){
          $("#session-skills tr:last").after('<tr>\
                      <td>'+data[i].role+'</td>\
                      <td>'+data[i].skillName+'</td>\
                      <td>'+data[i].skillType+'</td>\
                      <td>'+data[i].level+'</td>\
                      <td>'+data[i].exp+' yrs</td>\
                      </tr>');
        }
                
      }
    });
  
} 


 function uplv(){          
   
    $(".up-lv").unbind().click(function(){
      var skillId = $(this).attr("data-skillId");
      var user = $(this).attr("data-user");
      $("#"+skillId).html("");
      $("#"+skillId).append('&nbsp;<select id="lv'+skillId+'" class="btn btn-default"><option value="select">Select level</option><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Expert">Expert</option></select>&nbsp;<select id="exp'+skillId+'" class="btn btn-default"><option value="select">Select Experience(yrs)</option>'+$("#experience-options").html()+'<option value="15+">15+</option></select>&nbsp;<button class="up-lv-submit btn btn-primary" data-skillId="'+skillId+'" data-user="'+user+'">Save</button>&nbsp;<button class="up-lv-cancel btn btn-warning" data-skillId="'+skillId+'" data-user="'+user+'" >Cancel</button>');
              

      submitLevel();
              
    });
  }

function deleteSkill(){
  
  $(".delete-skill").unbind().click(function(){

    $("#modal-note").html('');
    $("#modal-delete-btn").attr({'data-skillId':$(this).attr('data-skillId') , 'data-user':$(this).attr('data-user')});
    $("#delete-skill-modal").modal();

    $("#modal-delete-btn").click(function(){
      var emp = $(this).attr('data-user');
      $("#modal-note").html('Deleting...&emsp;');
      $.post('/user/deleteSkill/'+$(this).attr('data-skillId'), {user:emp} , function(data){
        if(data){
          $("#delete-skill-modal").modal('hide');
          getEmpData(emp);
        } else {
          $("#modal-note").html('Error while deleting &emsp;');
        }
      });
    });

  });
  
}

  function submitLevel(){
    $(".up-lv-submit").unbind().click(function(){
      var skillId = $(this).attr("data-skillId");
      var user = $(this).attr("data-user");
      var level = $("#lv"+skillId).val();
      var exp = $("#exp"+skillId).val();
      
              
      if(level!="Beginner" && level!="Intermediate" && level!="Expert" && level!="select"){
        alert("Invalid level");
      }
      else{
        $.post('/user/updateLevel',{skillId:skillId,user:user,level:level,exp:exp},function(dat){
          if(dat){
            getEmpData(user);
            sessionSkills(user);
          } else {
            location.reload();
          }
        });
      }
    }); 
   

    $(".up-lv-cancel").unbind().click(function(){
      var skillId = $(this).attr("data-skillId");
      var user = $(this).attr("data-user");
      var level = $("#lv"+skillId).val();
      $("#"+skillId).html("").append('&nbsp;<button class="up-lv btn btn-info" data-skillId="'+skillId+'" data-user="'+user+'">Update</button>&nbsp;<button class="btn delete-skill" data-skillId="'+skillId+'" style="color:white;background:#d9534f"><span class="glyphocon glyphicon-minus"></span></button>');
      uplv();
      deleteSkill();
    });

  } 

  