const express = require("express");
const router = express.Router();

const statisticsController = require("../app/controllers/statisticsController")

router.post('/', statisticsController.createStatistics)
router.get('/view', statisticsController.getStatisticsView)
router.put('/:id', statisticsController.updateStatistics)
router.delete('/:id', statisticsController.deleteStatistics)

module.exports = router