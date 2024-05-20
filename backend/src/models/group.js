const mongoose = require('mongoose');

const groupScheme = mongoose.Schema({
  name: String,
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  history: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
    }
  ]
});

groupScheme.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Group', groupScheme);