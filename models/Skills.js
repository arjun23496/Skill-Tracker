var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/*
A single entry has a unique ROLE
name: has the SKILL NAME and an array of SKILL TYPE related to that SKILL NAME and ROLE
You can find an example at the end
*/

var skillSchema = new Schema({

	role: String ,

	name: [Schema.Types.Mixed]
	

});

var Skills = mongoose.model( 'Skills' , skillSchema );

module.exports = Skills;

/*
An example of how the skills are stored
This is a single entry for the aboveschema

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
	}

*/
