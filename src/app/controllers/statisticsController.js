const { v4: uuidv4 } = require('uuid');
const { getStatisticssViewService } = require('../services/statisticsService');

const getStatisticsView = async (req, res, next) => {
    try {
        let data = await getStatisticssViewService();
        if (data.length > 0) {
            return res.status(200).json({
                code: 200,
                message: 'Lấy số liệu thống kê thành công',
                data: data[0]
            });
        } else {
            return res.status(404).json({
                code: 404,
                message: 'Không có dữ liệu'
            });
        }
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: 'Error creating employee',
            error: error.message
        });
    }

}
const createStatistics = async (req, res, next) => {

}

const getByIdStatistics = (req, res, next) => {

}
const updateStatistics = (req, res, next) => {

}
const deleteStatistics = async (req, res, next) => {

}
module.exports = {
    getStatisticsView,
    createStatistics,
    getByIdStatistics,
    updateStatistics,
    deleteStatistics,
}