const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper')
const Movie = require('../models/movie');
const User = require('../models/user');
const Group = require('../models/group');
const Activity = require('../models/activity');
const Invitation = require('../models/invitation');

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
    describe.only("Users...", () => {
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
        describe("Get users...", () => {
            let rootId;
            beforeEach(async () => {
                await User.deleteMany({});
                const { id } = await post('users', helper.rootData())
                await post('users', helper.auxUserData())
                rootId = id;
            });
            test("Get all...", async () => {
                const { length } = await get("users");
                expect(length).toBe(2);
            });
            test("Get one...", async () => {
                const { username } = await get(`users/${rootId}`);
                const { username: rootName } = helper.rootData();
                expect(username).toBe(rootName);
            });
        })
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
        let rootToken;
        let rootId;
        let auxUserId;
        beforeEach(async () => {
            await User.deleteMany({});
            await Movie.deleteMany({});
            const { username, password } = helper.rootData();
            const { id } = await post('users', helper.rootData())
            const { id: idAux } = await post('users', helper.auxUserData())
            const { token } = await post('login', { username, password }, { expectedStatus: 200 });
            rootToken = token;
            rootId = id;
            auxUserId = idAux;
        });
        describe("Movies functions...", () => {
            describe("Movies creation...", () => {
                test('Create a movie...', async () => {
                    const [movie] = helper.exampleMovies();
                    await post('movies', { movie }, { token: rootToken })
                });
                test('Create a movie without login', async () => {
                    const [movie] = helper.exampleMovies();
                    await post('movies', { movie }, { expectedStatus: 401 })
                });
                test('Create several movies...', async () => {
                    const movies = helper.exampleMovies();
                    await post('movies/many', { movies }, { token: rootToken });
                })
                test('Create several movies without login', async () => {
                    const movies = helper.exampleMovies();
                    await post('movies/many', { movies }, { expectedStatus: 401 });
                });
            });
            describe("Getting movies...", () => {
                beforeEach(async () => {
                    const movies = helper.exampleMovies();
                    await post('movies/many', { movies }, { token: rootToken });
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
                    const  { name: newGroupName } = await post('groups', { groupName }, { token: rootToken });
                    expect(newGroupName).toBe(groupName);
                });
                test("with no data.", async () => {
                    await post('groups', {}, { token: rootToken, expectedStatus: 400 });
                });
                test("with no token.", async () => {
                    await post('groups',  { groupName: 'A' }, { expectedStatus: 401 });
                });
            });
        });
        describe("Activity functions...", () => {
            let groupId;
            let movieId;
            const groupName = 'Group Name'
            beforeEach(async () => {
                await Group.deleteMany({});
                await Movie.deleteMany({});
                await Activity.deleteMany({});
                const [movieExample] = helper.exampleMovies()
                const { id: groupIdQuery } = await post('groups', { groupName }, { token: rootToken });
                const { id: movieIdQuery } = await post('movies', { movie: movieExample }, { token: rootToken });
                groupId = groupIdQuery;
                movieId = movieIdQuery;
            });
            describe("Create an activity...", () => {
                test("with the right data.", async () => {
                    const { movie: movieIdQuery, group: groupIdQuery } = await post(
                        'activities', 
                        { movieId, groupId }, 
                        { token: rootToken }
                    );
                    expect(movieIdQuery).toBe(movieId);
                    expect(groupIdQuery).toBe(groupId);
                });
                test("with the wrong data.", async () => {
                    await post(
                        'activities', 
                        { movieId: "", groupId: "" }, 
                        { token: rootToken, expectedStatus: 400 }
                    );

                });
                test("with no data.", async () => {
                    await post(
                        'activities', 
                        {}, 
                        { token: rootToken, expectedStatus: 400 }
                    );
                });
                test("Test group history update...", async () => {
                    const { history } = await get(`groups/${groupId}`, { token: rootToken });
                    expect(history.length).toBe(0);
                    await post(
                        'activities', 
                        { movieId, groupId }, 
                        { token: rootToken }
                    );
                    const { history: historyAfterCreation } = await get(`groups/${groupId}`, { token: rootToken });
                    console.log(historyAfterCreation)
                    expect(historyAfterCreation.length).toBe(1);
                });
            });
        });
        describe("Invitations...", () => {
            let groupId;
            beforeEach(async () => {
                await Group.deleteMany({});
                await Invitation.deleteMany({});
                const { id: groupIdQuery } = await post('groups', { groupName: 'Group Name' }, { token: rootToken });
                groupId = groupIdQuery;
            });
            describe("Create an invitation...", () => {
                test("with the right data...", async () => {
                    const { group, accepted } = await post('invitations', { to: auxUserId, groupId }, { token: rootToken })
                    expect(group).toBe(groupId);
                    const { length } = await Invitation.find({});
                    expect(length).toBe(1);
                    expect(accepted).toBe(null);
                });
                test("with no token...", async () => {
                    await post('invitations', { to: auxUserId, groupId }, { expectedStatus: 401 })
                    const { length } = await Invitation.find({});
                    expect(length).toBe(0);
                });
                test("with no data...", async () => {
                    await post('invitations', {}, { token: rootToken, expectedStatus: 400 })
                    const { length } = await Invitation.find({});
                    expect(length).toBe(0);
                });
                test("with the right data, but already exists an invitation...", async () => {
                    await post('invitations', { to: auxUserId, groupId }, { token: rootToken })
                    const { length } = await Invitation.find({});
                    expect(length).toBe(1)
                    await post('invitations', { to: auxUserId, groupId }, { token: rootToken, expectedStatus: 409 })
                    const { length: lengthPost } = await Invitation.find({});
                    expect(lengthPost).toBe(1)
                });
            });
        })
    });
});

afterAll(() => {
	mongoose.connection.close();
});