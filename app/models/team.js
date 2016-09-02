var mongoose = require('mongoose');

var teamSchema = mongoose.Schema({
	captain_id: {
		type: String,
		label: "Captain",
	},
	co_captains: {
		type: [String],
		label: "Co- captain",
	},
	team_name: {
		type: String,
		label: "Team Name",
		max: 100,
	},
	team_description: {
		type: String,
		label: "Team Description",
		optional:true
	},
	city: {
		type: String,
		label: "City",
		max: 100,
	},
	province: {
		type: String,
		label: "Province",
		max: 25,
	},
	country: {
		type: String,
		label: "Country",
		max: 25,
	},
	latitude: {
		type: String,
		label: "Latitude",
		optional: true
	},
	longitude: {
		type: String,
		label: "Longitude",
		optional: true
	},
	sponsor: {
		type: String,
		label: "Sponsor/Organization Name",
		optional: true
	},
	classes: {
		type: [String],
		label: "Classes"
	},
	divisions: {
		type: [String],
		label: "Divisions"
	},
	class_divisions:{
		type: [],
	},
	website_url: {
		type: String,
		optional: true,
		label: "Website Address"
	},
	phone_number: {
		type: String,
		optional: true,
		label: "Phone Number"
	},
	email:{
		type: String,
		optional: true,
		label: "Email"
	},
	facebook_page_url: {
		type: String,
		optional: true,
		label: "Facebook Page Address"
	},
	twitter_handle: {
		type: String,
		optional: true,
		label: "Twitter Handle"
	},
	youtube_link: {
		type: String,
		optional: true,
		label: "Youtube link"
	},
	logo_url: {
		type: String,
		optional: true,
		label: "Logo"
	},
	cover_picture_url: {
		type: String,
		optional: true,
		label: "Background Image"
	},
	created_at: {
		type: Date,
		defaultValue: new Date()
	},
	recruit: {
		type: Number,
		defaultValue: 0,
		label: "1 - recruiting"
	},
	slug: {
		type:String,
		unique: true,
		optional: true,
		label:"URL slug"
	},
	active: {
		type: Number,
		label: "1-active, 9-deleted",
		defaultValue: 1
	}
});
var Team = mongoose.model('Team', teamSchema);
var addTeam = new Team({ team_name: 'Node Team' });
addTeam.save();
module.exports = Team;