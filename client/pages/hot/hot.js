var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    movieList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.getHotMovie(() => {
          wx.stopPullDownRefresh()
      })
  },
  onPullDownRefresh() {
      this.getHotMovie(() => {
          wx.stopPullDownRefresh()
      })
  },
  getHotMovie: function (callback) { //获取热门电影列表
      wx.showLoading({
          title: '热门电影加载中...'
      })
      qcloud.request({
          url: config.service.movie,
          success: result => {
              wx.hideLoading();
              if (!result.data.code) {
                  this.setData({
                      movieList: result.data.data
                  })
              } else {
                  wx.showToast({
                      title: '热门电影加载失败'
                  })
              }
          },
          fail: result => {
              wx.hideLoading()
              wx.showToast({
                  title: '热门电影加载失败'
              })
          },
          complete: () => {
              callback && callback()
          }
      })
  },
  toDetail: function (e) { // 进入电影详情页面
      let movieId = e.currentTarget.dataset.id;
      wx.navigateTo({
          url: `/pages/detail/detail?id=${movieId}`
      })
  },
})