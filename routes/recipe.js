const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authenticate')

const recipeController = require('../controllers/recipe');
router.get('/', recipeController.getAll);
router.get('/:id', recipeController.getSingle);
router.post('/', isAuthenticated, recipeController.createRecipe);
router.put('/:id', isAuthenticated, recipeController.updateRecipe);
router.delete('/:id', isAuthenticated, recipeController.deleteRecipe)

module.exports = router;