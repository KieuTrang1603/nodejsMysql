const { getUsersService, createUserService } = require("../services/usersService");
const { v4: uuidv4 } = require('uuid');

// const profile = firebase.collection('profile');

const getUser = async (req, res, next) => {
    try {
        let data = await getUsersService();
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
const createUser = async (req, res, next) => {
    const id = uuidv4();
    const { name, email, city } = req.body;
    console.log([id, name, email, city])

    try {
        const data = await createUserService([id, name, email, city])
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
const getByIdUser = (req, res, next) => {

}
const updateUser = (req, res, next) => {

}
const deleteUser = async (req, res, next) => {

}
module.exports = {
    getUser,
    createUser,
    getByIdUser: getByIdUser,
    updateUser: updateUser,
    deleteUser: deleteUser,
}