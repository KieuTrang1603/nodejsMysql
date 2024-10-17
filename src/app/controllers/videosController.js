const { getVideoService, createVideoService, deleteVideoService, findByIdVideoService, updateByIdVideoService, incrementViewService, updateLikeService, deleteListVideoService } = require("../services/videosService");
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
        content,
        num_like,
        num_comments,
        fileName,
        num_views,
        date_uploaded,
        likes,
        comments,
    } = req.body;

    let dataInsert = [
        video_id,
        user_id,
        content,
        num_like || 0,
        num_comments || 0,
        fileName || null,
        num_views || 0,
        date_uploaded || new Date(),
        likes || null,
        comments || null,
    ]

    try {
        const result = await createVideoService(dataInsert);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Video not found',
            });
        }

        let item = await findByIdVideoService(video_id);

        res.json({
            code: 200,
            message: 'Video create successfully',
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
        content,
        num_like,
        num_comments,
        fileName,
        num_views,
        likes,
        comments
    } = req.body;

    let dataUpdate = {};

    if (user_id) dataUpdate.user_id = user_id;
    if (content) dataUpdate.content = content;
    if (likes) {
        dataUpdate.num_like = likes?.length || 0;
        dataUpdate.likes = JSON.stringify(likes);
    }
    if (num_comments) dataUpdate.num_comments = num_comments;
    if (fileName) dataUpdate.fileName = fileName;
    if (num_views) dataUpdate.num_views = num_views;
    if (comments) dataUpdate.comments = comments;

    try {
        await updateByIdVideoService(video_id, dataUpdate);
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

//tăng view
const incrementView = async (req, res) => {
    const { video_id } = req.params;

    try {
        const affectedRows = await incrementViewService(video_id); // Lấy số dòng bị ảnh hưởng từ service

        if (affectedRows > 0) {
            res.json({
                code: 200,
                message: 'View incremented successfully',
                data: null // Nếu không có dữ liệu thêm, có thể để null
            });
        } else {
            res.status(404).json({
                code: 404,
                message: 'No video found with the provided ID',
                data: null
            });
        }
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error incrementing view',
            error: error.message
        });
    }
}

//cập nhật yêu thích
const updateLike = async (req, res) => {
    const { video_id } = req.params;
    const { user_id } = req.body; // Nhận thêm user_id từ request

    try {
        if (!user_id) {
            return res.status(400).json({
                code: 400,
                message: 'Missing user_id in request body'
            });
        }

        // Gọi service để tăng hoặc giảm num_like và cập nhật likes
        let itemVideo = await findByIdVideoService(video_id);

        if (!itemVideo) {
            return res.status(404).json({
                code: 404,
                message: 'Video not found'
            });
        }

        let likes = itemVideo?.likes || []
        let index = (itemVideo?.likes || [])?.findIndex(videoId => videoId === user_id)
        if (!(index > -1)) {
            likes?.push(user_id);
        } else {
            likes.splice(index, 1);
        }

        await updateLikeService(video_id, likes, itemVideo?.user_id);

        // Tìm lại thông tin video sau khi cập nhật
        let item = await findByIdVideoService(video_id);

        res.json({
            code: 200,
            message: `Like ${!(index > -1) ? 'increased' : 'decreased'} successfully`,
            data: item
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error updating like',
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
                data: false
            });
        }

        res.json({
            code: 200,
            message: 'Videos deleted successfully',
            data: true
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error deleting notification',
            error: error.message
        });
    }
}

const deleteVideos = async (req, res, next) => {
    const { ids } = req.query;
    const video_ids = ids.split(',');

    try {
        if (!video_ids || !Array.isArray(video_ids) || video_ids?.length === 0) {
            return res.status(400).json({
                code: 400,
                message: 'Videos IDs not provided or invalid',
            });
        }

        const result = await deleteListVideoService(video_ids);

        // Kiểm tra nếu không có bản ghi nào bị xóa
        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Videos not found',
                data: false
            });
        }

        res.json({
            code: 200,
            message: 'Videos deleted successfully',
            data: true
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
    incrementView,
    updateLike,
    deleteVideos
}