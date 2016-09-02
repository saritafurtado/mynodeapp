var mongoose = require('mongoose');

var teamMembersSchema = mongoose.Schema({
	team_id: {
		type: String,
		label: "Team",
	},
	member_id: {
		type: String,
		label: "Memeber",
		optional: true
	},
	member_name: {
		type: String,
		label: "Member Name",
		optional: true
	},
	request_status: {
		type: Number,
		label: "1-Pending, 2 - Accepted/Joined 3 - Declined ",
	},
	inviters_id: {
		type: String,
		label: "Inviter/Captain/Co-captain",
		optional: true
	},
	email: {
		type: String,
		optional: true
	},
	message:{
		type:String,
		optional:true
	},
	date: {
		type: Date,
		optional: true
	},
	accepted_date: {
		type: Date,
		optional: true
	},
	active: {
		type: Number,
		label: "1-active, 9-deleted, 7- Super Admin deleted",
		defaultValue: 1
	},
});
var teamMembers = mongoose.model('teamMembers', teamMembersSchema);
module.exports = teamMembers;