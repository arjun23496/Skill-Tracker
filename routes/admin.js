/*
Before going through the codes 
Please go through the Schema of how the 1.Users 2.Skills 3.Logs are stored in ../models
*/


var express = require('express');
var router = express.Router();
var User = require('../models/User.js');
var Skills = require('../models/Skills.js');
var AdminLogs = require('../models/AdminLogs.js');
var obj = require('./obj');

/* This function is to check if the admin is logged in and if the cookie is a vaild one */
/* The big string below is the hashed password of the admin */
function adminStatus(req){
  if(req.signedCookies.admin == "3e60ff059385bb2ba826ade27b4c4ba554c749d0afe179d6a54a1d0a79ee649d"){
    return 1;
  }
  else{
    return 0;
  }
}

/* To validate the login of the admin */
router.post('/adminLogin',function(req,res){
  var password = obj.hash(req.body.password);
  
  if(password == "3e60ff059385bb2ba826ade27b4c4ba554c749d0afe179d6a54a1d0a79ee649d"){
    /*  
    A separate cookie is stored for the admin containing the hashed value of his password
    */
    res.cookie('admin' , password , {signed:true});
    
  }

  res.redirect('/admin');
});


router.get('/', function(req, res, next) {

  if(adminStatus(req)){
    /*If the admin is logged in*/ 
    
    /* To load all the skills */
    Skills.find({},function(err,skills){
      if(err) throw err;
      
      /* To load all the employees */
      User.find({isManager:0} , function(error,users){
        if(error) throw error;
        
        /* To load all the managers */
        User.find({isManager:1} , function(er,managers){
          
          /* Manager's Id(s) are stored in mId in the form of string */
          /* 
          Id is stored separately in mId to directly link the
          managers of the employees
          Index of the manager's Id present in mId is used to 
          access corresponding manager in admin.ejs
          */
          var mId = [];
          
          /* Manager's Id(s) are stored in mIdRaw as present in database(same format) */
          var mIdRaw = [];

          /* pushing all the content in mId and mIdRaw */
          for(i=0;i<managers.length;i++){
            mId.push(managers[i]._id.toString());
            mIdRaw.push(managers[i]._id);
          }

          res.render('admin' , {skills:skills , users:users , mId:mId , mIdRaw:mIdRaw , mUser:managers});

        });
        
      });
    });
  }
  else{
    /*If the admin is not logged in*/
    res.render('adminLogin');

  }

});


/*To ADD a new skill*/
router.post('/addSkill',function(req,res){
  if(!adminStatus(req)){
    /* If the admin is not logged in */
    res.redirect('/admin');
  } else {
    /*If the admin is logged in*/
    
    /* This function is to record this event in AdminLog */
    function logA(d){
       AdminLogs({
         record: "Admin added new skill",
         createdDate: d
       }).save(function(err){
               if(err) throw err;
               res.send("1");
             }); 
    }

    var role = req.body.role;
    var skillName = req.body.name;
    var skillType = req.body.type;
    var d = new Date();

    
    Skills.findOne({role:role} , function(err,skill){
      /* If the ROLE already exists the codes inside if(skill) condition is executed */
      if(skill){
      
        var pos = -1;
        for(i=0;i<skill.name.length;i++){
          if(skill.name[i].skillName.toUpperCase() == skillName.toUpperCase()){
            pos = i ;
            break;
          }
          
        }

        /* If both ROLE and SKILL NAME exists the codes inside if(pos != -1) condition is executed */
        if(pos != -1){
        
          var flag = 0;
          for(i=0;i<skill.name[pos].skillType.length;i++){
            if(skill.name[pos].skillType[i].toUpperCase() == skillType.toUpperCase()){
              flag = 1;
              break;
            }
          }

          /* If the same copy of the skill exists the codes inside if(flag) is executes */
          if(flag){
            res.send(false);
          } 
          /* The code inside this else is run if ROLE and SKILL NAME exist but not SKILL TYPE */
          else {
            
            skill.name[pos].skillType.push(skillType);
            skill.markModified('name');
            
            skill.save(function(err){
              if(err) throw err;
              
              logA(d);
              
            });
          }

        } 
        /* The code inside this else is run if ROLE exist but not SKILL NAME and SKILL TYPE */
        else {
          skill.name.push({
            skillName: skillName,
            skillType: [skillType]
          });
          
          skill.save(function(err){
            if(err) throw err;
            
           logA(d);
          
          });
        }


      } 
      /* The code inside this else is run if the ROLE does not exist in database */
      else {
        Skills({
          role:role,
          name:[{
            skillName: skillName,
            skillType: [skillType]
          }]
        }).save(function(err){
          if(err) throw err;
          
         logA(d);
      
        });
      }
    });
  }

});

