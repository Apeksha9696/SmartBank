const express = require("express");
const { listSchemes, getScheme } = require("../controllers/schemeController");

const router = express.Router();

router.get("/", listSchemes);
router.get("/:code", getScheme);

module.exports = router;
