$(document).ready(function(){
  
  
  function updateLevel(){
    $(".up-lv").unbind().click(function(){
      var skillId = $(this).attr("data-skillId");
      var user = $(this).attr("data-user");
      $("#"+skillId).html("");
      $("#"+skillId).append('&nbsp;<select id="lv'+skillId+'" class="btn btn-default"><option value="select">Select level</option><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Expert">Expert</option></select>&nbsp;<select id="exp'+skillId+'" class="btn btn-default"><option value="select">Select Experience(yrs)</option>'+$("#experience-options").html()+'<option value="15+">15+</option></select>&nbsp;<button class="up-lv-submit btn btn-primary" data-skillId="'+skillId+'" data-user="'+user+'">Save</button>&nbsp;<button class="up-lv-cancel btn btn-warning" data-skillId="'+skillId+'" data-user="'+user+'" >Cancel</button>');
              
      submitLevel();
              
    });
  }
          
 
  function getEmpData(emp){
  $("#"+emp).html("loading...");
  $.post('/user/getEmployeeData/'+emp,function(data){
    if(data){
      $("#"+emp).html("");
      $("#"+emp).append('<ul class="nav nav-tabs"><li class="active"><a href="#skill'+emp+'" data-toggle="tab">Skills</a></li><li><a href="#ce'+emp+'" data-toggle="tab">Certifications</a></li><li><a href="#cl'+emp+'" data-toggle="tab">Clients</a></li></ul>');
      
      $("#"+emp).append('<div class="tab-content" id="content'+emp+'"></div>');
      
      $("#content"+emp).append('<div class="tab-pane fade in active" id="skill'+emp+'"></div>');
      $("#content"+emp).append('<div class="tab-pane fade" style="padding-top:2em" id="ce'+emp+'"></div>');
      $("#content"+emp).append('<div class="tab-pane fade" style="padding-top:2em" id="cl'+emp+'"></div>');
      
      $("#skill"+emp).append('<table class="table table-striped">\
                                 <thead>\
                                 <tr>  \
                                 <th>Role</th>\
                                 <th>Skill</th>\
                                 <th>Type</th>\
                                 <th>Level</th>\
                                 <th>Experience</th><th></th>\
                                 </tr>\
                                 </thead><tbody><tr></tr></tbody></table>');
                      
        for(i=0;i<data.length;i++){
          $("#skill"+emp+" tr:last").after('<tr>\
                      <td>'+data[i].role+'</td>\
                      <td>'+data[i].skillName+'</td>\
                      <td>'+data[i].skillType+'</td>\
                      <td>'+data[i].level+'</td>\
                      <td>'+data[i].exp+' yrs</td><td><span id="'+data[i]._id+'">&nbsp;&nbsp;<button class="up-lv btn btn-info" data-skillId="'+data[i]._id+'" data-user="'+emp+'">Update level</button></span></td>\
                      </tr>')
                      }
      if(!data.length){
        $("#skill"+emp).html('<h4><b>None yet...</b></h4>')
      }
                                  
        
      updateLevel();
      
      $("#ce"+emp).html("Loading...");
      $.post('/user/getEmployeeCertifications/'+emp , function(cert){
        
        if(cert){
          $("#ce"+emp).html("");
          for(i=0;i<cert.length;i++){
            $("#ce"+emp).append('<span style="border:1px solid #00ccee;padding:0.4em 1em;border-radius:0.3em">'+cert[i]+'</span>&emsp;');
          }
        }
        
        $("#cl"+emp).html("Loading...");
        $.post('/user/getEmployeeClients/'+emp , function(cli){
        
          if(cli){
            $("#cl"+emp).html("");
            for(i=0;i<cli.length;i++){
              $("#cl"+emp).append('<span style="border:1px solid #00ccee;padding:0.4em 1em;border-radius:0.3em">'+cli[i]+'</span>&emsp;');
            }
          }
        
        });
        
      });
      
      }
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
          
            getEmpData(user);
          
        });
      }
    }); 


$(".up-lv-cancel").unbind().click(function(){
      var skillId = $(this).attr("data-skillId");
      var user = $(this).attr("data-user");
      var level = $("#lv"+skillId).val();
      $("#"+skillId).html("").append('&nbsp;<button class="up-lv btn btn-info" data-skillId="'+skillId+'" data-user="'+user+'">Update</button>');
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