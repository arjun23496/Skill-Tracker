$(document).ready(function(){
  
  
  /*To submit a skill*/
  $("#submit").click(function(){
    var role = $("#role").val();
    var name = $("#name").val();
    var type = $("#type").val();
    if(role && name && type){
      $("#add-note").html("Adding the skill");
      $.post('/admin/addSkill',
             {role:role,name:name,type:type},
             function(data){
        if(data){
          location.reload();
        } else {
          $("#add-note").html("Error while adding the skill. <br>This might also happen if the skill already exists");
        }
      });
    } else {
      $("#add-note").html("All field are mandatory");
    }
    
  });
  
  /*Submit certificate*/
  $("#add-cert-btn").click(function(){
    var cert = $("#add-cert-val").val();
    
    if(cert){
      $("#add-cert-note").html("Adding Certificate");
      $.post('/admin/addCertificate',{certificate:cert},function(data){
        if(data){
          location.reload();
        } else {
          $("#add-cert-note").html("Error while adding the Certificate. <br>This might also happen if the Certificate already exists");
        }
      });
    } else {
      $("#add-cert-note").html("The input field cant be empty");
    }
  });
  
  /*Submit Client*/
  $("#add-cli-btn").click(function(){
    var cli = $("#add-cli-val").val();
    
    if(cli){
      $("#add-cli-note").html("Adding Client");
      $.post('/admin/addClient',{client:cli},function(data){
        if(data){
          location.reload();
        } else {
          $("#add-cli-note").html("Error while adding the Client. <br>This might also happen if the Client already exists");
        }
      });
    } else {
      $("#add-cli-note").html("The input field cant be empty");
    }
  });
  
  
  /*To delete a skill*/
  $(".delete-skill").unbind().click(function(){
    var id = $(this).attr('data-id');
    var role = $(this).attr('data-role');
    var name = $(this).attr('data-name');
    var type = $(this).attr('data-type');
                  
    $("#modal-delete-btn").attr('data-request','/'+escape(id)+'/'+escape(name)+'/'+escape(type));
    $("#modal-note").html("");              
    $(".modal-body-skill").html('<table class="table table-striped"><thead><tr><th>Role</th><th>Skill</th><th>Type</th></tr></thead><tbody><tr><td>'+role+'</td><td>'+name+'</td><td>'+type+'</td></tr></tbody></table>');
    $("#delete-skill-modal").modal();
  });
              
  $("#modal-delete-btn").click(function(){
    $("#modal-note").html("Deleting");
    var req = '/admin/deleteSkill'+$(this).attr('data-request');
    $.post(req,function(data){
      if(data){
        location.reload();
      } else {
        $("#modal-note").html("Error while deleting.Please try again");
      }
    });
  });
  
  
  
  /*To delete a certificate*/
  $(".delete-cert").unbind().click(function(){
    var cert = $(this).attr('data-certificate');
                  
    $("#modal-delete-cert-btn").attr('data-request',cert);
    $("#modal-cert-note").html("");              
    $(".modal-body-cert").html('<table class="table table-striped"><thead><tr><th style="text-align:center;font-size:115%">Certificate Name</th></tr></thead><tbody><tr><td style="text-align:center">'+cert+'</td></tr></tbody></table>');
    $("#delete-cert-modal").modal();
  });
              
  $("#modal-delete-cert-btn").click(function(){
    $("#modal-cert-note").html("Deleting");
    $.post('/admin/deleteCertificate',{cert:$(this).attr('data-request')},function(data){
      if(data){
        location.reload();
      } else {
        $("#modal-cert-note").html("Error while deleting.Please try again");
      }
    });
  });

   /*To delete a client*/
  $(".delete-cli").unbind().click(function(){
    var cli = $(this).attr('data-client');
                  
    $("#modal-delete-cli-btn").attr('data-request',cli);
    $("#modal-cli-note").html("");              
    $(".modal-body-cli").html('<table class="table table-striped"><thead><tr><th style="text-align:center;font-size:115%">Client Name</th></tr></thead><tbody><tr><td style="text-align:center">'+cli+'</td></tr></tbody></table>');
    $("#delete-cli-modal").modal();
  });
              
  $("#modal-delete-cli-btn").click(function(){
    $("#modal-cli-note").html("Deleting");
    $.post('/admin/deleteClient',{cli:$(this).attr('data-request')},function(data){
      if(data){
        location.reload();
      } else {
        $("#modal-cli-note").html("Error while deleting.Please try again");
      }
    });
  });
  
  
  /*To change association of an employee*/
  function changeAsso(){
    $(".manager-list-change").unbind().click(function(){
      var userid = $(this).attr('data-userid');
      var manager = $("#v"+userid).val();
      if(manager!="select"){
        $("#"+userid).append('&nbsp;Changing');  
        $.post('/admin/changeAsso',{userid:userid,manager:manager},function(data){
          if(data){
            location.reload();
          } else {
            alert("Error while change. Please refresh the page and try again.")
          }
        });
      } else {
        alert('Select a manager');
      }   
    });
  }
              
  $(".change-asso").unbind().click(function(){
    var userid = $(this).attr('data-userid');
    $("#"+userid).html("");
    $("#"+userid).append('<select id="v'+userid+'" class="btn btn-default manager-list-val">  <option value="select">Select Manager</option>'+$("#manager-list-dd").html()+'</select><button data-userid="'+userid+'" class="btn btn-success manager-list-change">Change</button>');
    changeAsso();
  });
  
  
  
  /*To disassociate an employee*/
  $(".disassociate").unbind().click(function(){
    var userid = $(this).attr('data-userid');
    var name = $(this).attr('data-name');
    $(".modal-title-disasso").html('Do you really want to disassociate '+name+'?')
    $("#modal-disassociate-btn").attr('data-request','/admin/disassociate/'+userid);
    $("#disassociate-modal").modal();
  });
                
  $("#modal-disassociate-btn").click(function(){
    var request = $(this).attr('data-request');
    $.post(request , {remove:"dont remove"} , function(data){
      if(data){
        location.reload();
      } else {
        alert("Error while disassociation . Please refresh the page and try again.")
      }
    });
  });
  
  
  /*To add employee*/
  $("#addEmployee").click(function(){
    var manager = $("#eManager").val();
    if(manager == "select"){
      alert("Select a manager");
    } else {
      var name = $("#eName").val();
      var email = $("#eemail").val();
                          
      if(name && email){
        $.post('/admin/addEmployee',
               {name:name,email:email,manager:manager} ,
               function(data){
          if(data){
            location.reload();
          } else {
            alert("There was some error while creating the new user. This might also happen if the email already exists");
          }
        });
      }
    }
  });
  
  /*To add manager*/
  $("#addManager").click(function(){
                      
    var name = $("#mName").val();
    var email = $("#memail").val();
    if(name && email){
      $.post('/admin/addManager',
             {name:name,email:email} ,
             function(data){
        if(data){
          location.reload();
        } else {
          alert("There was some error while creating the new user. This might also happen if the email already exists");
        }
      });
    }
  });
  
  
  /*To remove employee*/
  $(".rem-emp").unbind().click(function(){
    var name = $(this).attr('data-name');
    var empId = $(this).attr('data-userid');
    $(".modal-title-rem-emp").html('Do you really want to remove '+name+'?');
    $("#modal-rem-emp-btn").attr('data-request','/admin/disassociate/'+empId);
    $("#remove-employee-modal").modal();
                        
  });
                      
  $("#modal-rem-emp-btn").click(function(){
    var request = $(this).attr('data-request');
    $.post(request , {remove:"remove"} ,function(data){
      if(data){
        location.reload();
      } else {
        alert("Error while removing . Please refresh the page and try again.")
      }
    });
  });
  
  /*To remove manager*/
  $(".rem-man").unbind().click(function(){
    var name = $(this).attr('data-name');
    var userid = $(this).attr('data-userid');
    $(".modal-title-rem-man").html('Do you really want to remove '+name+'?');
    $("#modal-rem-man-btn").attr('data-request','/admin/remManager/'+userid);
    $("#remove-manager-modal").modal();
                        
  });
                      
  $("#modal-rem-man-btn").click(function(){
    var request = $(this).attr('data-request');
    $.post(request,function(data){
      if(data){
        location.reload();
      } else {
        alert("Error while removing . Please refresh the page and try again.")
      }
    });
  });
        
  
});