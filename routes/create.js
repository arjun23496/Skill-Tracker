/*
To fill the initial data in the database for testing
*/

/*
Before going through the codes 
Please go through the Schema of how the 1.Users 2.Skills 3.Logs are stored in ../models
*/

var express = require('express');
var router = express.Router();
var User = require('../models/User.js');
var Skills = require('../models/Skills.js');
var Certification = require('../models/Certification.js');
var Client = require('../models/Client.js');
var obj = require('./obj');

/* This is to feed the data in the database */
/* Database name = myappdatabase */

router.get('/', function(req, res, next) {

/* All the temporary data which can be changed later */
	var users = [

	{
		name: "Manager1",
		email: "manager1@email.com" ,
		password: obj.hash("manager1"),
		isManager: 1,
		connectedTo: [] ,
		Updated:0
	},

	{
		name: "Manager2",
		email: "manager2@email.com" ,
		password: obj.hash("manager2"),
		isManager: 1,
		connectedTo: [],
		Updated:0
	},

	{
		"name":"Employee1",
		"email":"employee1@email.com",
		"isManager":false,
		"Updated":false,"__v":6,
		"Updates":[],
		"clients":[],
		"certificates":[],
		"sessionSkills":[],
		"skills":[{"role":"Management","skillName":"Resource","skillType":"Employee Manage","level":"Beginner","exp":"4","createdDate":"2016-04-05T06:48:44.609Z","_id":"57035fccd66e2a250e5b52c4"},{"role":"Developer","skillName":"Testing","skillType":"Manual","level":"Beginner","exp":"4","createdDate":"2016-04-05T06:48:55.574Z","_id":"57035fd7d66e2a250e5b52c8"},{"role":"Developer","skillName":"Coding","skillType":"Java","level":"Intermediate","exp":"5","createdDate":"2016-04-05T06:49:07.568Z","_id":"57035fe3d66e2a250e5b52cc"},{"role":"Developer","skillName":"Coding","skillType":"C#","level":"Beginner","exp":"9","createdDate":"2016-04-05T06:49:27.852Z","_id":"57035ff7d66e2a250e5b52d0"},{"role":"Management","skillName":"Customer Handling","skillType":"Client Success","level":"Intermediate","exp":"2","createdDate":"2016-04-05T06:49:41.089Z","_id":"57036005d66e2a250e5b52d4"}],
		"connectedTo":[]
	},

	{
		name: "Employee2",
		email: "employee2@email.com" ,
		password: obj.hash("employee2"),
		isManager: 0,
		connectedTo: [],
		Updated:0
		
	},

	{
		name: "Employee3",
		email: "employee3@email.com" ,
		password: obj.hash("employee3"),
		isManager: 0,
		connectedTo: [],
		Updated:0

	},

	{
		name: "Employee4",
		email: "employee4@email.com" ,
		password: obj.hash("employee4"),
		isManager: 0,
		connectedTo: [],
		Updated:0
	}
	] ;

	var newUser;
	for (i = 0; i< users.length; i++) {
		/* Creating every user one by one */
		newUser = User( users[i] );

		newUser.save(function(err){
			if(err) throw err;

			console.log("user created");
		});
	};

res.redirect('/create/changes');
	

});

/*
This is to create the associations

Employee1 -> Manager1
Employee2 -> Manager1
Employee3 -> Manager2
Employee4 -> Manager2

*/
router.get('/changes',function(req,res){
	User.findOne({email:"manager1@email.com"} , function(err,m1){
		User.findOne({email:"manager2@email.com"} , function(err,m2){
			User.findOne({email:"employee1@email.com"} , function(err,e1){
				User.findOne({email:"employee2@email.com"} , function(err,e2){
					User.findOne({email:"employee3@email.com"} , function(err,e3){
						User.findOne({email:"employee4@email.com"} , function(err,e4){


							/* This is to set the .connectedTo field of email with the _id of connected people */

							m1.connectedTo.push(e1._id);
							m1.connectedTo.push(e2._id);
							m2.connectedTo.push(e3._id);
							m2.connectedTo.push(e4._id);
							e1.connectedTo.push(m1._id);
							e2.connectedTo.push(m1._id);
							e3.connectedTo.push(m2._id);
							e4.connectedTo.push(m2._id);

							m1.save(function(err){
								if(err) throw err;
								m2.save(function(err){
									if(err) throw err;
									e1.save(function(err){
										if(err) throw err;
										e2.save(function(err){
											if(err) throw err;
											e3.save(function(err){
												if(err) throw err;
												e4.save(function(err){
													if(err) throw err;
													console.log("done");
													res.redirect('/create/skills');
												});
											});
										});
									});
								});
							});
							
						});
					});
				});
			});
		});
	});
});

/* To create all the initial skills */
router.get('/skills',function(req,res){

	var s = [
	{
		role:"Developer",
		name:[
			{
				skillName: "Coding",
				skillType: ["Java","C#"]
			},
			{
				skillName:"Testing",
				skillType: ["Manual","Selinium"]
			}
		]
	},
	{
		role:"Management",
		name:[
			{
				skillName: "Resource",
				skillType: ["Employee Manage","Project Handling"]
			},
			{
				skillName:"Customer Handling",
				skillType: ["Client Success","Client Relationship"]
			}
		]
	}
	] ;

	var newSkill;
	for (i = 0; i< s.length; i++) {
		/* Creating every user one by one */
		newSkill = Skills( s[i] );

		newSkill.save(function(err){
			if(err) throw err;

			console.log("Skill created");
		});
	};

	res.redirect('/create/certificates');

});


router.get('/certificates',function(req,res){

	Certification({data:["Java","SI","Oracle","C","C++","JavaScript","MySQL","MongoDB"]}).save(function(err){if(err) throw err;res.redirect('/create/clients');});

});

router.get('/clients',function(req,res){

	Client({data:["Nike","Adidas","ITC","Titan","Puma","Red Bull"]}).save(function(err){if(err) throw err;res.redirect('/');});

});

module.exports = router;
