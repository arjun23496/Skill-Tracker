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

              var r=[] , n=[] , t=[];
              for(i=0;i<user.skills.length;i++){
                if(r.indexOf(user.skills[i].role) == -1) { r.push(user.skills[i].role); }
                if(r.indexOf(user.skills[i].skillName) == -1) { n.push(user.skills[i].skillName); }
                t.push(user.skills[i].skillType);
              }
              console.log(r,n,t);

              res.render('employee' , {user:user , skills:skills , certificates:c , clients:cl ,r:r , n:n , t:t});
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
        var role = req.body.role;
        var skill = req.body.skill;
        var type = req.body.type;

        /* 
        To check for dupicate skills 
        duplicate is set to 1 if similar skill exists
        */
        for(i=0;i<user.skills.length;i++){
            if(user.skills[i].role==role && user.skills[i].skillName==skill && user.skills[i].skillType==type){
              duplicate = 1;
              break;
            }
        }

        if(duplicate){
          res.send(false);
        } else {

          /* Saving the skill if not duplicate */      
          user.skills.push({
            role: role,
            skillName: skill,
            skillType: type,
            level: req.body.level,
            exp: req.body.exp,
            createdDate: d
          });

          user.sessionSkills.push({
            role: role,
            skillName: skill,
            skillType: type,
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
                notify: user.name+" has added "+type+" skill to "+req.body.level,
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

router.post('/deleteSkill/:skillId',function(req,res){
  if(obj.siStatus(req,obj,obj.cookieKey)){

    User.findOne({_id:req.body.user} , function(err,user){
      if(user){
        var skillId = req.params.skillId;
        for(i=0;i<user.skills.length;i++){
          if(user.skills[i]._id == skillId) { break; }
        }

        if(i==user.skills.length){
          res.send(false);
        } else {
          user.skills.splice(i,1);
          user.save(function(err){
            if(err) throw err;
            res.send(true);
          });
        }

      } else {
        res.send(false);
      }
    });

  } else {
    res.redirect('/');
  }
});

router.post('/certificateUpdate',function(req,res){
  var userid = obj.siStatus(req,obj,obj.cookieKey);

  if(userid){
    User.findOne({email:userid},function(err,user){
      var d = new Date();
      var updatedCertificates = req.body.certificate;

      
      if(updatedCertificates){
        // checking for the new certificates added
        var newAdded = [];
        for(i=0;i<updatedCertificates.length;i++){
          if(user.certificates.indexOf(updatedCertificates[i]) == -1){
            newAdded.push(updatedCertificates[i]);
          }
        }

        // checking for removed certificates
        var removed = [];
        for(i=0;i<user.certificates.length;i++){
          if(updatedCertificates.indexOf(user.certificates[i]) == -1){
            removed.push(user.certificates[i]);
          }
        }
      } else {
        var removed = user.certificates;
      }


      user.certificates = updatedCertificates;
      user.save(function(err){
        if(err) throw err;

        if(user.connectedTo.length){
            User.findOne({_id:user.connectedTo} , function(error , mUser){
              /* Updating the notifications of the connected manager */
              if(removed.length){
                mUser.Updated = 1;
                mUser.Updates.push({
                  notify: user.name+" removed Certifications "+removed,
                  seen: 0,
                  createdDate: d
                });
                Logs({
                  record: user.name+" removed Certifications "+removed,
                  createdDate: d
                }).save(function(err){if(err) throw err;});

              }

              if(newAdded.length){
                mUser.Updated = 1;
                mUser.Updates.push({
                  notify: user.name+" added Certifications "+newAdded,
                  seen: 0,
                  createdDate: d
                });             
                Logs({
                  record: user.name+" added Certifications "+newAdded,
                  createdDate: d
                }).save(function(err){if(err) throw err;});   
              }

              mUser.save(function(err){
                if(err) throw err;
                res.redirect('/user/employee')
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
      var updatedClients = req.body.clients;

      if(updatedClients){
        // checking for the new clients added
        var newAdded = [];
        for(i=0;i<updatedClients.length;i++){
          if(user.clients.indexOf(updatedClients[i]) == -1){
            newAdded.push(updatedClients[i]);
          }
        }

        // checking for removed clients
        var removed = [];
        for(i=0;i<user.clients.length;i++){
          if(updatedClients.indexOf(user.clients[i]) == -1){
            removed.push(user.certificates[i]);
          }
        }
      } else {
        var removed = user.clients;
      }


      user.clients = updatedClients;
      user.save(function(err){
        if(err) throw err;
        if(user.connectedTo.length){
            User.findOne({_id:user.connectedTo} , function(error , mUser){
          
              /* Updating the notifications of the connected manager */
              if(removed.length){
                mUser.Updated = 1;
                mUser.Updates.push({
                  notify: user.name+" removed Clients "+removed,
                  seen: 0,
                  createdDate: d
                });
                Logs({
                  record: user.name+" removed Clients "+removed,
                  createdDate: d
                }).save(function(err){if(err) throw err;});
              }

              if(newAdded.length){
                mUser.Updated = 1;
                mUser.Updates.push({
                  notify: user.name+" added Clients "+newAdded,
                  seen: 0,
                  createdDate: d
                });                
                Logs({
                  record: user.name+" added Clients "+newAdded,
                  createdDate: d
                }).save(function(err){if(err) throw err;});
              }

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

    function logUpdates(message,d){
      Logs({
         record: message,
          createdDate: d
        }).save(function(err){if(err) throw err;});
    }

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
                  notify: "Manager has changed "+allSkills[i].skillType+" skill from "+oldLevel+" to "+level,
                  seen: 0,
                  createdDate: d
                });
                logUpdates(
                  currUser.name+" changed level of "+allSkills[i].skillType+" skill of "+user.name+" from "+oldLevel+" to "+level,
                  d);
              }

              if(exp != "select"){
                user.Updated = 1;
                user.Updates.push({
                  notify: "Manager has changed exp of "+allSkills[i].skillType+" skill from "+oldExp+" to "+exp,
                  seen: 0,
                  createdDate: d
                });
                logUpdates(
                  currUser.name+" changed exp of "+allSkills[i].skillType+" skill of "+user.name+" from "+oldExp+" to "+exp,
                  d);
              }
            } 

            /* This block is executed when the employee is changing the level of skills */
            else {
             
             if(user.connectedTo.length){ 
              User.findOne({_id:user.connectedTo},function(err,U){
            
                /* notifications of the connected manager is updated here */
                if(level != "select"){
                  U.Updated = 1;
                  U.Updates.push({
                    notify: user.name+" has changed "+allSkills[i].skillType+" skill from "+oldLevel+" to "+level,
                    seen: 0,
                    createdDate: d
                  });
                  logUpdates(
                  user.name+" changed level of "+allSkills[i].skillType+" skill from "+oldLevel+" to "+level,
                  d);
                }

                if(exp != "select"){
                  U.Updated = 1;
                  U.Updates.push({
                    notify: user.name+" has changed exp of "+allSkills[i].skillType+" skill from "+oldExp+" to "+exp,
                    seen: 0,
                    createdDate: d
                  });
                  logUpdates(
                  user.name+" changed exp of "+allSkills[i].skillType+" skill from "+oldExp+" to "+exp,
                  d);
                }

                U.save(function(err){
                    if(err) throw err;
                  });
                });
              }
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