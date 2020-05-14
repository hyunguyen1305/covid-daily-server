const express = require("express");
const router = express.Router();

const {
    getDataTable
} = require('../controllers/data-table')

router.get("/data-table", getDataTable);


module.exports = router;