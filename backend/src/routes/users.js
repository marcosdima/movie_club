const usersRouter = require('express').Router();
const usersService = require('../services/usersService');

usersRouter.get('/', async (req, res) => {
    const users = await usersService.getUsers();
    res.json(users);
})

usersRouter.post('/', async (req, res) => {
    const newUser = await usersService.addUser(req.body)
    res.json(newUser);
})

module.exports = usersRouter