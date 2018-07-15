var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
const app = getApp()
const innerAudioContext = wx.createInnerAudioContext()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        movie: {},
        userInfo: null,
        iconPath: "../../images/play-circle.png",
        playState: 0,
        tempFilePath: '',
        duration: null,
        tapIndex: null,
        commentValue: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var _this = this;
        this.checkSession()
        this.setData({
            movie: {
                id: options.id,
                title: options.title,
                image: options.image
            },
            tapIndex: options.tapIndex,
            commentValue: options.commentValue
        })
        wx.getStorage({ // 从storage获取录音文件的信息
            key: 'tempFile',
            success: function(res) {
                _this.setData({
                    tempFilePath: res.data.tempFilePath,
                    duration: Math.ceil(res.data.duration / 1000)
                })
            }
        })
    },
    checkSession: function() { // 检查登录状态
        app.checkSession({
            success: ({
                userInfo
            }) => {
                this.setData({
                    userInfo
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
    backEdit: function() { // 返回编辑事件
        wx.navigateBack({
            delta:1
        })
    },
    playRecord: function() { // 录音回放
        var _this = this;
        var playState = this.data.playState;
        innerAudioContext.src = this.data.tempFilePath
        innerAudioContext.onPlay(() => {
            console.log('开始播放')
            _this.setData({
                playState: 1,
                iconPath: "../../images/pause-circle.png"
            })
        })
        innerAudioContext.onStop(() => {
            console.log('停止播放')
            _this.setData({
                playState: 0,
                iconPath: "../../images/play-circle.png"
            })
        })
        innerAudioContext.onEnded(() => {
            console.log('播放结束')
            _this.setData({
                playState: 0,
                iconPath: "../../images/play-circle.png"
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
    uploadRecord(callback) { // 上传录音文件，成功后回调发表评论事件
        let tempFilePath = this.data.tempFilePath;

        console.log(tempFilePath)

        if (tempFilePath == '') {
            cb && cb(tempFilePath)
        } else {

            wx.uploadFile({
                url: config.service.uploadUrl,
                filePath: tempFilePath,
                name: 'file',
                success: res => {
                    let data = JSON.parse(res.data)

                    callback && callback(data.data.imgUrl)
                },
                fail: () => {

                }
            })
        }
    },
    postComment() { // 发表评论
        var _this = this;
        let content = this.data.commentValue;

        wx.showLoading({
            title: '正在发表评论'
        })

        this.uploadRecord(record => {
            qcloud.request({
                url: config.service.addComment,
                login: true,
                method: 'PUT',
                data: {
                    record: record,
                    content: content,
                    movie_id: this.data.movie.id,
                    duration: this.data.duration
                },
                success: result => {
                    wx.hideLoading()

                    let data = result.data

                    if (!data.code) {
                        wx.showToast({
                            title: '发表评论成功'
                        })

                        setTimeout(() => {
                            wx.navigateBack({
                                delta: 2
                            })
                            wx.navigateTo({
                                url: `/pages/viewComment/viewComment?id=${_this.data.movie.id}`
                            })
                        }, 1500)
                    } else {
                        wx.showToast({
                            icon: 'none',
                            title: '发表评论失败'
                        })
                    }
                },
                fail: () => {
                    wx.hideLoading()

                    wx.showToast({
                        icon: 'none',
                        title: '发表评论失败'
                    })
                }
            })
        })
    }
})