var mongoose = require('mongoose');

var activitySchema = mongoose.Schema({

    name        : String,
    value     : String,

});

module.exports = mongoose.model('Activity', activitySchema);
/*var addActivity = new Activity({ name: 'Paddler', value: 'Paddling' });
addActivity.save();*/
//module.exports  = Activity;
