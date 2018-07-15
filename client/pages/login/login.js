var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: null
    },
    onTapLogin() {
        app.login({
            success: ({
                userInfo
            }) => {
                this.setData({
                    userInfo
                })
                wx.navigateBack({
                    delta: 1
                })
            }
        })
    }
})