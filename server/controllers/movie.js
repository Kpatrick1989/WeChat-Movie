const DB = require('../utils/db.js')

module.exports = {
    /**
     * 获取电影列表
     */
    list: async ctx => {
        ctx.state.data = await DB.query("SELECT * FROM movies;")
    }, 
    /**
     * 获取电影详情
     */
    detail: async ctx => {
        let movieId = + ctx.params.id;
        let movie;

        if (!isNaN(movieId)) {
            movie = (await DB.query('SELECT * FROM movies WHERE id = ?', [movieId]))[0]
        } else {
            movie = {};
        }

        ctx.state.data = movie;
    }
}