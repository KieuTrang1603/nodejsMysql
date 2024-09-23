const express = require("express");
const router = express.Router();

const videosController = require("../app/controllers/videosController")

router.post('/', videosController.createVideo)

router.put('/:video_id/update-like', videosController.updateLike);
router.put('/:video_id/increment-view', videosController.incrementView);

router.get('/search', videosController.getVideo)
router.get('/:video_id', videosController.getByIdVideo)
router.put('/:video_id', videosController.updateVideo)
router.delete('/ids', videosController.deleteVideos)
router.delete('/:video_id', videosController.deleteVideo)

module.exports = router