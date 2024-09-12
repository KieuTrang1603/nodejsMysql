const { getCommentsService, createCommentService, findByIdCommentService } = require("../services/commentsService");
const { v4: uuidv4 } = require('uuid');

const getComment = async (req, res, next) => {
    
    try {
        let data = await getCommentsService();
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
        await createCommentService(dataInsert)
        let item = await findByIdCommentService(comment_id);
        res.json({
            code: 200,
            message: 'Comments created successfully',
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

const getByIdComment = (req, res, next) => {

}

const updateComment = (req, res, next) => {

}

const deleteComment = async (req, res, next) => {

}

module.exports = {
    getComment,
    createComment,
    getByIdComment: getByIdComment,
    updateComment: updateComment,
    deleteComment: deleteComment,
}