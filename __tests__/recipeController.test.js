const { MongoMemoryServer } = require('mongodb-memory-server');
const { initDb, getDatabase } = require('../data/database');
const recipeController = require('../controllers/recipe');
const httpMocks = require('node-mocks-http');
const { ObjectId } = require('mongodb');

jest.setTimeout(10000); // Set timeout to 10 seconds for this test file


let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await new Promise((resolve, reject) => {
        initDb((err) => (err ? reject(err) : resolve()), uri);
    });
});

afterEach(async () => {
    const db = getDatabase().db();
    await db.collection('recipe').deleteMany({});
});

afterAll(async () => {
    if (mongoServer) {
        await mongoServer.stop();
    }
});

describe('Recipe Controller Tests', () => {
    it('should update an existing recipe', async () => {
        // Arrange: Insert a test recipe into the in-memory database
        const db = getDatabase().db();
        const initialRecipe = {
            _id: new ObjectId(),
            name: 'Burger',
            ingredients: ['bun', 'patty'],
            servings: 1,
            cooking_time: '00:10:00',
        };
        await db.collection('recipe').insertOne(initialRecipe);

        const req = httpMocks.createRequest({
            method: 'PUT',
            url: `/recipes/${initialRecipe._id}`,
            params: { id: initialRecipe._id.toString() },
            body: {
                name: 'Updated Burger',
                ingredients: ['bun', 'patty', 'cheese'],
                servings: 2,
                cooking_time: '00:15:00',
            },
        });
        const res = httpMocks.createResponse();

        // Act: Call the controller's update function
        await recipeController.updateRecipe(req, res);

        // Assert: Check that the response status is 204 and that the recipe has been updated
        expect(res.statusCode).toBe(204);

        const updatedRecipe = await db.collection('recipe').findOne({ _id: initialRecipe._id });
        expect(updatedRecipe).toEqual(
            expect.objectContaining({
                name: 'Updated Burger',
                ingredients: ['bun', 'patty', 'cheese'],
                servings: 2,
                cooking_time: '00:15:00',
            })
        );
    });
});