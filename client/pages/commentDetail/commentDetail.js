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
        record: '',
        duration: null,
        content: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var _this = this;
        this.setData({
            movie: {
                id: options.id,
                title: options.title,
                image: options.image
            },
            content: options.content
        })
        wx.getStorage({ // 从storage获取录音相关的参数
            key: 'tempFile',
            success: function(res) {
                _this.setData({
                    comment_id: res.data.id,
                    record: res.data.record,
                    duration: res.data.duration,
                    username:res.data.username,
                    avatar:res.data.avatar,
                    tapIndex: res.data.record == null ? 0 : 1
                })
            }
        })
    },
    playRecord: function() { // 录音回放
        var _this = this;
        var playState = this.data.playState;
        innerAudioContext.src = this.data.record
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
    checkSession: function(callback){ // 检查登录状态
        app.checkSession({
            success: ({
                userInfo
            }) => {
                this.setData({
                    userInfo
                })
                callback && callback()
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
    addComment: function () { // 点击发表评论按钮后的事件
        this.checkSession(() => {
            let movie = this.data.movie;
            this.getComment(movie, this.data.userInfo.openId)
        })
    },
    getComment: function (movie, user) { // 点击添加评论时去获取该电影的评论，判断用户有无对该电影发表过评论，如有则弹窗提示，没有则跳转至评论发表页面
        var flag = 0
        qcloud.request({
            url: config.service.getCommentByMovieId,
            data: {
                movieId: movie.id
            },
            success: result => {
                wx.hideLoading();
                if (!result.data.code) {
                    var data = result.data.data;
                    for (let x in data) {
                        if (data[x].user == user) {
                            flag = 1
                        }
                    }

                    if (flag == 1) {
                        wx.showModal({
                            title: '提示',
                            content: '你已经对该电影发表过评论！',
                            showCancel: false
                        })
                    } else if (flag == 0) {
                        wx.showActionSheet({
                            itemList: ['文字', '音频'],
                            success: function (res) {
                                wx.navigateTo({
                                    url: `/pages/editComment/editComment?id=${movie.id}&title=${movie.title}&image=${movie.image}&tapIndex=${res.tapIndex}`
                                })
                            },
                            fail: function (res) {
                                console.log(res.errMsg)
                            }
                        })
                    }
                }
            }
        })
    },
    getCollection: function (resolve, reject) { // 获取用户的收藏列表，返回Promise对象
        qcloud.request({
            url: config.service.getCollection,
            success: result => {
                wx.hideLoading();
                if (!result.data.code) {
                    resolve(result.data.data)
                } else {
                    reject()
                }
            },
            fail: result => {
                reject()
            }
        })
    },
    collectionComment: function(){
        var flag = 0;
        var _this = this;
        this.checkSession(() => {
            // 执行获取用户收藏列表的接口，返回promise对象，成功回调判断用户有无收藏过此评论，如果有则弹窗提示，无则执行收藏评论方法
            new Promise(_this.getCollection).then((data) => {
                for (let x in data) {
                    if (data[x].comment_id == _this.data.comment_id) {
                        flag = 1
                    }
                }

                if(flag == 1){
                    wx.showModal({
                        title: '提示',
                        content: '你已经收藏了该评论！',
                        showCancel: false
                    })
                } else {
                    _this.postCollection()
                }
            })
        })
    },
    postCollection: function(){ // 收藏评论方法
        qcloud.request({
            url: config.service.addCollection,
            login: true,
            method: 'PUT',
            data: {
                movie_id: this.data.movie.id,
                comment_id: this.data.comment_id
            },
            success: result => {
                wx.hideLoading()

                let data = result.data

                if (!data.code) {
                    wx.showToast({
                        title: '收藏评论成功'
                    })
                } else {
                    wx.showToast({
                        icon: 'none',
                        title: '收藏评论失败'
                    })
                }
            },
            fail: () => {
                wx.hideLoading()

                wx.showToast({
                    icon: 'none',
                    title: '收藏评论失败'
                })
            }
        })
    }
})