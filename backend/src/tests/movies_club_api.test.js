const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper')
const Movie = require('../models/movie');
const User = require('../models/user');

const api = supertest(app);

describe('API Test...', () => {
    describe("Create an user...", () => {
        beforeEach(async () => {
            await User.deleteMany({});
        });
        test("With the right data...", async () => {
            await api
                .post('/api/users')
                .send(helper.rootData())
                .expect(201);
        });
        test("With no data at all...", async () => {
            await api
                .post('/api/users')
                .send({})
                .expect(400);
        });
    });
    describe("Login...", () => {
        beforeEach(async () => {
            await User.deleteMany({});
            await api
                .post('/api/users')
                .send(helper.rootData());
        });
        test("Login with the right data...", async () => {
            const { username, password } = helper.rootData();
            await api
                .post('/api/login')
                .send({ username, password })
                .expect(200);
        });
        test("Login with the wrong data...", async () => {
            const { username, password } = helper.rootData();
            await api
                .post('/api/login')
                .send({ username: "random", password:"password" })
                .expect(401);
        });
        test("Login with no data...", async () => {
            await api
                .post('/api/login')
                .send({})
                .expect(400);
        });
    });
    describe("Activities with login required...", () => {
        beforeEach(async () => {
            await User.deleteMany({});
            await Movie.deleteMany({});
            const { username, password } = helper.rootData();
            await api
                .post('/api/users')
                .send(helper.rootData())
                .expect(201);
            const { _body: { token }  } = await api
                .post('/api/login')
                .send({ username, password });
            helper.setToken(token);
        });
        describe("Movies creation...", () => {
            test('Create a movie', async () => {
                const [movie] = helper.exampleMovies();
                await api
                    .post("/api/movies")
                    .send({ movie })
                    .set('Authorization', `Bearer ${helper.getToken()}`) 
                    .expect(201);
            });
            test('Create a movie without login', async () => {
                const [movie] = helper.exampleMovies();
                await api
                    .post("/api/movies")
                    .send({ movie })
                    .set('Authorization', 'Bearer notoken') 
                    .expect(401);
            });
        });
    });
});

afterAll(() => {
	mongoose.connection.close();
});