/* To delete a skill */
router.post('/deleteSkill/:id/:name/:type' , function(req,res){
  if(!adminStatus(req)){
    /* If the admin is not logged in */
    res.redirect('/admin');
  } else {
    /* If the admin is logged in */
    
    /* This function is to record this event in AdminLog */
    function logD(d){
      AdminLogs({
        record: "Admin deleted a skill",
        createdDate: d
      }).save(function(err){
                if(err) throw err;
                res.send("1");
              });
    } 
    
    var id = req.params.id;
    var skillName = req.params.name;
    var skillType = req.params.type;
    var d = new Date();

    /* This selects the particular skill entry which has the same ROLE (which has the same _id) */
    Skills.findOne({_id:id} , function(err,skill){

      /* The codes inside if(skill) is executed if the requested skill for deletion exists */
      if(skill) {

        /* This block is run to store the index of the entry which has the same SKILL NAME as the requested skill for deletion in posN  */
        var posN = -1;
        for(i=0;i<skill.name.length;i++){
          if(skill.name[i].skillName == skillName){
            posN = i ;
            break;
          }
        }
        
        /* This if(posN != -1) will be true if the SKILL NAME exists in the database */
        if(posN != -1){
          /* This block is run to store the index of the entry which has the same SKILL TYPE as the requested skill for deletion in posT  */
          var posT = -1;
          for(i=0;i<skill.name[posN].skillType.length;i++){
            if(skill.name[posN].skillType[i] == skillType){
              posT = i;
              break;
            }
          }  

          /* This if(posT != -1) will be true if the SKILL TYPE exists in the database */
          if(posT != -1) {
          
            /* 
            This if condition is true if there is only one SKILL TYPE and SKILL NAME for the corresponding ROLE 
            Then the complete entry of the ROLE is deleted
            */
            if(skill.name.length==1 && skill.name[posN].skillType.length == 1 ){
          
              Skills.remove({_id:id} , function(err){
                if(err) throw err;
            
                logD(d);
            
              });
          
            } 
            
            /* 
            This if condition is true if there is only one SKILL TYPE for the SKILL NAME 
            Then the SKILL NAME itself is deleted
            */
            else if(skill.name[posN].skillType.length == 1) {
          
              skill.name.splice(posN,1);
              skill.save(function(err){ 
                if(err) throw err; 
            
                logD(d);
            
              });
            
            } 
            /* 
            This else runs if there more than 1 SKILL TYPE for the SKILL NAME 
            Then only the SKILL TYPE is deleted 
            */
            else {
          
              skill.name[posN].skillType.splice(posT,1);
              skill.markModified('name');
              skill.save(function(err){ 
                if(err) throw err;
            
                logD(d);
              });
          
            }
          } else {
            res.send(false);
          }
        } else {
          res.send(false);
        }
      } else {
        res.send(false);
      }

    });
  }
});

/* To change association of the employee */
router.post('/changeAsso' , function(req,res){

  if(adminStatus(req)){
    var userid = req.body.userid;
    var manager = req.body.manager;
    var d = new Date();

    User.findOne({_id:userid} , function(err,user){
      /* This if condition is true if the new manager is same as the old manager */
      if(user.connectedTo[0] == manager) {
        res.send("1");
      } 
      /* This else runs if the new manager is different from old manager */
      else {
        
        User.findOne({_id:manager} , function(e,newM){
          /* This if condition is true if the Employee is not associated to any Manager */
          if(!user.connectedTo.length){
            
            /* Associations are created here */
            user.connectedTo.push(manager);
            newM.connectedTo.push(user._id);

            user.save(function(e1){
              if(e1) throw e1;
              
              newM.save(function(e3){
                if(e3) throw e3;


              });
            });
            
          } 
          /* This else is run if the Employee is associated to some Manager */
          else {
            
            User.findOne({_id:user.connectedTo[0]} , function(er,oldM){
              
              /* Associations are changed here */
              user.connectedTo.splice(0,1);
              user.connectedTo.push(manager);
              
              var pos = oldM.connectedTo.indexOf(user._id);
              oldM.connectedTo.splice(pos,1);
              newM.connectedTo.push(user._id);

              /* All the users are saved */
              user.save(function(e1){
                if(e1) throw e1;
                
                oldM.save(function(e2){
                  if(e2) throw e2;
                  
                  newM.save(function(e3){
                    if(e3) throw e3;
                  
                  });
                });
              });
              
            });
            
          }
          
          /* This event is recorded in the AdminLog */
          AdminLogs({
            record: "Admin associated "+user.name+" to "+newM.name,
            createdDate: d
          }).save(function(err){
            if(err) throw err;
            res.send("1");
          });
          
        });
        
      }
    });

  } else {
    res.redirect('/admin');
  }

});

