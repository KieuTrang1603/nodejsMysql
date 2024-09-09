const express = require("express");
const router = express.Router();

const statisticsController = require("../app/controllers/statisticsController")

router.post('/', statisticsController.createStatistics)
router.get('/:id', statisticsController.getByIdStatistics)
router.put('/:id', statisticsController.updateStatistics)
router.delete('/:id', statisticsController.deleteStatistics)
router.get('/', statisticsController.getStatistics)

module.exports = router