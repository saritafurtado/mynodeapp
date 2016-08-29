var mongoose = require('mongoose');

var divisionSchema = mongoose.Schema({
	div_name: {
		type: String,
	}, 
	value: {
		type: String,
		unique: true
	}, 
	tags: {
		type: String,
		// unique: true		
	},
	order:{
		type: Number,
		optional: true
	}
});

module.exports = mongoose.model('Division', divisionSchema);