const DB = require('../utils/db')

module.exports = {

    /**
     * 添加评论
     */
    add: async ctx => {
        let user = ctx.state.$wxInfo.userinfo.openId
        let username = ctx.state.$wxInfo.userinfo.nickName
        let avatar = ctx.state.$wxInfo.userinfo.avatarUrl

        let movieId = +ctx.request.body.movie_id
        let content = ctx.request.body.content || null

        let record = ctx.request.body.record || null
        let duration = ctx.request.body.duration || null

        if (!isNaN(movieId)) {
            await DB.query('INSERT INTO comment(user, username, avatar, content, record, movie_id,duration) VALUES (?, ?, ?, ?, ?, ?,?)', [user, username, avatar, content, record, movieId,duration])
        }

        ctx.state.data = {}
    },
    /**
     * 获取评论
     */
    listByMovieId: async ctx => {
        let movieId = +ctx.request.query.movieId

        if (!isNaN(movieId)) {
            ctx.state.data = await DB.query('SELECT * FROM comment WHERE movie_id = ?', [movieId])
        } else {
            ctx.state.data = {}
        }
    },
    listByUser: async ctx => {
        let user = ctx.state.$wxInfo.userinfo.openId

        ctx.state.data = await DB.query('SELECT * FROM comment LEFT JOIN movies ON comment.movie_id = movies.id WHERE user = ?', [user])
    }
}