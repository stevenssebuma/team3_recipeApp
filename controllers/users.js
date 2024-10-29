const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;
const Joi = require('joi');

const userSchema = Joi.object({
    userName: Joi.string().regex(/^[a-zA-Z\s]+$/).min(3).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2 }).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
});

const getAllSchema = Joi.object({
    userName: Joi.string().regex(/^[a-zA-Z\s]+$/).min(3).max(30),
    email: Joi.string().email({ minDomainSegments: 2 }),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
});

const idSchema = Joi.string().custom((value, helpers) => {
    if (!ObjectId.isValid(value)) {
        return helpers.message('Invalid ObjectId');
    }
    return value; // Keep the valid ObjectId
}, 'ObjectId Validation');


const getAll = async(req,res) => {
    //#swagger.tags=['Users']
    try {
        const { error, value } = getAllSchema.validate(req.query);
        
        if (error) {
            return res.status(400).json({ message: `Invalid request: ${error.details[0].message}` });
        }

        // Build the MongoDB query object based on validated parameters
        let query = {};

        if (value.userName) {
            query.userName = value.userName;
        }
        
        if (value.email) {
            query.email = value.email;
        }

        if (value.password) {
            query.password = value.password;
        }


        const users = await mongodb.getDatabase().db().collection('users').find(query).toArray();
        res.setHeader('Content-type', 'application/json');
        res.status(200).json(users);
    } catch(err) {
        console.error('Error fetching user: ' + err.message);
        res.status(500).json({message: "An error occured while fetching users."});
    }
};

const getSingle = async(req,res) => {
    //#swagger.tags=['Users']
    try{
        const { error } = idSchema.validate(req.params.id);
        if (error) {
            return res.status(400).json({ message: `Invalid request: ${error.details[0].message}` });
        }

        const userId = new ObjectId(req.params.id);
        const response = await mongodb.getDatabase().db().collection('users').find( {_id:userId} ).toArray();
        res.setHeader('Content-type', 'application/json');
        res.status(200).json(response);
    }
    catch(err){
        console.error('Error fetching user: ' + err.message);
        res.status(500).json({message: "An error occured while fetching the user.", error: err.message});
    }
};

const createUser = async(req,res) => {
    //#swagger.tags=['Users']
    const { error, value } = userSchema.validate(req.body);
    if (error) {
        // If validation fails, send 400 Bad Request
        return res.status(400).json({ message: `Invalid request: ${error.details[0].message}` });
    }

    const user = {
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
    };
    const response = await mongodb.getDatabase().db().collection('users').insertOne(user);
    if (response.acknowledged) {
        res.status(204).send();
    } else {
        res.status(500).json(response.error || 'Some error occured while creating the user');
    }
};

const updateUser = async(req, res) => {
    //#swagger.tags=['Users']
    const { error, value } = userSchema.validate(req.body);
    if (error) {
        // If validation fails, send 400 Bad Request
        return res.status(400).json({ message: `Invalid request: ${error.details[0].message}` });
    }

    const userId = new ObjectId(req.params.id);
    const user = {
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
    };
    const response = await mongodb.getDatabase().db().collection('users').replaceOne( { _id: userId }, user );
    if (response.modifiedCount > 0) {
        res.status(204).send();
    } else {
        res.status(500).json(response.error || 'Some error occured while updating the contact.');
    }
};

const deleteUser = async(req, res) => {
    //#swagger.tags=['Users']
    try {    
        const { error } = idSchema.validate(req.params.id);
        if (error) {
            return res.status(400).json({ message: `Invalid request: ${error.details[0].message}` });
        }
        const userId = new ObjectId(req.params.id);
        const response = await mongodb.getDatabase().db().collection('users').deleteOne({ _id: userId });
        if (response.deletedCount > 0) {
            res.status(204).send();
        } else {
            res.status(500).json({ message: response.error || 'Some error occurred while deleting the user.' });
        }
    } catch (err) {
        console.error('Error deleting user: ' + err.message);
        res.status(500).json({message: "An error occured while deleting the user."});
    }
};

module.exports = {
    getAll,
    createUser,
    getSingle,
    updateUser,
    deleteUser
};