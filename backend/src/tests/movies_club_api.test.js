const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper')
const Movie = require('../models/movie');
const User = require('../models/user');
const Group = require('../models/group');

const api = supertest(app);

const post = async (route, objectToSend, options={}) => {
    const { token, expectedStatus } = options;
    const { _body: result } = await api
        .post(`/api/${route}`)
        .send(objectToSend)
        .set('Authorization', `Bearer ${token}`)
        .expect(expectedStatus ?? 201);
    return result;
}

const get = async (route, options={}) => {
    const { token, expectedStatus } = options;
    const { _body: result } = await api
        .get(`/api/${route}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(expectedStatus ?? 200);
    return result;
}

describe('API Test...', () => {
    describe("Create an user...", () => {
        beforeEach(async () => {
            await User.deleteMany({});
        });
        test("With the right data...", async () => {
            await post('users', helper.rootData());
        });
        test("With no data at all...", async () => {
            await post('users', {}, { expectedStatus: 400 });
        });
    });
    describe("Login...", () => {
        beforeEach(async () => {
            await User.deleteMany({});
            await post('users', helper.rootData());
        });
        test("Login with the right data...", async () => {
            const { username, password } = helper.rootData();
            await post('login', { username, password }, { expectedStatus: 200 });
        });
        test("Login with the wrong data...", async () => {
            const { username, password } = helper.rootData();
            await post('login', { username: 'random', password: "123" }, { expectedStatus: 401 });
        });
        test("Login with no data...", async () => {
            await post('login', {}, { expectedStatus: 400 });
        });
    });
    describe("Activities with login required...", () => {
        let userToken;
        beforeEach(async () => {
            await User.deleteMany({});
            await Movie.deleteMany({});
            const { username, password } = helper.rootData();
            await post('users', helper.rootData())
            const { token } = await post('login', { username, password }, { expectedStatus: 200 });
            userToken = token;
        });
        describe("Movies functions...", () => {
            describe("Movies creation...", () => {
                test('Create a movie...', async () => {
                    const [movie] = helper.exampleMovies();
                    await post('movies', { movie }, { token: userToken })
                });
                test('Create a movie without login', async () => {
                    const [movie] = helper.exampleMovies();
                    await post('movies', { movie }, { expectedStatus: 401 })
                });
                test('Create several movies...', async () => {
                    const movies = helper.exampleMovies();
                    await post('movies/many', { movies }, { token: userToken });
                })
                test('Create several movies without login', async () => {
                    const movies = helper.exampleMovies();
                    await post('movies/many', { movies }, { expectedStatus: 401 });
                });
            });
            describe("Getting movies...", () => {
                beforeEach(async () => {
                    const movies = helper.exampleMovies();
                    await post('movies/many', { movies }, { token: userToken });
                });
                test("All movies...", async () => {
                    const movies = helper.exampleMovies();
                    const moviesQuery = await get('movies');
                    // 'movies' doesn't have a property 'id', so to check if are the same I'll remove it from the query.
                    const queryWithNoId = moviesQuery.map(({ id, ...rest }) => rest);
                    expect(queryWithNoId).toEqual(expect.arrayContaining(movies));
                });
                test("A movie...", async () => {
                    const [movie] = await get('movies');
                    const movieQuery = await get(`movies/${movie.id}`);
                    expect(movieQuery).toEqual(movie);
                });
            });
        });       
        describe("Groups functions...", () => {
            beforeEach(async () => {
                await Group.deleteMany({});
            });
            describe("Creating a new group...", () => {
                test("with the right data.", async () => {
                    const groupName = 'Testers';
                    const  { name: newGroupName } = await post('groups', { groupName }, { token: userToken });
                    expect(newGroupName).toBe(groupName);
                });
                test("with no data.", async () => {
                    await post('groups', {}, { token: userToken, expectedStatus: 400 });
                });
                test("with no token.", async () => {
                    await post('groups',  { groupName: 'A' }, { expectedStatus: 401 });
                });
            });
        });
    });
});

afterAll(() => {
	mongoose.connection.close();
});