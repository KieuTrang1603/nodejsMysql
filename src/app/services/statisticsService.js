const db = require("../../config/db");

const createStatisticsService = async (body) => {
};


const findByIdStatisticsService = async (id) => {

};

const getStatisticssViewService = async (searchObject = {}) => {
    const [rows] = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM user) as total_users,                  -- Tổng số người dùng
          (SELECT SUM(num_views) FROM video) as total_video_views,      -- Tổng số lượt xem video
          (SELECT SUM(num_like) FROM video) as total_video_likes,       -- Tổng số lượt thích của video
          (SELECT COUNT(*) FROM video) as total_videos,                 -- Tổng số video
          (SELECT COUNT(*) FROM comments) as total_comments            -- Tổng số bình luận
      `);

    return rows
};

const updateByIdStatisticsService = async (id, body) => {

};

const deleteStatisticsService = async (id) => {

};

const deleteListStatisticsService = async (ids) => {

};

module.exports = {
    getStatisticssViewService,
    findByIdStatisticsService,
    updateByIdStatisticsService,
    createStatisticsService,
    deleteStatisticsService
}