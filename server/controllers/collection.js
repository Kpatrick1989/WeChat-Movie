const DB = require('../utils/db')

module.exports = {

    /**
     * 添加收藏
     */
    add: async ctx => {
        let user = ctx.state.$wxInfo.userinfo.openId

        let movieId = +ctx.request.body.movie_id
        let commentId = +ctx.request.body.comment_id

        if (!isNaN(movieId) && !isNaN(commentId)) {
            await DB.query('INSERT INTO collection(user, movie_id,comment_id) VALUES (?, ?, ?)', [user,movieId, commentId])
        }

        ctx.state.data = {}
    },
    /**
     * 获取收藏
     */
    list: async ctx => {
        let user = ctx.state.$wxInfo.userinfo.openId

        ctx.state.data = await DB.query('SELECT * FROM collection LEFT JOIN movies ON collection.movie_id = movies.id LEFT JOIN comment ON collection.comment_id = comment.id WHERE collection.user = ?', [user])
    }
}