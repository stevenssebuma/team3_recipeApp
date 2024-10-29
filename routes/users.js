const express = require('express');
const router = express.Router();
const { checkUser } = require('../middleware/authenticate.js')
const usersController = require('../controllers/users.js');

router.get('/', usersController.getAll);
router.get('/:id', usersController.getSingle);
router.post('/', checkUser, usersController.createUser);
router.put('/:id', checkUser, usersController.updateUser);
router.delete('/:id', checkUser, usersController.deleteUser)

module.exports = router;