/*
This block of code is used to both DISASSOCIATE an Employee
And REMOVE an Employee

While removing an Employee , he/she is first disassociated then removed
*/
router.post('/disassociate/:userid' , function(req,res){

  if(adminStatus(req)){
    
    /* Function to remove an Employee */
    function removeEmp(res,userid,d,name){
      User.remove({_id:userid},function(err){
        if(err) throw err;
      
        /* The event of removal of an Employee is recorded here */
        AdminLogs({
          record: "Admin removed employee "+name,
          createdDate: d
        }).save(function(err){
                if(err) throw err;
                res.send("1");
              });
      
      });
    }

    /* Function to record the event of disassociation of an Employee */
    function logDisasso(name,d){
      AdminLogs({
        record: "Admin disassociated "+name,
        createdDate: d
      }).save(function(err){
        if(err) throw err;
        res.send("1");
      });
    } 
    
    var userid = req.params.userid;
    var d = new Date();

    User.findOne({_id:userid} , function(err,user){
      if(!user){
        res.send(false);
      } 
      /* This code is run when the user exists */
      else {
        
        /* This if condition is true if the Employee is already disassociated and was asked to remove  */
        if(!user.connectedTo.length && req.body.remove=="remove"){

          removeEmp(res,userid,d,user.name);

        } 
        /* This if condition is true if the Employee is already disassociated ( This runs when the Employee is not for removal ) */
        else if(!user.connectedTo.length) {

          logDisasso(user.name,d);

        } 
        /* This else is run if the Employee is not disassociated yet */
        else {


          User.findOne({_id:user.connectedTo[0]} , function(er,mUser){

            /* All the association is removed between the Employee and Manager here */
            user.connectedTo.splice(0,1);
            
            var pos = mUser.connectedTo.indexOf(user._id);
            mUser.connectedTo.splice(pos,1);


            user.save(function(e1){
              if(e1) throw e1;
              
              mUser.save(function(e2){
                if(e2) throw e2;
                
                // After disassociation
                /* This if condition is true if the Employee is also for removal */
                if(req.body.remove == "remove"){
                  removeEmp(res,userid,d,user.name);
                } 
                /* This else is run if the Employee is not for removal */
                else {
                  
                  logDisasso(user.name,d);
                  
                }
              });
            });

          });
        }
      }
    });

  } 
  /* If the admin is not logged in */
  else {
    res.redirect('/admin');
  }

});

/* To add a new employee */
router.post('/addEmployee',function(req,res){
  /* Checking if the admin is logged in and the manager is selected */
  if(adminStatus(req) && req.body.manager != "select"){

    var manager = req.body.manager;
    var email = req.body.email;
    var d = new Date();

    /* The new employee is saved here */
    User({
      name:req.body.name,
      email:req.body.email,
      password:obj.hash(req.body.password),
      connectedTo: [manager],
      isManager:0,
      Updated:0
    }).save(function(err){
      if(err) throw err;
      
      /* The corresponding manager is asscessed here */
      User.findOne({_id:manager} , function(err,mUser){
        if(err) throw err;
        
        /* The new user is accessed from the database to use the generated _id */
        User.findOne({email:email} , function(err,eUser){
          if(err) throw err;
          
          /* Here the manager is linked to the employee (which required _id of employee) */
          mUser.connectedTo.push(eUser._id);
          mUser.save(function(err){
            if(err) throw err;
            
            /* This event is recorded in the AdminLogs */
            AdminLogs({
              record: "Admin added new employee "+req.body.name,
              createdDate: d
            }).save(function(err){
                      if(err) throw err;
                      res.send("1");
                    });
            
          });
        });
      });
    });

  } else {
    res.send(false);
  }
});

/* To add a manager */
router.post('/addManager',function(req,res){
  if(adminStatus(req)){

    var d = new Date();

    /* New manager is saved here */
    User({
      name:req.body.name,
      email:req.body.email,
      password:obj.hash(req.body.password),
      connectedTo: [],
      isManager:1,
      Updated:0
    }).save(function(err){
      if(err) throw err;
      
      /* This event is recorded in the AdminLogs */
      AdminLogs({
        record: "Admin added new manager "+req.body.name,
        createdDate: d
      }).save(function(err){
                if(err) throw err;
                res.send("1");
              });
      
    });

  } else {
    res.send(false);
  }
});

/* To remove a manager */
router.post('/remManager/:userid',function(req,res){
  if(adminStatus(req)){
    var userid = req.params.userid;
    var d = new Date();
    
    /* Accessing the corresponding manager */
    User.findOne({_id:userid} ,function(err,user){
      if(user){
        
        if(user.isManager){

          /* Disassociating all the employees connected to this manager */
          for(i=0;i<user.connectedTo.length;i++){

            User.findOne({_id:user.connectedTo[i]} , function(err,eUser){
              eUser.connectedTo.splice(0,1);
              eUser.save(function(e1){
                if(e1) throw e1;
              });
            });

          }

          /* The employee is removed here */
          var name = user.name;
          User.remove({_id:userid},function(err){
            if(err) throw err;
            
            /* This event is recorded in AdminLogs */
            AdminLogs({
              record: "Admin removed manager "+name,
              createdDate: d
            }).save(function(err){
                      if(err) throw err;
                      res.send("1");
                    });
          });
          
        } else {
          res.send(false);
        }
      } else {
        res.send(false);
      }
    });

  } else {
    res.send(false);
  }
});

/* To clear the 'admin' cookie for the Logout event */
router.get('/logout' , function(req,res){
  res.clearCookie('admin');
  if(req.query.sessionTimeout == "true"){
    res.send("1");
  } else {
    res.redirect('/admin');
  }
  
});

module.exports = router;