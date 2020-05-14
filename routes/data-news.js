const express = require("express");
const router = express.Router();

const {
    getDataNews
} = require('../controllers/data-news')

router.get("/data-news", getDataNews);


module.exports = router;