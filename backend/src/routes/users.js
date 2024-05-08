const usersRouter = require('express').Router();
const usersService = require('../services/usersService');
const bcrypt = require('bcrypt');

usersRouter.get('/', async (req, res) => {
    const users = await usersService.getUsers();
    res.json(users);
});

usersRouter.post('/', async (req, res) => {
    const { password } = req.body;

    // TODO: Research about the salt rounds...
    const saltRounds = 10;
	const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await usersService.addUser({ ...req.body, passwordHash });
    res.status(201).json(newUser);
});

module.exports = usersRouter;