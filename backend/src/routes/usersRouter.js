const usersRouter = require('express').Router();
const usersService = require('../services/usersService');
const bcrypt = require('bcrypt');

usersRouter.get('/', async (req, res) => {
  const users = await usersService.getUsers();
  res.json(users);
});

usersRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "missing id" });

  const user = await usersService.getUser(id);
  if (!id) return res.status(404).json({ error: "user does not exist" });

  res.json(user);
});


usersRouter.post('/', async (req, res) => {
  const { password, username, name, lastname } = req.body;
  if (!password || !username || !name || !lastname) return res.status(400).json({ error: "missing fields" });

  // TODO: Research about the salt rounds...
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  if (!passwordHash) return res.status(401).json({ error: "wrong username or password" });

  const newUser = await usersService.addUser({
    username, name, lastname, passwordHash 
  });
  res.status(201).json(newUser);
});

module.exports = usersRouter;