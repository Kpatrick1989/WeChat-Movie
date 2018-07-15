var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        movie: {},
        userInfo: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getMovieDetail(options.id)
    },

    getMovieDetail: function(id) { // 获取电影详情
        wx.showLoading({
            title: '电影详情加载中...'
        })
        qcloud.request({
            url: config.service.detail + id,
            success: result => {
                wx.hideLoading();
                if (!result.data.code) {
                    this.setData({
                        movie: result.data.data

                    })
                } else {
                    setTimeout(() => {
                        wx.navigateBack()
                    }, 2000)
                }
            },
            fail: result => {
                wx.hideLoading()
                setTimeout(() => {
                    wx.navigateBack()
                }, 2000)
            }
        })
    },
    addComment: function() { // 添加评论事件，点击后去检查登录状态，如没有登录则先跳转到登录页面登录
        app.checkSession({
            success: ({
                userInfo
            }) => {
                this.setData({
                    userInfo
                })
                let movie = this.data.movie;
                this.getComment(movie, this.data.userInfo.openId)
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
    viewComment: function() { // 进入查看该电影下评论的列表页
        let movie = this.data.movie;
        wx.navigateTo({
            url: `/pages/viewComment/viewComment?id=${movie.id}&title=${movie.title}&image=${movie.image}`
        })
    },
    getComment: function(movie, user) { // 点击添加评论时去获取该电影的评论，判断用户有无对该电影发表过评论，如有则弹窗提示，没有则跳转至评论发表页面
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
                    for(let x in data){
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
                            success: function(res) {
                                wx.navigateTo({
                                    url: `/pages/editComment/editComment?id=${movie.id}&title=${movie.title}&image=${movie.image}&tapIndex=${res.tapIndex}`
                                })
                            },
                            fail: function(res) {
                                console.log(res.errMsg)
                            }
                        })
                    }
                }
            }
        })
    }
})