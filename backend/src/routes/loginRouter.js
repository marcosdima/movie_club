const loginRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body;
  if (!password || !username) return res.status(400).json({ error: "missing fields" });

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'user does not exists' });

  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash);
	
  if (!(user && passwordCorrect)) 
    return res.status(401).json({ error: 'invalid username or password' });

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(
    userForToken,
    process.env.SECRET,
    { expiresIn: 30000 } // Time in miliseconds...
  );

  res.status(200).send({
    token, 
    username: user.username, 
    name: user.name , 
    id: user._id.toString()
  });
});

module.exports = loginRouter;