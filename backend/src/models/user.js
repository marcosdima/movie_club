const mongoose = require('mongoose');

const userScheme = mongoose.Schema({
    name: String,
    lastname: String,
    username: {
		type: String,
		required: true,
        unique: true
	},
    password: {
		type: String,
		required: true,
	},
	groups: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Group',
			unique: true
		}
	]
});

userScheme.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	}
});

module.exports = mongoose.model('User', userScheme);