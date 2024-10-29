const express = require('express');
const router = express.Router();
const { checkUser } = require('../middleware/authenticate')

const recipeController = require('../controllers/recipe');
router.get('/', recipeController.getAll);
router.get('/:id', recipeController.getSingle);
router.post('/', checkUser, recipeController.createRecipe);
router.put('/:id', checkUser, recipeController.updateRecipe);
router.delete('/:id', checkUser, recipeController.deleteRecipe)

module.exports = router;