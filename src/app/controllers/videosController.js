const { getVideoService, createVideoService } = require("../services/videosService");
const { v4: uuidv4 } = require('uuid');

const getVideo = async (req, res, next) => {
    try {
        let data = await getVideoService(req.query);
        return res.json({
            code: 200,
            message: "Thành công",
            data: data,
        })
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error creating employee',
            error: error.message
        });
    }
}
const createVideo = async (req, res, next) => {
    const video_id = uuidv4();
    const {
        user_id,
        title, //sau sẽ bỏ
        description,//sau sẽ bỏ
        content,
        num_like,
        num_comments,
        link_video,
        num_views,
        date_uploaded,
        likes,
        comments,
    } = req.body;

    let dataInsert = [
        video_id,
        user_id,
        title,
        description,
        content,
        num_like || 0,
        num_comments || 0,
        link_video || null,
        num_views || 0,
        date_uploaded || null,
        likes || null,
        comments || null,
    ]

    try {
        await createVideoService(dataInsert)
        res.json({
            code: 200,
            message: 'Employee created successfully',
            data: { id, name, email, city }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: 500,
            message: 'Error creating employee',
            error: error.message
        });
    }
}
const getByIdVideo = (req, res, next) => {

}
const updateVideo = (req, res, next) => {

}
const deleteVideo = async (req, res, next) => {

}
module.exports = {
    getVideo,
    createVideo,
    getByIdVideo: getByIdVideo,
    updateVideo: updateVideo,
    deleteVideo: deleteVideo,
}