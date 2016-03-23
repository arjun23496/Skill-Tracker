var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var userSchema = new Schema({

	name : String ,

	email : { type:String , required:true , unique:true },

	password : { type: String , required:true },

	/* 
	isManager:
	'1' if the user is a manager 
	'0' if the user is an employee
	*/
	isManager: Boolean,

	/*
	connectedTo:
	For manager the _id of the connected employees are stored
	For employees the _id his manager will be stored
	*/
	connectedTo : [{type : String}] ,

	/* To store the array of skills. Used only for employees */
	skills: [{

		role: String ,

		skillName: String ,

		skillType : String,

		level : String ,

		createdDate: Date

	}] ,

	sessionSkills: [{

		role: String ,

		skillName: String ,

		skillType : String,

		level : String ,

	}] ,

	/*
	Updated:
	'1' if the user has new notifications
	'0' if the user has no new notifications
	*/
	Updated: Boolean,

	Updates: [{
		/* The text int the notification */
		notify : String,

		/* '1' if the notification is seen , '0' if not seen */
		seen : Boolean,

		/* Time/Date when the corresponding event happened */
		createdDate: Date
	}] 

});

var User = mongoose.model( 'User' , userSchema );

module.exports = User;
