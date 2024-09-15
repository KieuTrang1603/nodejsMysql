const { getVideoService, createVideoService, deleteVideoService, findByIdVideoService, updateByIdVideoService } = require("../services/videosService");
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
        video_id
    ]

    try {
        const result = await createVideoService(dataInsert);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Video not found',
            });
        }

        let updatedItem = await findByIdVideoService(user_id);

        res.json({
            code: 200,
            message: 'Video create successfully',
            data: updatedItem
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error creating employee',
            error: error.message
        });
    }
}

const getByIdVideo = async (req, res, next) => {
    const { video_id } = req.params;

    try {
        let item = await findByIdVideoService(video_id);
        res.json({
            code: 200,
            message: 'Videos successfully',
            data: item
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error creating employee',
            error: error.message
        });
    }
}

const updateVideo = async (req, res, next) => {
    const { video_id } = req.params;

    const {
        user_id,
        title, // sau sẽ bỏ
        description, // sau sẽ bỏ
        content,
        num_like,
        num_comments,
        link_video,
        num_views,
        date_uploaded,
        likes,
        comments
    } = req.body;

    let dataUpdate = [
        user_id,
        title || null, // Nếu không có giá trị thì gán là null
        description || null,
        content,
        num_like || 0,
        num_comments || 0,
        link_video || null,
        num_views || 0,
        date_uploaded || null,
        likes || null,
        comments || null,
        video_id
    ];

    try {
        const result = await updateByIdVideoService(dataUpdate);
        let item = await findByIdVideoService(video_id);
        res.json({
            code: 200,
            message: 'Video updated successfully',
            data: item
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error updating video',
            error: error.message
        });
    }
}

const deleteVideo = async (req, res, next) => {
    const { video_id } = req.params;

    try {
        const result = await deleteVideoService(video_id);

        // Kiểm tra nếu không có bản ghi nào bị xóa
        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Videos not found',
            });
        }

        res.json({
            code: 200,
            message: 'Videos deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error deleting notification',
            error: error.message
        });
    }
}
module.exports = {
    getVideo,
    createVideo,
    getByIdVideo,
    updateVideo,
    deleteVideo,
}