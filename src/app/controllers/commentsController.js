const { getCommentsService, createCommentService, findByIdCommentService, deleteCommentService, updateCommentService, updateCommentRepliesService, updateLikeService, deleteListCommentService } = require("../services/commentsService");
const { v4: uuidv4 } = require('uuid');
const { updateVideoCommentCount } = require("../services/videosService");

const getComment = async (req, res, next) => {
    try {
        let data = await getCommentsService(req.query);
        return res.json({
            code: 200,
            message: "Thành công",
            data: data,
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            code: 500,
            message: 'Error creating employee',
            error: error.message
        });
    }
}

const createComment = async (req, res, next) => {
    const comment_id = uuidv4();
    const {
        user_id,
        video_id,
        content,
        num_likes,
        num_replies,
        likes,
        replies,
        parent_comment_id
    } = req.body;

    let dataInsert = [
        comment_id,
        user_id,
        video_id,
        content,
        num_likes || 0,
        num_replies || 0,
        likes || null,
        replies || null,
        parent_comment_id || null,
    ];

    try {
        const result = await createCommentService(dataInsert);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Comments not found',
            });
        }

        if (parent_comment_id) {
            const parentComment = await findByIdCommentService(parent_comment_id);

            if (parentComment) {
                let updatedReplies = parentComment.replies?.length > 0 ? parentComment.replies : [];
                updatedReplies.push(comment_id);

                await updateCommentRepliesService(parent_comment_id, updatedReplies);
            }
        }

        //cập nhật tổng số num_comment trong video khi thêm mới 1 comment
        await updateVideoCommentCount(video_id);

        let updatedItem = await findByIdCommentService(comment_id);
        
        res.json({
            code: 200,
            message: 'Comments create successfully',
            data: updatedItem
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error creating comments',
            error: error.message
        });
    }
}

//cập nhật yêu thích
const updateLike = async (req, res) => {
    const { comment_id } = req.params;
    const { user_id } = req.body; // Nhận thêm user_id từ request

    try {
        if (!user_id) {
            return res.status(400).json({
                code: 400,
                message: 'Missing user_id in request body'
            });
        }

        // Gọi service để tăng hoặc giảm num_like và cập nhật likes
        let itemComment = await findByIdCommentService(comment_id);

        // Kiểm tra nếu comment không tồn tại
        if (!itemComment) {
            return res.status(404).json({
                code: 404,
                message: 'Comment not found'
            });
        }

        let likes = itemComment?.likes || []
        let index = likes?.findIndex(i => i === user_id)

        if (!(index > -1)) {
            likes?.push(user_id);
        } else {
            likes.splice(index, 1);
        }
        
        await updateLikeService(comment_id, likes);
        let item = await findByIdCommentService(comment_id);

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

const getByIdComment = async (req, res, next) => {
    const { comment_id } = req.params;

    try {
        let item = await findByIdCommentService(comment_id);
        res.json({
            code: 200,
            message: 'Comment successfully',
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

const updateComment = async (req, res, next) => {
    const { comment_id } = req.params;

    const {
        content,
        num_likes,
        num_replies,
        likes,
        replies,
    } = req.body;

    let dataUpdate = [
        content,
        num_likes || 0,
        num_replies || 0,
        likes || null,
        replies || null,
        comment_id
    ];

    try {
        const result = await updateCommentService(dataUpdate);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Comment not found',
            });
        }

        let updatedItem = await findByIdCommentService(comment_id);

        res.json({
            code: 200,
            message: 'Comment updated successfully',
            data: updatedItem
        });

    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error updating comment',
            error: error.message
        });
    }
}

const deleteComment = async (req, res, next) => {
    const { comment_id } = req.params;

    try {
        const result = await deleteCommentService(comment_id);

        // Kiểm tra nếu không có bản ghi nào bị xóa
        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Comments not found',
            });
        }

        res.json({
            code: 200,
            message: 'Comments deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error deleting notification',
            error: error.message
        });
    }
}

const deleteComments = async (req, res, next) => {
    const { ids } = req.query;
    const comment_ids = ids.split(',');

    try {
        // Kiểm tra nếu không có danh sách ID hoặc mảng trống
        if (!comment_ids || !Array.isArray(comment_ids) || comment_ids.length === 0) {
            return res.status(400).json({
                code: 400,
                message: 'Comment IDs not provided or invalid',
            });
        }

        // Xóa các comment và tất cả các comment con
        const result = await deleteListCommentService(comment_ids);

        // Kiểm tra nếu không có bản ghi nào bị xóa
        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Comments not found',
            });
        }

        res.json({
            code: 200,
            message: 'Comments deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error deleting comments',
            error: error.message,
        });
    }
};

module.exports = {
    getComment,
    createComment,
    getByIdComment,
    updateComment,
    deleteComment,
    updateLike,
    deleteComments
}