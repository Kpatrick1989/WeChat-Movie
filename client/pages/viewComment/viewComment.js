var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
const innerAudioContext = wx.createInnerAudioContext()
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        movie: {},
        commentList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            movie: {
                id: options.id,
                title:options.title,
                image:options.image
            }
        })
        this.getComment(this.data.movie.id,() => {
            wx.stopPullDownRefresh()
        })
    },
    onPullDownRefresh() {
        this.getComment(this.data.movie.id, () => {
            wx.stopPullDownRefresh()
        })
    },
    getComment: function(id,callback) { // 获取评论列表
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
                            item.iconPath = "../../images/play-circle.png",
                            item.playState = 0,
                            item.tapIndex = item.content == null ? 1 : 0
                            return item
                        })
                    })
                }
            },
            complete: () => {
                callback && callback()
            }
        })
    },
    playRecord: function(e) { // 录音回放
        var index = e.currentTarget.dataset.index;
        var _this = this;
        var playState = this.data.commentList[index].playState;
        innerAudioContext.src = this.data.commentList[index].record
        innerAudioContext.onPlay(() => {
            console.log('开始播放')
            this.data.commentList[index].playState = 1
            this.data.commentList[index].iconPath = "../../images/pause-circle.png"
            _this.setData({
                commentList: this.data.commentList
            })
        })
        innerAudioContext.onStop(() => {
            console.log('停止播放')
            this.data.commentList[index].playState = 0
            this.data.commentList[index].iconPath = "../../images/play-circle.png"
            _this.setData({
                commentList: this.data.commentList
            })
        })
        innerAudioContext.onEnded(() => {
            console.log('播放结束')
            this.data.commentList[index].playState = 0
            this.data.commentList[index].iconPath = "../../images/play-circle.png"
            _this.setData({
                commentList: this.data.commentList
            })
        })

        innerAudioContext.onError((res) => {
            console.log(res.errMsg)
            console.log(res.errCode)
        })

        if (playState == 0) {
            innerAudioContext.play()
        } else if (playState == 1) {
            innerAudioContext.stop()
        }
    },
    toDetail: function(e){ // 进入评论详情
        var movie = this.data.movie;
        var index = e.currentTarget.dataset.index;
        wx.setStorage({
            key: 'tempFile',
            data: this.data.commentList[index]
        })
        wx.navigateTo({
            url: `/pages/commentDetail/commentDetail?id=${movie.id}&title=${movie.title}&image=${movie.image}&content=${this.data.commentList[index].content}`
        })
    },
    backIndex: function () { // 回到首页，参数设置为9，确保会回到首页
        wx.navigateBack({
            delta: 9
        })
    }
})