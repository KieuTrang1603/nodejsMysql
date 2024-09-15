const { getCommentsService, createCommentService, findByIdCommentService, deleteCommentService, updateCommentService } = require("../services/commentsService");
const { v4: uuidv4 } = require('uuid');

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
    ];

    try {
        const result = await createCommentService(dataInsert);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                code: 404,
                message: 'Comments not found',
            });
        }

        let updatedItem = await findByIdCommentService(user_id);

        res.json({
            code: 200,
            message: 'Comments create successfully',
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
    const { video_id } = req.params;

    try {
        const result = await deleteCommentService(video_id);

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

module.exports = {
    getComment,
    createComment,
    getByIdComment,
    updateComment,
    deleteComment,
}