/*
Before going through the codes 
Please go through the Schema of how the 
1.Users 2.Skills 3.Logs/AdminLogs 4.Certification/Clients 
are stored in ../models/
*/

var express = require('express');
var router = express.Router();
var User = require('../models/User.js');
var Logs = require('../models/Logs.js');
var Skills = require('../models/Skills.js');
var Certification = require('../models/Certification.js');
var Client = require('../models/Client.js');
var obj = require('./obj');
  

router.get('/',function(req,res,next){
  var email = obj.siStatus(req,obj,obj.cookieKey);
  if(!email){
    res.redirect('/');
  }
  else{
    User.findOne({email:email} , function(err,user){
		
    /* Redirects based on if the user is Manager/Employee */
      if(user.isManager){
        res.redirect('/user/manager');
      }
      else{
        res.redirect('/user/employee');
      }

    });
  }
});


/* When an Employee logs in */
router.get('/employee' , function(req,res,next){
  var email = obj.siStatus(req,obj,obj.cookieKey);
  if(!email){
    res.redirect('/');
  }
  else{
    User.findOne({email:email},function(err,user){
      if(user.isManager){
        res.redirect('/user');
      }
      else{
        Skills.find({},function(err,skills){
          Certification.findOne({},function(err,c){
            Client.findOne({},function(err,cl){
              res.render('employee' , {user:user , skills:skills , certificates:c , clients:cl});
            });
          });
        });
      }
    });
  }
});

/* To save the skill submitted by the employee */
router.post('/skillSubmit',function(req,res,next){
  var email = obj.siStatus(req,obj,obj.cookieKey);
  if(!email){
    res.redirect('/');
  }
  else{
    var d = new Date();
		
    User.findOne({email:email} , function(err,user){
          
      /* To verify that he is not a Manager */
      if(user.isManager){
        res.redirect('/user');
      }
      else{

        var duplicate = 0;

        /* 
        To check for dupicate skills 
        duplicate is set to 1 if similar skill exists
        */
        for(i=0;i<user.skills.length;i++){
            if(user.skills[i].role==req.body.role && user.skills[i].skillName==req.body.skill && user.skills[i].skillType==req.body.type){
              duplicate = 1;
              break;
            }
        }

        if(duplicate){
          res.send(false);
        } else {

          /* Saving the skill if not duplicate */      
          user.skills.push({
            role: req.body.role,
            skillName: req.body.skill,
            skillType: req.body.type,
            level: req.body.level,
            exp: req.body.exp,
            createdDate: d
          });

          user.sessionSkills.push({
            role: req.body.role,
            skillName: req.body.skill,
            skillType: req.body.type,
            level: req.body.level,
            exp: req.body.exp,
          });

          user.save(function(err){
            if(err) throw err;
          });
        
          if(user.connectedTo.length){
            User.findOne({_id:user.connectedTo} , function(error , mUser){
          
              /* Updating the notifications of the connected manager */
              mUser.Updated = 1;
              mUser.Updates.push({
                notify: user.name+" add new skills",
                seen: 0,
                createdDate: d
              });
              mUser.save(function(err){
                if(err) throw err;
              });
            });
          }
            /* Adding the log of this event */
          Logs({
            record: user.name+" added new skills",
            createdDate: d
          }).save(function(err){if(err) throw err;});
          
          
          res.send('1');
        
        }
      }
      
    });
    
  }
});

router.post('/certificateUpdate',function(req,res){
  var userid = obj.siStatus(req,obj,obj.cookieKey);

  if(userid){
    User.findOne({email:userid},function(err,user){
      var d = new Date();
      user.certificates = req.body.certificate;
      user.save(function(err){
        if(err) throw err;

        if(user.connectedTo.length){
            User.findOne({_id:user.connectedTo} , function(error , mUser){
          
              /* Updating the notifications of the connected manager */
              mUser.Updated = 1;
              mUser.Updates.push({
                notify: user.name+" updated the Certifications",
                seen: 0,
                createdDate: d
              });
              mUser.save(function(err){
                if(err) throw err;
                res.redirect('/user');
              });
            });
          }

      });
    });
  } else {
    redirect('/');
  }

});

router.post('/clientUpdate',function(req,res){
  var userid = obj.siStatus(req,obj,obj.cookieKey);

  if(userid){
    User.findOne({email:userid},function(err,user){
      var d = new Date();
      user.clients = req.body.clients;
      user.save(function(err){
        if(err) throw err;
        if(user.connectedTo.length){
            User.findOne({_id:user.connectedTo} , function(error , mUser){
          
              /* Updating the notifications of the connected manager */
              mUser.Updated = 1;
              mUser.Updates.push({
                notify: user.name+" updated the Clients",
                seen: 0,
                createdDate: d
              });
              mUser.save(function(err){
                if(err) throw err;
                res.redirect('/user');
              });
            });
          }
      });
    });
  } else {
    redirect('/');
  }

});

/* 
To send the skills of a particular employee 
This event occurs when a manager clicks on a particular employee in his home page
*/
router.post('/getEmployeeData/:id' , function(req,res,next){
  
  if(!obj.siStatus(req,obj,obj.cookieKey)){
    res.redirect('/');
  } else {
    User.findOne({_id:req.params.id} , function(err,user){
      res.send(user.skills);
    });
  }
  
});

