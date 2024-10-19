const express = require('express');
const router = express.Router();

router.use('/', require('./swagger'));

router.get('/', (req, res) => {
    //#swagger.tags=['Hello World']
    res.send('Hello World');
});

router.use('/users', require('./users'));

router.use('/recipe', require('./recipe'));

module.exports = router;