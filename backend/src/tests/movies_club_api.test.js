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
            const { _body: {id} } = await api
                .post('/api/users')
                .send(helper.rootData())
                .expect(201);
            const { _body: { token }  } = await api
                .post('/api/login')
                .send({ username, password });
            helper.setToken(token);
            helper.setId(id);
        });
        describe("Movies creation...", () => {
            test('Create a movie...', async () => {
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
            test('Create several movies...', async () => {
                const movies = helper.exampleMovies();
                await api
                    .post("/api/movies/many")
                    .send({ movies })
                    .set('Authorization', `Bearer ${helper.getToken()}`) 
                    .expect(201);
            })
            test('Create several movies without login', async () => {
                const movies = helper.exampleMovies();
                await api
                    .post("/api/movies/many")
                    .send({ movies })
                    .set('Authorization', 'Bearer notoken') 
                    .expect(401);
            });
        });
        describe("Getting movies...", () => {
            beforeEach(async () => {
                const movies = helper.exampleMovies();
                await api
                    .post("/api/movies/many")
                    .send({ movies })
                    .set('Authorization', `Bearer ${helper.getToken()}`) 
                    .expect(201);
            });
            test("All movies...", async () => {
                const movies = helper.exampleMovies();
                const { _body: moviesQuery } = await api
                    .get("/api/movies")
                    .expect(200);
                const queryWithNoId = moviesQuery.map((movie) => {
                    const { id, ...rest } = movie;
                    return rest;
                });
                expect(queryWithNoId).toEqual(expect.arrayContaining(movies));
            });
            test("A movie...", async () => {
                const { _body: [movie] } = await api
                    .get("/api/movies")
                    .expect(200);
                const { _body: movieQuery } = await api
                    .get(`/api/movies/${movie.id}`)
                    .expect(200);   
                expect(movieQuery).toEqual(movie);
            });
        });
    });
});

afterAll(() => {
	mongoose.connection.close();
});