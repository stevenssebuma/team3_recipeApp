const httpMocks = require('node-mocks-http');
const userController = require('../controllers/users'); 
const mongodb = require('../data/database');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient, ObjectId } = require('mongodb');
jest.setTimeout(20000);

let mongoServer;
let client;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    client = await MongoClient.connect(uri, { useNewUrlParser: true });
    mongodb.getDatabase = jest.fn(() => client); // Mocking getDatabase function
});

afterAll(async () => {
    if (client) {
        await client.close();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
});

beforeEach(async () => {
    const db = client.db();
    // FIX: Corrected collection name from 'user' to 'users'
    await db.collection('users').deleteMany({});
    // End of FIX
});

describe('User Controller', () => {
    it('should fetch all users', async () => {
        const req = httpMocks.createRequest({
            method: 'GET',
            url: '/users',
            query: {},
        });
        const res = httpMocks.createResponse();
        
        const db = client.db();
        await db.collection('users').insertMany([
            { userName: "User 1", email: "test@email1.com", password: "Tester111" },
            { userName: "User 2", email: "test@email2.com", password: "Tester222" }
        ]);
        
        await userController.getAll(req, res);
        
        expect(res.statusCode).toBe(200);
        const data = res._getJSONData();
        expect(data.length).toBe(2);
    });

    it('should return a single user by ID', async () => {
        const db = client.db();
        const insertedUser = await db.collection('users').insertOne({
            userName: "Test User",
            email: "tester@email.com",
            password: "Testpass153*"
        });

        const req = httpMocks.createRequest({
            method: 'GET',
            url: `/users/${insertedUser.insertedId}`,
            params: { id: insertedUser.insertedId.toHexString() },
        });
        const res = httpMocks.createResponse();

        await userController.getSingle(req, res);

        expect(res.statusCode).toBe(200);
        const data = res._getJSONData();
        expect(data[0].userName).toBe("Test User");
    });

    it('should create a new user', async () => {
        const req = httpMocks.createRequest({
            method: 'POST',
            url: '/users',
            body: {
                userName: "New User",
                email: "email@newemail.com",
                password: "newPassword123"
            }
        });
        const res = httpMocks.createResponse();

        await userController.createUser(req, res);

        expect(res.statusCode).toBe(204);
        const db = client.db();
        // FIX: Ensure we're checking the correct 'users' collection
        const user = await db.collection('users').findOne({ userName: "New User" });
        // End of FIX
        expect(user).toBeTruthy();
        expect(user.email).toBe("email@newemail.com");
    });

    it('should update an existing user', async () => {
        const db = client.db();
        const insertedUser = await db.collection('users').insertOne({
            userName: "Old User",
            email: "olduser@email.com",
            password: "oldPassword123"
        });

        const req = httpMocks.createRequest({
            method: 'PUT',
            url: `/users/${insertedUser.insertedId}`,
            params: { id: insertedUser.insertedId.toHexString() },
            body: {
                userName : "Updated User",
                email: "updateduser@email.com",
                password: "newPassword123"
            }
        });
        const res = httpMocks.createResponse();

        await userController.updateUser(req, res);

        expect(res.statusCode).toBe(204);
        // FIX: Assert on updatedUser.userName to match field name
        const updatedUser = await db.collection('users').findOne({ _id: insertedUser.insertedId });
        expect(updatedUser.userName).toBe("Updated User");
        expect(updatedUser.password).toBe("newPassword123");
        // End of FIX
    });

    it('should delete an existing user', async () => {
        const db = client.db();
        const insertedUser = await db.collection('users').insertOne({
            userName: "User to delete",
            email: "todelete@email.com",
            password: "deleteMe123"
        });

        const req = httpMocks.createRequest({
            method: 'DELETE',
            url: `/users/${insertedUser.insertedId}`,
            params: { id: insertedUser.insertedId.toHexString() },
        });
        const res = httpMocks.createResponse();

        await userController.deleteUser(req, res);

        expect(res.statusCode).toBe(204);
        const deletedUser = await db.collection('users').findOne({ _id: insertedUser.insertedId });
        expect(deletedUser).toBeFalsy();
    });
});