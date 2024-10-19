const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;
const Joi = require('joi');

const recipeSchema = Joi.object({
    name: Joi.string().regex(/^[a-zA-Z\s]+$/).min(5).max(30).required(),
    ingredients: Joi.array().items(Joi.string()).min(2).max(15).required(),
    servings: Joi.number().integer().min(1).required(),
    cooking_time: Joi.string().min(9).max(11).required(),
});

const getAllSchema = Joi.object({
    name: Joi.string().regex(/^[a-zA-Z\s]+$/).min(5).max(30),
    ingredients: Joi.array().items(Joi.string()).min(2).max(15),
    servings: Joi.number().integer().min(1),
    cooking_time: Joi.string().min(9).max(11),
});

const idSchema = Joi.string().custom((value, helpers) => {
    if (!ObjectId.isValid(value)) {
        return helpers.message('Invalid ObjectId');
    }
    return value; // Keep the valid ObjectId
}, 'ObjectId Validation');


const getAll = async(req,res) => {
    //#swagger.tags=['Recipe']
    try{
        const { error, value } = getAllSchema.validate(req.query);
            
            if (error) {
                return res.status(400).json({ message: `Invalid request: ${error.details[0].message}` });
            }

            // Build the MongoDB query object based on validated parameters
            let query = {};
            if (value.name) {
                query.name = value.name;
            }
            if (value.ingredients) {
                query.ingredients = value.ingredients;
            }
            if (value.servings) {
                query.servings = value.servings;
            }
            if (value.cooking_time) {
                query.cooking_time= value.cooking_time;
            }

        const recipe = await mongodb.getDatabase().db().collection('recipe').find(query).toArray();
        res.setHeader('Content-type', 'application/json');
        res.status(200).json(recipe);
        } catch (err) {
            console.error('Error fetching recipe: ' + err.message);
            res.status(500).json({message: "An error occured while fetching the recipe.", error: err.message});
        }
};

const getSingle = async(req,res) => {
    //#swagger.tags=['Recipe']
    try{
        const { error } = idSchema.validate(req.params.id);
        if (error) {
            return res.status(400).json({ message: `Invalid request: ${error.details[0].message}` });
        }

        const recipeId = new ObjectId(req.params.id);
        const response = await mongodb.getDatabase().db().collection('recipe').find( {_id:recipeId} ).toArray();
        res.setHeader('Content-type', 'application/json');
        res.status(200).json(response);
    }
    catch(err){
        console.error('Error fetching recipe: ' + err.message);
        res.status(500).json({message: "An error occured while fetching the recipe.", error: err.message});
    }
};

const createRecipe = async(req,res) => {
    //#swagger.tags=['Recipe']

    const { error, value } = recipeSchema.validate(req.body);
    if (error) {
        // If validation fails, send 400 Bad Request
        return res.status(400).json({ message: `Invalid request: ${error.details[0].message}` });
    }
    const recipe = {
        name: req.body.name,
        ingredients: req.body.ingredients,
        servings: req.body.servings,
        cooking_time: req.body.cooking_time,
    };
    const response = await mongodb.getDatabase().db().collection('recipe').insertOne(recipe);
    if (response.acknowledged) {
        res.status(204).send();
    } else {
        res.status(500).json(response.error || 'Some error occured while creating the recipe');
    }
};

const updateRecipe = async(req, res) => {
    //#swagger.tags=['Recipe']

    const { error, value } = recipeSchema.validate(req.body);
    if (error) {
        // If validation fails, send 400 Bad Request
        return res.status(400).json({ message: `Invalid request: ${error.details[0].message}` });
    }
    
    const recipeId = new ObjectId(req.params.id);
    const recipe = {
        name: req.body.name,
        ingredients: req.body.ingredients,
        servings: req.body.servings,
        cooking_time: req.body.cooking_time,
    };
    const response = await mongodb.getDatabase().db().collection('recipe').replaceOne( { _id: recipeId }, recipe );
    if (response.modifiedCount > 0) {
        res.status(204).send();
    } else {
        res.status(500).json(response.error || 'Some error occured while updating the recipe.');
    }
};

const deleteRecipe = async(req, res) => {
    //#swagger.tags=['Recipe']
    try {
        const { error } = idSchema.validate(req.params.id);
        if (error) {
            return res.status(400).json({ message: `Invalid request: ${error.details[0].message}` });
        }

        const recipeId = new ObjectId(req.params.id);
        const response = await mongodb.getDatabase().db().collection('recipe').deleteOne({ _id: recipeId });
        if (response.deletedCount > 0) {
            res.status(204).send();
        } else {
            res.status(500)(response.error || 'Somme error occured while deleting the recipe.');
        }
    } catch (err) {
        console.error('Error deleting recipe: ' + err.message);
        res.status(500).json({message: "An error occured while deleting the recipe."});
    }
};

module.exports = {
    getAll,
    getSingle,
    createRecipe,
    updateRecipe,
    deleteRecipe
};