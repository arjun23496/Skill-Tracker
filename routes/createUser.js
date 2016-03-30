var User = require('../models/User.js');

router = {
  
  /*Creating manager*/
  createManager: function(name,email,f){
    User.findOne({email:email} , function(err,user){
    if(user){ 
      f();
    } else { 

      User({

        name: name,
        email: email ,
        isManager: 1,
        Updated:0

        }).save(function(err){
        if(err) throw err;

        f();
      });

    }
  });
  } ,

  /*Creating employee*/
  createEmployee: function(name,email,mname,memail,f){
    User.findOne({email:email} , function(err,user){

      if(user){ // if employee exists
        f();
      } else { // if employee doesnot exist

        User({

          name: name,
          email: email ,
          isManager: 0,
          Updated:0

          }).save(function(err){
          if(err) throw err;

          User.findOne({email:email},function(err,eUser){

            User.findOne({email:memail},function(err,mUser){

              if(mUser){ // if the manager exists

                // connections
                mUser.connectedTo.push(eUser._id);
                mUser.save(function(err){
                  if(err) throw err;
                  
                  eUser.connectedTo.push(mUser._id);
                  eUser.save(function(err){
                    if(err) throw err;

                    f();

                  });
                });

              } else { // if manager doesnot exist

                User({

                    name: mname,
                    email: memail ,
                    isManager: 1,
                    Updated:0

                    }).save(function(err){
                    if(err) throw err;

                    User.findOne({email:memail},function(err,nmUser){

                      // connections
                      nmUser.connectedTo.push(eUser._id);
                      nmUser.save(function(err){
                        if(err) throw err;

                        eUser.connectedTo.push(nmUser._id);
                        eUser.save(function(err){
                          if(err) throw err;

                          f();

                        });
                      });

                    });
                    
                  });

              }

            });

          });

        });

      }
    });
  }
          
}

module.exports = router;