const express = require('express');
const router = express.Router();

router.use('/', require('./swagger'));

router.get('/', (req, res) => {
    //#swagger.tags=['Hope Page']
    res.render('homePage');
});

router.use('/users', require('./users'));

router.use('/recipe', require('./recipe'));

module.exports = router;