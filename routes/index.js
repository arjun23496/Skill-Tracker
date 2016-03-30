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
var AdminLogs = require('../models/AdminLogs.js');
var Skills = require('../models/Skills.js');
var Certification = require('../models/Certification.js');
var Client = require('../models/Client.js');
var obj = require('./obj');
var createUser = require('./createUser');
var fs = require('fs');
var csv = require("fast-csv");

router.post('/test',function(req,res){

  res.send(req.body.cer);

});






router.get('/', function(req, res, next) {

  var email = obj.siStatus(req,obj,obj.cookieKey);

  /* If the cookie 'user' exists , the user will be redirected to /user */
  if(email){
    res.redirect('/user');
  }
  else{
    res.render('index');
  }

});

/* This block is to validate the Login event */
router.post('/login',function(req,res,next){
  var email = req.body.email;

  User.findOne({email:email} , function(err,user){
    if(!user){
      res.send("Invalid credentials");
    }
    else{

      var c = obj.encrypt(user.email , obj.cookieKey);
      res.cookie('user' , c , {signed:true});

      if(user.sessionSkills.length){
        user.sessionSkills.splice(0,user.sessionSkills.length);
           user.save(function(err){
             if(err) throw err;
          res.redirect('/user');
      });
           
      } else {
        res.redirect('/user');
      }
    }
    
  });

});


/*
URL for a manager
Ex:
http://localhost:3000/m/Manager1/manager1@email.com
*/
router.get('/m/:name/:email' , function(req,res){

  var name = req.params.name;
  var email = req.params.email;
  if(name && email){
    createUser.createManager(name,email,function(){
      res.cookie('user',obj.encrypt(email,obj.cookieKey) , {signed:true});
      res.redirect('/user');
    });
  } else {
    res.redirect('/');
  }
 
})

/*
URL for an employee
Ex:
http://localhost:3000/e/Employee1/employee1@email.com/Manager1/manager1@email.com
*/
router.get('/e/:name/:email/:mname/:memail',function(req,res){

  var name = req.params.name;
  var email = req.params.email;
  var mname = req.params.mname;
  var memail = req.params.memail;

  if(name && email && mname && memail){
    createUser.createEmployee(name,email,mname,memail,function(){

      User.findOne({email:email} , function(err,user){

        if(user.sessionSkills.length){
          user.sessionSkills.splice(0,user.sessionSkills.length);
             user.save(function(err){
               if(err) throw err;
            res.cookie('user',obj.encrypt(email,obj.cookieKey) , {signed:true});
            res.redirect('/user');
          });
        } else {
          res.cookie('user',obj.encrypt(email,obj.cookieKey) , {signed:true});
          res.redirect('/user')
        }

      });
      
    });
  } else {
    res.redirect('/');
  }

  
});

/* To clear the 'user' cookie in the Logout event */
router.get('/logout',function(req,res,next){

  function session(req,res){
    if(req.query.sessionTimeout == "true"){
      res.send("1");
    } else {
      res.redirect('/');
    }
  }

  var email = obj.siStatus(req,obj,obj.cookieKey);

  User.findOne({email:email},function(err,user){
    if(user){

      if(user.sessionSkills.length){
        user.sessionSkills.splice(0,user.sessionSkills.length);
        user.save(function(err){
          if(err) throw err;
          res.clearCookie('user');
          session(req,res);
        });
     } else {
      res.clearCookie('user');
      session(req,res);
      }

    }
  });

});

/* To display the logs */
router.get('/logs',function(req,res,next){
  
  Logs.find({},function(err,logs){
    
    var str = "<a href='/downloadLogs' >Download last 200 logs</a><br><br>Last 50 logs<br><br>";

    /* Appends max of 50 logs to variable str */
    for(i=0;i<Math.min(logs.length,50);i++){
      str += logs[i].record+"<br>"+logs[i].createdDate+"<br><br>";
    }
    res.send(str);
    
  });
  
});

router.get('/adminlogs',function(req,res,next){
  
  AdminLogs.find({},function(err,logs){
    
    var str = "<a href='/downloadAdminLogs' >Download last 200 logs</a><br><br>Last 50 logs<br><br>";

    /* Appends max of 50 logs to variable str */
    for(i=0;i<Math.min(logs.length,50);i++){
      str += logs[i].record+"<br>"+logs[i].createdDate+"<br><br>";
    }
    res.send(str);
    
  });
  
});

/* To download the logs */
function downloadLogs(logs,res){
  var str = "";
    /* Appends max of 200 logs to variable str */
    for(i=0;i<Math.min(logs.length,200);i++){
      str += logs[i].record+"\n"+logs[i].createdDate+"\n\n";
    }

    /* Text file is created here */
    fs.writeFile("logs.txt", str, function(err) {
      if(err) {
        throw err;
      }
      /* Download response */
      res.download('logs.txt', 'logs.txt', function(err){
        if (err) {
          throw err;
        } 
        
        /* File is deleted once it is downloaded */
        fs.unlink('logs.txt', function(err) {
          if (err) {
            throw err;
          }
        });
        
      });
    }); 
}

/* For downloading the logs of activities Employees/Managers */
router.get('/downloadLogs',function(req,res,next){
  
  Logs.find({},function(err,logs){
      
    downloadLogs(logs,res);

  });
  
});

/* For downloading the logs of activities Admin */
router.get('/downloadAdminLogs',function(req,res,next){
  
  AdminLogs.find({},function(err,logs){
      
    downloadLogs(logs,res);

  });
  
});


/* To display the contents of all Users in Raw format */
router.get('/check' , function(req,res){

  User.find({} , function(err,users){
    if(err) res.send(err);

    res.send(users);
  });

});

/* To display all the skills in Raw format */
router.get('/skills' , function(req,res){

  Skills.find({} , function(err,skills){
    if(err) res.send(err);

    res.send(skills);
  });

});

router.get('/certificates' , function(req,res){

  Certification.find({} , function(err,c){
    if(err) res.send(err);

    res.send(c);
  });

});

router.get('/clients' , function(req,res){

  Client.find({} , function(err,c){
    if(err) res.send(err);

    res.send(c);
  });

});


/* To delete all the contents from the database. Both users and Logs */
router.get('/delete',function(req,res){
  User.remove({}, function(err, user) {
    if (err) throw err;

    Logs.remove({}, function(err) {
      if (err) throw err;
      
      Skills.remove({}, function(err) {
        if (err) throw err;
        
        AdminLogs.remove({}, function(err) {
          if (err) throw err;
          
          Certification.remove({}, function(err) {
            if (err) throw err;
            
            Client.remove({}, function(err) {
            if (err) throw err;
            
            res.redirect('/check');    
          });    
          });    
        });     
      });   
    });
  });
});

router.get('/reports',function(req,res){
  res.render('reports');
});

/* 
To send the status of 'user' cookie 
true if cookie doesnot exist
false if the cookie exist
*/
router.post('/cookieStatus',function(req,res){
  if(obj.siStatus(req,obj,obj.cookieKey)){
    res.send(false)
  } else {
    res.send("1");
  }
});
router.post('/adminCookieStatus',function(req,res){
  if(req.signedCookies.admin){
    res.send(false)
  } else {
    res.send("1");
  }
});


module.exports = router;