router.post('/getEmployeeCertifications/:id' , function(req,res,next){
  
  if(!obj.siStatus(req,obj,obj.cookieKey)){
    res.redirect('/');
  } else {
    User.findOne({_id:req.params.id} , function(err,user){
      res.send(user.certificates);
    });
  }
  
});

router.post('/getEmployeeClients/:id' , function(req,res,next){
  
  if(!obj.siStatus(req,obj,obj.cookieKey)){
    res.redirect('/');
  } else {
    User.findOne({_id:req.params.id} , function(err,user){
      res.send(user.clients);
    });
  }
  
});

router.post('/sessionSkills/:id' , function(req,res,next){
  
  if(!obj.siStatus(req,obj,obj.cookieKey)){
    res.redirect('/');
  } else {
    var id = req.params.id;
    User.findOne({_id:id} , function(err,user){
      res.send(user.sessionSkills);
    });
  }
  
});


/* When a manager logs in */
router.get('/manager' , function(req,res,next){
  var email = obj.siStatus(req,obj,obj.cookieKey);
  if(!email){
    res.redirect('/');
  }
  else{

    User.findOne({email:email} , function(err,user){
	 	
      if(!user.isManager){
        res.redirect('/user');
      }
      else{
        User.find( {connectedTo:[ user._id ]} , function(err,eUser){
          res.render('manager' , {user:user , eUser:eUser});
        });
      }

    });
  }
});

/* To update the level of any skill. This block is used for both manager and employee */
router.post('/updateLevel', function(req,res,next) {
  
  var u = obj.siStatus(req,obj,obj.cookieKey);
  if(!u){
    res.redirect('/')
  } 
  
  var level = req.body.level;

/* Checking if the received level is a vaild one */
  if(level!="Beginner" && level!="Intermediate" && level!="Expert" && level!="select"){
    res.send(false);
  } else {
    var skillId = req.body.skillId;
    var exp = req.body.exp;
    var id = req.body.user;
    User.findOne({ _id:id } , function(err,user){
	 		
      var allSkills = user.skills;
      var d = new Date(); // noting the time of the event

      
      User.findOne({email:u} , function(err,currUser){
      
        for(i=0;i<allSkills.length;i++){
        
          /* Finding the skill to which the change of level request corresponds to */
          if(allSkills[i]._id == skillId){
            if(level != "select"){
              var oldLevel = allSkills[i].level;
              allSkills[i].level = level ;
            }
            if(exp != "select"){ 
              var oldExp = allSkills[i].exp;
              allSkills[i].exp = exp ;
            } 
      
            /* This block is executed when the manager is changing the level of skills */
            if(currUser.isManager){
              
              /* Notifications of the connected employee is updated here*/
              if(level != "select"){
                user.Updated = 1;
                user.Updates.push({
                  notify: "Manager updated the level of "+allSkills[i].role+"-"+allSkills[i].skillName+"-"+allSkills[i].skillType+" from "+oldLevel+" to "+level,
                  seen: 0,
                  createdDate: d
                });
              }

              if(exp != "select"){
                user.Updated = 1;
                user.Updates.push({
                  notify: "Manager updated the experience of "+allSkills[i].role+"-"+allSkills[i].skillName+"-"+allSkills[i].skillType+" from "+oldExp+" to "+exp,
                  seen: 0,
                  createdDate: d
                });
              }

              User.findOne({_id:user.connectedTo},function(err,U){
                /* This event is recorded in the logs here */
                Logs({
                  record: U.name+" updated the skills of "+user.name,
                  createdDate: d
                }).save(function(err){if(err) throw err;});
              });


            } 

            /* This block is executed when the employee is changing the level of skills */
            else {
             
             if(user.connectedTo.length){ 
              User.findOne({_id:user.connectedTo},function(err,U){
            
                /* notifications of the connected manager is updated here */
                if(level != "select"){
                  U.Updated = 1;
                  U.Updates.push({
                    notify: user.name+" updated the level of "+allSkills[i].role+"-"+allSkills[i].skillName+"-"+allSkills[i].skillType+" from "+oldLevel+" to "+level,
                    seen: 0,
                    createdDate: d
                  });
                }

                if(exp != "select"){
                  U.Updated = 1;
                  U.Updates.push({
                    notify: user.name+" updated the experience of "+allSkills[i].role+"-"+allSkills[i].skillName+"-"+allSkills[i].skillType+" from "+oldExp+" to "+exp,
                    seen: 0,
                    createdDate: d
                  });
                }

                U.save(function(err){
                  if(err) throw err;
                });
                });
            }

                /* This event is recorded in the logs here */
                Logs({
                  record: user.name+" updated the level of his skills",
                  createdDate: d
                }).save(function(err){if(err) throw err;});

            }
            break;
          }
        }

        user.save(function(err){
          if(err) throw err;
        });
      
        res.send("1");

      });
      
    });
      
  }
  
});


/* 
This is called when a user clicks on the notifications 
This sets 'Updated' of the user to '0' (meaning no new notifications)
And sets seen=1 for all the notifications
*/
router.post('/seen',function(req,res,next){
  var email = obj.siStatus(req,obj,obj.cookieKey);
  if(!email){
    res.send(0);
  }
  else{

    User.findOne({email:email} , function(err,user){
      user.Updated = false;
      for(i = 0; i < user.Updates.length ; i++){
        user.Updates[i].seen = 1 ;
      }
      
      user.save(function(err){
        if(err) throw err;
      });
      
      res.send("1");
    });
  }
});

module.exports = router;  