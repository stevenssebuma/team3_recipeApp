const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient, ObjectId } = require('mongodb');
const mongodb = require('../data/database');
const recipeController = require('../controllers/recipe');
const httpMocks = require('node-mocks-http');
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
    await db.collection('recipe').deleteMany({}); // Clear the collection before each test
});

describe('Recipe Controller', () => {
    it('should fetch all recipes', async () => {
        const req = httpMocks.createRequest({
            method: 'GET',
            url: '/recipes',
            query: {},
        });
        const res = httpMocks.createResponse();
        
        const db = client.db();
        await db.collection('recipe').insertMany([
            { name: "Recipe 1", ingredients: ["ingredient1", "ingredient2"], servings: 2, cooking_time: "10 minutes" },
            { name: "Recipe 2", ingredients: ["ingredient3", "ingredient4"], servings: 4, cooking_time: "15 minutes" }
        ]);
        
        await recipeController.getAll(req, res);
        
        expect(res.statusCode).toBe(200);
        const data = res._getJSONData();
        expect(data.length).toBe(2);
    });

    it('should return a single recipe by ID', async () => {
        const db = client.db();
        const insertedRecipe = await db.collection('recipe').insertOne({
            name: "Test Recipe",
            ingredients: ["ingredient1", "ingredient2"],
            servings: 2,
            cooking_time: "10 minutes"
        });

        const req = httpMocks.createRequest({
            method: 'GET',
            url: `/recipes/${insertedRecipe.insertedId}`,
            params: { id: insertedRecipe.insertedId.toHexString() },
        });
        const res = httpMocks.createResponse();

        await recipeController.getSingle(req, res);

        expect(res.statusCode).toBe(200);
        const data = res._getJSONData();
        expect(data[0].name).toBe("Test Recipe");
    });

    it('should create a new recipe', async () => {
        const req = httpMocks.createRequest({
            method: 'POST',
            url: '/recipes',
            body: {
                name: "New Recipe",
                ingredients: ["ingredient1", "ingredient2"],
                servings: 4,
                cooking_time: "20 minutes"
            }
        });
        const res = httpMocks.createResponse();

        await recipeController.createRecipe(req, res);

        expect(res.statusCode).toBe(204);
        const db = client.db();
        const recipe = await db.collection('recipe').findOne({ name: "New Recipe" });
        expect(recipe).toBeTruthy();
        expect(recipe.servings).toBe(4);
    });

    it('should update an existing recipe', async () => {
        const db = client.db();
        const insertedRecipe = await db.collection('recipe').insertOne({
            name: "Old Recipe",
            ingredients: ["ingredient1", "ingredient2"],
            servings: 2,
            cooking_time: "10 minutes"
        });

        const req = httpMocks.createRequest({
            method: 'PUT',
            url: `/recipes/${insertedRecipe.insertedId}`,
            params: { id: insertedRecipe.insertedId.toHexString() },
            body: {
                name: "Updated Recipe",
                ingredients: ["ingredient1", "ingredient3"],
                servings: 3,
                cooking_time: "15 minutes"
            }
        });
        const res = httpMocks.createResponse();

        await recipeController.updateRecipe(req, res);

        expect(res.statusCode).toBe(204);
        const updatedRecipe = await db.collection('recipe').findOne({ _id: insertedRecipe.insertedId });
        expect(updatedRecipe.name).toBe("Updated Recipe");
        expect(updatedRecipe.servings).toBe(3);
    });

    it('should delete an existing recipe', async () => {
        const db = client.db();
        const insertedRecipe = await db.collection('recipe').insertOne({
            name: "Recipe to delete",
            ingredients: ["ingredient1", "ingredient2"],
            servings: 2,
            cooking_time: "10 minutes"
        });

        const req = httpMocks.createRequest({
            method: 'DELETE',
            url: `/recipes/${insertedRecipe.insertedId}`,
            params: { id: insertedRecipe.insertedId.toHexString() },
        });
        const res = httpMocks.createResponse();

        await recipeController.deleteRecipe(req, res);

        expect(res.statusCode).toBe(204);
        const deletedRecipe = await db.collection('recipe').findOne({ _id: insertedRecipe.insertedId });
        expect(deletedRecipe).toBeFalsy();
    });
});