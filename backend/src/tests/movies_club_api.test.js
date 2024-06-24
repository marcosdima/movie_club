const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper');
const Movie = require('../models/movie');
const User = require('../models/user');
const Group = require('../models/group');
const Activity = require('../models/activity');
const Invitation = require('../models/invitation');

// TODO: test getters.

const api = supertest(app);
jest.setTimeout(10000);

const post = async (route, objectToSend, options={}) => {
  const { token, expectedStatus } = options;
  const { _body: result } = await api
    .post(`/api/${route}`)
    .send(objectToSend)
    .set('Authorization', token ? `Bearer ${token}` : '')
    .expect(expectedStatus ?? 201);
  return result;
};

const get = async (route, options={}) => {
  const { token, expectedStatus } = options;
  const { _body: result } = await api
    .get(`/api/${route}`)
    .set('Authorization', token ? `Bearer ${token}` : '')
    .expect(expectedStatus ?? 200);
  return result;
};

const put = async (route, updatedObject, options={}) => {
  const { token, expectedStatus } = options;
  const { _body: result } = await api
    .put(`/api/${route}`)
    .send(updatedObject)
    .set('Authorization', token ? `Bearer ${token}` : '')
    .expect(expectedStatus ?? 200);
  return result;
};

const remove = async (route, options={}) => {
  const { token, expectedStatus } = options;
  const { _body: result } = await api
    .delete(`/api/${route}`)
    .set('Authorization', token ? `Bearer ${token}` : '')
    .expect(expectedStatus ?? 200);
  return result;
};

