/*
Before going through the codes 
Please go through the Schema of how the 
1.Users 2.Skills 3.Logs/AdminLogs 4.Certification/Clients 
are stored in ../models/
*/

var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var User = require('../models/User.js');
var Skills = require('../models/Skills.js');
var AdminLogs = require('../models/AdminLogs.js');
var Certification = require('../models/Certification.js');
var Client = require('../models/Client.js');
var obj = require('./obj');
var createUser = require('./createUser');
var parse = require('csv-parse');
var async = require('async');

/* This function is to check if the admin is logged in and if the cookie is a vaild one */
/* The big string below is the hashed password of the admin */
function adminStatus(req) {
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

          Certification.findOne({},function(err,certificates){
            Client.findOne({},function(err,clients){
              res.render('admin' , {skills:skills , users:users , mId:mId , mIdRaw:mIdRaw , mUser:managers , certificates:certificates , clients:clients});
            });
          });

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
         record: "Admin added new skill "+role+"-"+skillName+"-"+skillType,
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

    Skills.findOne({role:{ $regex : new RegExp(role, "i") }} , function(err,skill){
      /* If the ROLE already exists then if(skill) is true */
      if(skill){
      
        var pos = -1;
        for(i=0;i<skill.name.length;i++){
          if(skill.name[i].skillName.toUpperCase() == skillName.toUpperCase()){
            pos = i ;
            break;
          }
          
        }

        /* If both ROLE and SKILL NAME exists then if(pos != -1) is true */
        if(pos != -1){
        
          var flag = 0;
          for(i=0;i<skill.name[pos].skillType.length;i++){
            if(skill.name[pos].skillType[i].toUpperCase() == skillType.toUpperCase()){
              flag = 1;
              break;
            }
          }

          /* If the same copy of the skill exists then if(flag) is true */
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

/*To add a new certificate*/
router.post('/addCertificate',function(req,res){
  var cert = req.body.certificate;

  if(adminStatus(req)){

    if(cert){
      var d = new Date();
      Certification.findOne({},function(err,certificates){
        
        
        var flag = false;
        for (i = 0; i < certificates.data.length; i++) {
          if(certificates.data[i].toUpperCase() == cert.toUpperCase()){
            flag = true;
            break;
          }
        };

        /* This if() is true if the certificate does not exist in database */
        if(!flag){
          
          certificates.data.push(cert);
          certificates.save(function(err){ 
            if(err) throw err ; 
            
            /*Recording this event in AdminLogs*/
            AdminLogs({
               record: "Admin added new certificate "+cert,
               createdDate: d
             }).save(function(err){
                     if(err) throw err;
                     res.send(true);
                   });  

          });
        } else {
          res.send(false);
        }
      });
    } else {
      res.send(false);
    }

  } else {
    res.redirect('/admin');
  }

});

/*To add a new client*/
router.post('/addClient',function(req,res){
  var cli = req.body.client;

  if(adminStatus(req)){

    if(cli){
      var d = new Date();
      
      Client.findOne({},function(err,clients){
        
        var flag = false;
        for (i = 0; i < clients.data.length; i++) {
          if(clients.data[i].toUpperCase() == cli.toUpperCase()){
            flag = true;
            break;
          }
        };

        /* This if() is true if the client does not exist in database */
        if(!flag){
          clients.data.push(cli);
          clients.save(function(err){ 
            if(err) throw err ; 

            /*Recording this event in AdminLogs*/
            AdminLogs({
               record: "Admin added new client "+cli,
               createdDate: d
             }).save(function(err){
                     if(err) throw err;
                     res.redirect('/admin');
                   }); 

          });
        } else {
          res.send(false);
        }
      });
    } else {
      res.send(false);
    }

  } else {
    res.redirect('/admin');
  }

});


/*
Function to delete a skill
This function is used for deleting a single skill
And also for deleting skills in a batch
*/
/* 
id,skillName,skillType if of that particular skill 
'f' is the callback function
*/
function deleteSkill(res,id,skillName,skillType,d,f){

  /* This selects the particular skill entry which has the same ROLE (which has the same _id) */
    Skills.findOne({_id:id} , function(err,skill){

      /* The codes inside if(skill) is executed if the requested skill for deletion exists */
      if(skill) {
        var role = skill.role;

        /* This function is to record this event in AdminLog */
        function logD(d){
          AdminLogs({
            record: "Admin deleted skill "+role+"-"+skillName+"-"+skillType,
            createdDate: d
          }).save(function(err){
                    if(err) throw err;
                    f();
                  });
        } 

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


/* To delete a single skill */
router.post('/deleteSkill/:id/:name/:type' , function(req,res){
  if(!adminStatus(req)){
    /* If the admin is not logged in */
    res.redirect('/admin');
  } else {
    /* If the admin is logged in */
    
    var id = req.params.id;
    var skillName = req.params.name;
    var skillType = req.params.type;
    var d = new Date();

    deleteSkill(res,id,skillName,skillType,d,function(){res.send("1");});
    
  }
});


/*
These are used for deleting skills in a batch
Use of temp and arr are mentioned in below deleteSkillBatch() function
*/
var temp,arr; 

/*Function to trigger deleting skills in a batch*/
function deleteSkillsBatch(res,skills,d){
  
  if(temp <= skills.length-2){
    /*temp stores the index of the skill (in array 'skills) which is being deleted at the moment*/
    temp++;
    
    /*
    arr stores the content of skill being deleted, in the format
    arr = [ role , skillName , skillType ] 
    */
    arr = skills[temp].split(",");
    deleteSkill(res,arr[0],arr[1],arr[2],d,function(){deleteSkillsBatch(res,skills,d)});
  } else {
    res.redirect('/admin');
  }
}

router.post('/deleteSkillsBatch',function(req,res){
  if(adminStatus(req)){
    var skills = req.body.skills;
    /* If atleast 1 skill is selected */
    if(skills){

      var d = new Date();

      /*
      If only one skill is selected then 'skills' will be a string
      If more than one skill is selected then 'skills' will be an array
      */
      /* This if() is true if more than 1 skill is selected */
      if(skills.constructor === Array){
        
        temp = -1;
        deleteSkillsBatch(res,skills,d); 
        
      } else {
        /* This executes when only 1 skill is selected */
        arr = skills.split(",");
        deleteSkill(res,arr[0],arr[1],arr[2],d,function(){res.redirect('/admin')});
      }

    } else {
      res.redirect('/admin');
    }

  } else {
    res.redirect('/admin');
  }
  
});


/*To delete a certificate*/
router.post('/deleteCertificate',function(req,res){

  if(adminStatus(req)){
    var cert = req.body.cert;

    Certification.findOne({},function(err,certificates){
      var d = new Date();
      var pos = certificates.data.indexOf(cert);

      /* This if(pos != -1) is true if the certificate exists in the database */
      if(pos != -1){

        certificates.data.splice(pos,1);
        certificates.save(function(err){
          if(err) throw err;
          /*Recording this event in AdminLogs*/
           AdminLogs({
             record: "Admin deleted certificate "+cert,
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

  } else {
    res.redirect('/admin');
  }

});

router.post('/deleteCertificatesBatch',function(req,res){
  if(adminStatus(req)){
    
    var certificates = req.body.certificates;
    var d = new Date();
    if(certificates){
    /*
    If only one certificate is selected then 'certificates' will be a string
    If more than one certificate is selected then 'certificates' will be an array
    */
    /* This if() is true if more than 1 certificate is selected */
      if(certificates.constructor == Array){
        Certification.findOne({},function(err,allCertificates){
          var pos;

          /*Deleting all certificates one by one*/
          for(i=0;i<certificates.length;i++){
            pos = allCertificates.data.indexOf(certificates[i]);
            allCertificates.data.splice(pos,1);
          }

          logEvent(allCertificates);
        });
      } else{
        /*This executes when there is only one certificate*/

        Certification.findOne({},function(err,allCertificates){
          var pos;

          pos = allCertificates.data.indexOf(certificates);
          allCertificates.data.splice(pos,1);
          logEvent(allCertificates);
        });

      }
  
      /* Function to record this event */
      function logEvent(allCertificates){
        allCertificates.save(function(err){
          if(err) throw err;
          AdminLogs({
            record: "Admin deleted certificate "+certificates,
            createdDate: d
          }).save(function(err){
            if(err) throw err;
            res.redirect('/admin');
          });
        });
      }

    } else {
      res.redirect('/admin');
    }
    
    
  } else {
    res.redirect('/admin');
  }
});


/*To delete a client*/
router.post('/deleteClient',function(req,res){

  if(adminStatus(req)){
    var cli = req.body.cli;

    Client.findOne({},function(err,clients){
      var d = new Date();
      var pos = clients.data.indexOf(cli);

      /* This if(pos != -1) is true if the client exists in the database */
      if(pos != -1){
        
        clients.data.splice(pos,1);
        clients.save(function(err){
          if(err) throw err;
          
          /*Recording this event in AdminLogs*/
          AdminLogs({
            record: "Admin deleted client "+cli,
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

  } else {
    res.redirect('/admin');
  }

});


router.post('/deleteClientsBatch',function(req,res){
  if(adminStatus(req)){
    
    var clients = req.body.clients;
    var d = new Date();    
    
    if(clients){
      
      /*
      If only one client is selected then 'clients' will be a string
      If more than one client is selected then 'clients' will be an array
      */
      /* This if() is true if more than 1 client is selected */
      if(clients.constructor == Array){
      
        Client.findOne({},function(err,allClients){
          var pos;

          /*Deleting client one by one*/
          for(i=0;i<clients.length;i++){
            pos = allClients.data.indexOf(clients[i]);
            allClients.data.splice(pos,1);
          }

          logEvent(allClients);
        });

      
      } else{
      
        Client.findOne({},function(err,allClients){
          var pos;

          /*This executes when there is only one client*/
          pos = allClients.data.indexOf(clients);
          allClients.data.splice(pos,1);

          logEvent(allClients);

        });

      }
  
      /*Function to record this event*/
      function logEvent(allClients){
        allClients.save(function(err){
          if(err) throw err;
          AdminLogs({
            record: "Admin deleted client "+clients,
            createdDate: d
          }).save(function(err){
            if(err) throw err;
            res.redirect('/admin');
          });
        });
      }
      
    } else {
      res.redirect('/admin');
    }

  } else {
    res.redirect('/admin');
  }
});

/*
'userid' id the _id of employee
'manaer' is the _id of the manager to be associated to
'f' is the call back function
*/
function changeAssociation(req,res,userid,manager,d,f){
    if(adminStatus(req)){

    User.findOne({_id:userid} , function(err,user){
      /* This if condition is true if the new manager is same as the old manager */
      if(user.connectedTo[0] == manager) {
        f();
        return;
      } else { /* This else runs if the new manager is different from old manager */
        
        User.findOne({_id:manager} , function(e,newM){
          /* This if condition is true if the Employee is not associated to any Manager */
          if(!user.connectedTo.length){
            
            /* Associations are created here */
            user.connectedTo.push(manager);
            newM.connectedTo.push(user._id);

            user.save(function(e1){
              if(e1) console.log("LOL1", e1);
              
              newM.save(function(e3){
                if(e3) console.log("LOL2", e3);
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
                if(e1) console.log("LOL3", e1);
                
                oldM.save(function(e2){
                  if(e2) console.log("LOL4", e2);
                  
                  newM.save(function(e3){
                    if(e3) console.log("LOL5", e3);
                  
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
            f();
          });
        });
        
      }
    });

  } else {
    res.redirect('/admin');
  }

}


/* To change association of the employee */
router.post('/changeAsso' , function(req,res){

  var userid = req.body.userid;
  var manager = req.body.manager;
  var d = new Date();

  changeAssociation(req,res,userid,manager,d,function(){res.send("1");});

});




/*To change association using a .csv file*/
router.post('/changeAssociationFile',multer({ dest: 'uploads/' }).single('associationFile'),function(req,res){

  if(req.file){
    var d = new Date();
    fs.rename(req.file.path, 'uploads/buffer.csv', function(err){
      if (err) console.log(err);
        
      var pos,len;

      function batchAssociation(data,pos,callback){

        eName = data[pos][0];
        eEmail = data[pos][1];
        mName = data[pos][2];
        mEmail = data[pos][3];
          
        if(mName && mEmail){

          User.findOne({email:mEmail} , function(err,mUser){
            User.findOne({email:eEmail} , function(err,eUser){
                  
              if(eUser && mUser){ 
                  
                changeAssociation(req,res,eUser._id,mUser._id,d,function(){
                  if(pos==data.length-1){
                    res.redirect('/admin');
                    return;
                  }
                  callback();
                });
                  
              } else if(eUser && !mUser){ 
                  
                createUser.createManager(mName,mEmail,function(){
                    
                  User.findOne({email:mEmail},function(err,nmUser){
                    changeAssociation(req,res,eUser._id,nmUser._id,d,function(){
                      if(pos==data.length-1){
                        res.redirect('/admin');
                        return;
                      }
                      callback();
                    });
                  });

                });
                  
              } else if (!eUser) { 
                  
                createUser.createEmployee(eName,eEmail,mName,mEmail,function(){
                  if(pos==data.length-1){
                    res.redirect('/admin');
                    return;
                  }
                  callback();
                });
                  
              } 

            });
          });

        }

      }
  /*End of function*/

      pos = -1;

      var inputFile='uploads/buffer.csv';
      var flag;
      var parser = parse({delimiter: ','}, function (err, data) {
        async.eachSeries(data, function (line, callback) {

          pos++;

          flag = 0;
          for (i = 0; i < data[pos].length; i++) {
            if(data[pos][i]) flag ++;
          };
          if(flag){
            batchAssociation(data,pos,callback);
          } else {
            callback();
          }

        });
      });

      fs.createReadStream(inputFile).pipe(parser);

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

    User.findOne({email:{ $regex : new RegExp(req.body.email, "i") }} , function(err,user){

      if(!user){

        var manager = req.body.manager;
        var email = req.body.email;
        var d = new Date();

        /* The new employee is saved here */
        User({
          name:req.body.name,
          email:req.body.email,
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

  } else {
    res.send(false);
  }
});

/* To add a manager */
router.post('/addManager',function(req,res){
  if(adminStatus(req)){

    User.findOne({email:{ $regex : new RegExp(req.body.email, "i") }} , function(err,user){

      if(!user){

        var d = new Date();

        /* New manager is saved here */
        User({
          name:req.body.name,
          email:req.body.email,
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

/* To download the example .csv file to be used */
router.get('/exampleCSV',function(req,res){
  res.download('public/files/example.csv', 'example.csv', function(err){
        if (err) throw err;
      });
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