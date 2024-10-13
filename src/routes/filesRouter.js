const express = require("express");
const router = express.Router();

const fileController = require("../app/controllers/fileController")

router.post('/video/single', fileController.uploadFileVideo.single("file"), fileController.createSingleFileVideo)

router.post('/video/single-hls', fileController.uploadFileVideo.single("file"), fileController.createSingleFileVideoHLS)
router.get('/video/view-hls/:hlsId/:segment', fileController.viewFileVideoHLS)

router.get('/video/view',fileController.viewFileVideo)
router.post('/image/single', fileController.uploadFileImage.single("file"), fileController.createSingleImage)
router.get('/image/view',fileController.viewImage)

module.exports = router