describe('API Test...', () => {
  describe("Users...", () => {
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
        const { id } = await post('users', helper.rootData());
        await post('users', helper.auxUserData());
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
    let rootToken;
    let auxUserToken;
    let rootId;
    let auxUserId;
    beforeEach(async () => {
      await User.deleteMany({});
      await Movie.deleteMany({});

      // Create the users...
      const { id } = await post('users', helper.rootData());
      const { id: idAux } = await post('users', helper.auxUserData());

      // Get the login data from the helper...
      const { username, password } = helper.rootData();
      const { username: auxUsername, password: auxPassword } = helper.auxUserData();

      // Get their tokens...
      const { token } = await post('login', { username, password }, { expectedStatus: 200 });
      const { token: auxToken } = await post('login', { username: auxUsername, password: auxPassword }, { expectedStatus: 200 });

      // Set the variables...
      rootToken = token;
      auxUserToken = auxToken;
      rootId = id;
      auxUserId = idAux;
    });
    describe("Movies functions...", () => {
      describe("Movies creation...", () => {
        test('Create a movie...', async () => {
          const [movie] = helper.exampleMovies();
          await post('movies', { movie }, { token: rootToken });
        });
        test('Create a movie without login', async () => {
          const [movie] = helper.exampleMovies();
          await post('movies', { movie }, { expectedStatus: 401 });
        });
        test('Create several movies...', async () => {
          const movies = helper.exampleMovies();
          await post('movies/many', { movies }, { token: rootToken });
        });
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
          const  { name: newGroupName, id } = await post('groups', { name: groupName }, { token: rootToken });
          expect(newGroupName).toBe(groupName);
          const { groups } = await get(`users/${rootId}`);
          expect(groups.includes(id)).toBe(true);
        });
        test("with no data.", async () => {
          await post('groups', {}, { token: rootToken, expectedStatus: 400 });
          const { groups } = await get(`users/${rootId}`);
          expect(groups.length).toBe(0);
        });
        test("with no token.", async () => {
          await post('groups',  { name: 'A' }, { expectedStatus: 401 });
          const { groups } = await get(`users/${rootId}`);
          expect(groups.length).toBe(0);
        });
      });
      describe("Leaving a group...", () => {
        let groupId;
        beforeEach(async () => {
          const groupName = 'Testers';
          const { id } = await post('groups', { name: groupName }, { token: rootToken });
          groupId = id;
        });
        test("you created.", async () => {
          await post(`groups/leave`, { groupId }, { token: rootToken });
          const groups = await get('groups', { token: rootToken });
          expect(groups.length).toBe(0);
          const user = await get(`users/${rootId}`, { token: rootToken });
          expect(user.groups.length).toBe(0);
        });
        test("you don't belong.", async () => {
          await post(`groups/leave`, { groupId }, { token: auxUserToken, expectedStatus: 403 });
        });
      });
    });
    describe("Activity functions...", () => {
      let groupId;
      let movieId;
      const groupName = 'Group Name';
      beforeEach(async () => {
        await Group.deleteMany({});
        await Movie.deleteMany({});
        await Activity.deleteMany({});
        const [movieExample] = helper.exampleMovies();
        const { id: groupIdQuery } = await post('groups', { name: groupName }, { token: rootToken });
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
        test("in a group you don't belong", async () => {
          await post(
            'activities', 
            { movieId, groupId }, 
            { token: auxUserToken, expectedStatus: 403 }
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

          expect(historyAfterCreation.length).toBe(1);
        });
      });
      describe("Update an activity...", () => {
        let activityId;
        beforeEach(async () => {
          const { id } = await post(
            'activities', 
            { movieId, groupId }, 
            { token: rootToken }
          );
          activityId = id;
        });
        test("user watched it...", async () => {
          const { watched } = await put(`activities/${activityId}/watched`, { groupId }, { token: rootToken });
          expect(watched.includes(rootId)).toBe(true);
        });
        test("user watched it... but it's not a valid activity id", async () => {
          await put(`activities/${groupId}/watched`, { groupId }, { token: rootToken, expectedStatus: 404 });
        });
        test("user watched it... but already marked it as watched...", async () => {
          const { watched } = await put(`activities/${activityId}/watched`, { groupId }, { token: rootToken });
          await put(`activities/${activityId}/watched`, { groupId }, { token: rootToken, expectedStatus: 403 });
        });
        test("usert watched it... but was a mistake!", async () => {
          await put(`activities/${activityId}/watched`, { groupId }, { token: rootToken });
          const { watched } = await put(`activities/${activityId}/unwatched`, { groupId }, { token: rootToken });
          expect(watched.includes(rootId)).toBe(false);
        });
      });
    });
    describe("Invitations...", () => {
      let groupId;
      beforeEach(async () => {
        await Group.deleteMany({});
        await Invitation.deleteMany({});
        const { id: groupIdQuery } = await post('groups', { name: 'Group Name' }, { token: rootToken });
        groupId = groupIdQuery;
      });
      describe("Create an invitation...", () => {
        test("with the right data...", async () => {
          const { group, accepted } = await post('invitations', { to: auxUserId, groupId }, { token: rootToken });
          expect(group).toBe(groupId);
          const { length } = await Invitation.find({});
          expect(length).toBe(1);
          expect(accepted).toBe(null);
        });
        test("with no token...", async () => {
          await post('invitations', { to: auxUserId, groupId }, { expectedStatus: 401 });
          const { length } = await Invitation.find({});
          expect(length).toBe(0);
        });
        test("with no data...", async () => {
          await post('invitations', {}, { token: rootToken, expectedStatus: 400 });
          const { length } = await Invitation.find({});
          expect(length).toBe(0);
        });
        test("with the right data, but already exists an invitation...", async () => {
          await post('invitations', { to: auxUserId, groupId }, { token: rootToken });
          const { length } = await Invitation.find({});
          expect(length).toBe(1);
          await post('invitations', { to: auxUserId, groupId }, { token: rootToken, expectedStatus: 409 });
          const { length: lengthPost } = await Invitation.find({});
          expect(lengthPost).toBe(1);
        });
        test("to a member of the group.", async () => {
          await post('invitations', { to: rootId, groupId }, { token: rootToken, expectedStatus: 403 });
        });
        test("to a member of the group.", async () => {
          await post('invitations', { to: rootId, groupId }, { token: rootToken, expectedStatus: 403 });
          const { length } = await Invitation.find({});
          expect(length).toBe(0);
        });
        test("with an group id malformatted.", async () => {
          await post('invitations', { to: rootId, groupId: 'a' }, { token: rootToken, expectedStatus: 400 });
          const { length } = await Invitation.find({});
          expect(length).toBe(0);
        });
      });
      describe("Update an invitation...", () => {
        let invitationId;
        beforeEach(async () => {
          await Invitation.deleteMany({});
          const { id } = await post('invitations', { to: auxUserId, groupId }, { token: rootToken });
          invitationId = id;
        });
        test("with the right data.", async () => {
          const { accepted: acceptedUpdated } = await put(`invitations/${invitationId}`, { accepted: true }, { token: auxUserToken });
          expect(acceptedUpdated).toBe(true);
        });
        test("that already was updated.", async () => {
          const { accepted: acceptedUpdated } = await put(`invitations/${invitationId}`, { accepted: true }, { token: auxUserToken });
          expect(acceptedUpdated).toBe(true);
          await put(`invitations/${invitationId}`, { accepted: true }, { token: rootToken, expectedStatus: 403 });
        });
        test("with the wrong data.", async () => {
          await put(`invitations/${invitationId}`, { accepted: null }, { token: rootToken, expectedStatus: 400 });
        });
      });
    });
    describe("Comments...", () => {
      let groupId;
      let activityId;
      const [movie] = helper.exampleMovies();
      beforeEach(async () => {
        // Creates a group and sets the variable 'groupId'.
        await Group.deleteMany({});
        const { id: groupIdQuery } = await post('groups', { name: 'Group Name' }, { token: rootToken });
        groupId = groupIdQuery;

        // Creates a movie.
        const { id: movieId } = await post('movies', { movie }, { token: rootToken });

        // Creates a new activity with the movieId and groupId, also sets the variable 'activityId'.
        const { id } = await post('activities', { movieId, groupId }, { token: rootToken });
        activityId = id;
      });
      describe("Creation", () => {
        test("right data.", async () => {
          const contentData = 'NONE';
          const { content } = await post('comments', {activity: activityId, content: contentData}, { token: rootToken });
          expect(content).toBe(contentData);
        });
        describe("wrong data:", () => {
          test("no activity.", async () => {
            const contentData = 'NONE';
            await post('comments', { content: contentData }, { token: rootToken, expectedStatus: 400 });
          });
          test("no content.", async () => {
            const contentData = 'NONE';
            await post('comments', { activity: activityId }, { token: rootToken, expectedStatus: 400 });
          });
          test("non existent activityId.", async () => {
            const contentData = 'NONE';
            await post('comments', { activity: rootId , content: contentData }, { token: rootToken, expectedStatus: 404 });
          });
        });
      });
      describe("Deletion", () => {
        let commentId;
        const contentData = 'Content';
        beforeEach(async () => {
          const { id } = await post('comments', 
            { activity: activityId, content: contentData },
            { token: rootToken }
          );
          commentId = id;
        });
        test("Delete your comment", async () => {
          const comments = await get(`comments/${activityId}`, { token: rootToken });
          expect(comments.length).toBe(1);
          await remove(`comments/${commentId}`, { token: rootToken });
          const commentsAfter = await get(`comments/${activityId}`, { token: rootToken });
          expect(commentsAfter.length).toBe(0);
        });
        test("Delete another user comment", async () => {
          // Adds a new user and creates a comment.
          const { id: invitationId } = await post('invitations', { to: auxUserId, groupId }, { token: rootToken });
          await put(`invitations/${invitationId}`, { accepted: true }, { token: auxUserToken });
          const { id } = await post('comments', 
            { activity: activityId, content: contentData },
            { token: auxUserToken }
          );

          // Checks if the commment exists.
          const comments = await get(`comments/${activityId}`, { token: rootToken });
          expect(comments.length).toBe(2);

          // Try to remove it.
          await remove(`comments/${id}`, { token: rootToken, expectedStatus: 401 });

          // The comments should be the same.
          const commentsAfter = await get(`comments/${activityId}`, { token: rootToken });
          expect(commentsAfter.length).toBe(2);
        });
      });
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});