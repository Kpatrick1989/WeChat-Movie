var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
const innerAudioContext = wx.createInnerAudioContext()
const listType = ['收藏的影评', '发表的影评']

Page({

    /**
     * 页面的初始数据
     */
    data: {
        commentList: [],
        currentType: listType[0]
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getList(() => {
            wx.stopPullDownRefresh()
        })
    },
    onPullDownRefresh() {
        this.getList(() => {
            wx.stopPullDownRefresh()
        })
    },
    getMineComment: function(callback) { // 获取我发表的评论
        wx.showLoading({
            title: '评论加载中...'
        })
        qcloud.request({
            url: config.service.getCommentByUser,
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
                } else {
                    wx.showToast({
                        icon: 'none',
                        title: '评论加载失败'
                    })
                }
            },
            fail: result => {
                wx.hideLoading()
                wx.showToast({
                    icon: 'none',
                    title: '评论加载失败'
                })
            },
            complete: () => {
                callback && callback()
            }
        })
    },
    getCollection: function(callback) { // 获取收藏的评论
        wx.showLoading({
            title: '评论加载中...'
        })
        qcloud.request({
            url: config.service.getCollection,
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
                } else {
                    wx.showToast({
                        icon: 'none',
                        title: '评论加载失败'
                    })
                }
            },
            fail: result => {
                wx.hideLoading()
                wx.showToast({
                    icon: 'none',
                    title: '评论加载失败'
                })
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
    toDetail: function(e) { // 进入评论详情页
        var index = e.currentTarget.dataset.index;
        var comment = this.data.commentList[index]
        wx.setStorage({
            key: 'tempFile',
            data: comment
        })
        wx.navigateTo({
            url: `/pages/commentDetail/commentDetail?id=${comment.movie_id}&title=${comment.title}&image=${comment.image}&content=${comment.content}`
        })
    },
    changeType: function() { // 切换发表的评论和收藏的评论
        var _this = this;
        wx.showActionSheet({
            itemList: listType,
            success: function(res) {
                _this.setData({
                    currentType: listType[res.tapIndex]
                })
                _this.getList()
            },
            fail: function(res) {
                console.log(res.errMsg)
            }
        })
    },
    getList: function(callback) { // 切换列表类型后加载对应列表的事件
        var currentType = this.data.currentType;
        if (currentType == '收藏的影评') {
            this.getCollection(callback)
        } else if (currentType == '发表的影评') {
            this.getMineComment(callback)
        }
    },
    backIndex: function() { // 回到首页
        wx.navigateBack({
            delta: 1
        })
    }
})