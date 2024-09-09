const { getUsersService, createUserService } = require("../services/usersService");
const { v4: uuidv4 } = require('uuid');

const getStatistics = async (req, res, next) => {
    try {
        let data = await getStatisticssService();
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
const createStatistics = async (req, res, next) => {
    const id = uuidv4();
    const { name, email, city } = req.body;

    try {
        const data = await createStatisticsService([id, name, email, city])
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
const getByIdStatistics = (req, res, next) => {

}
const updateStatistics = (req, res, next) => {

}
const deleteStatistics = async (req, res, next) => {

}
module.exports = {
    getStatistics,
    createStatistics,
    getByIdStatistics: getByIdStatistics,
    updateStatistics: updateStatistics,
    deleteStatistics: deleteStatistics,
}