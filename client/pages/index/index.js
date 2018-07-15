var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
const app = getApp()

Page({
    data: {
        hotMovie: null,
        commentList: []
    },
    onLoad: function(options) {
        this.getHotMovie(() => {
            wx.stopPullDownRefresh()
        })
    },
    onPullDownRefresh() {
        this.getHotMovie(() => {
            wx.stopPullDownRefresh()
        })
    },
    getHotMovie: function(callback) { //随机获取电影信息
        wx.showLoading({
            title: '推荐电影加载中...'
        })
        qcloud.request({
            url: config.service.movie,
            success: result => {
                wx.hideLoading();
                if (!result.data.code) {
                    this.setData({
                        hotMovie: result.data.data[parseInt(14 * Math.random())]
                    })
                    this.getComment(this.data.hotMovie.id)
                } else {
                    wx.showToast({
                        icon: 'none',
                        title: '推荐电影加载失败'
                    })
                }
            },
            fail: result => {
                wx.hideLoading()
                wx.showToast({
                    icon: 'none',
                    title: '推荐电影加载失败'
                })
            },
            complete: () => {
                callback && callback()
            }
        })
    },
    getComment: function(id) { //通过随机获取到的电影详情去获取该电影的评论
        qcloud.request({
            url: config.service.getCommentByMovieId,
            data: {
                movieId: id
            },
            success: result => {
                wx.hideLoading();
                if (!result.data.code) {
                    this.setData({
                        commentList: result.data.data.map(item => {
                            let itemDate = new Date(item.create_time)
                            item.createTime = util.formatTime(itemDate)
                            return item
                        })
                    })
                }
            }
        })
    },
    toDetail: function() { // 进入电影详情页面
        let movieId = this.data.hotMovie.id
        wx.navigateTo({
            url: `/pages/detail/detail?id=${movieId}`
        })
    },
    toHot: function() { // 进入热门电影页面
        wx.navigateTo({
            url: `/pages/hot/hot`
        })
    },
    toMine: function() { // 进入个人中心页面
        app.checkSession({
            success: ({
                userInfo
            }) => {
                this.setData({
                    userInfo
                })
                wx.navigateTo({
                    url: '/pages/mine/mine'
                })
            },
            error: () => {
                wx.showModal({
                    title: '提示',
                    content: '您还未登录，请登录后再操作',
                    success: (res) => {
                        if (res.confirm) {
                            wx.navigateTo({
                                url: `/pages/login/login`
                            })
                        }
                    }
                })
            }
        })
    },
    toCommentDetail: function(){ //点击首页的评论进入该评论的详情
        var movie = this.data.hotMovie;
        wx.setStorage({
            key: 'tempFile',
            data: this.data.commentList[0]
        })
        wx.navigateTo({
            url: `/pages/commentDetail/commentDetail?id=${movie.id}&title=${movie.title}&image=${movie.image}&content=${this.data.commentList[0].content}`
        })
    }
})