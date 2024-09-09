const { getVideoService, createVideoService } = require("../services/videosService");
const { v4: uuidv4 } = require('uuid');

// const profile = firebase.collection('profile');

const getVideo = async (req, res, next) => {
    try {
        let data = await getVideoService();
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
const createVideo = async (req, res, next) => {
    const id = uuidv4();
    const { name, email, city } = req.body;
    console.log(req.body)
    console.log([id, name, email, city])

    try {
        const data = await createVideoService([id, name, email, city])
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