const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryController');

/**
 * @swagger
 * /countries:
 *   get:
 *     summary: Get country information
 *     tags: [Countries]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Country information
 */
router.get('/countries', countryController.getCountries);

module.exports = router;