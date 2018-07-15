//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')

let userInfo,authState

App({
    onLaunch: function() {
        qcloud.setLoginUrl(config.service.loginUrl)
    },

    login({
        success,
        error
    }) {
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo'] === false) {

                } else {
                    this.doQcloudLogin({
                        success,
                        error
                    })
                }
            }
        })

    },
    doQcloudLogin({
        success,
        error
    }) {
        // 调用 qcloud 登陆接口    
        qcloud.login({
            success: result => {
                if (result) {
                    userInfo = result

                    success && success({
                        userInfo
                    })
                } else {
                    // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
                    this.getUserInfo({
                        success,
                        error
                    })
                }
            },
            fail: () => {
                error && error()
            }
        })
    },

    getUserInfo({
        success,
        error
    }) {
        if (userInfo) return userInfo

        qcloud.request({
            url: config.service.requestUrl,
            login: true,
            success: result => {
                let data = result.data
                if (!data.code) {
                    userInfo = data.data

                    success && success({
                        userInfo
                    })
                } else {
                    error && error()
                }
            },
            fail: () => {
                error && error()
            }
        })
    },

    checkSession({
        success,
        error
    }) {
        if (userInfo) {
            return success && success({
                userInfo
            })
        }

        wx.checkSession({
            success: () => {
                this.getUserInfo({
                    success: res => {
                        userInfo = res.userInfo
                        success && success({
                            userInfo
                        })
                    },
                    fail: () => {
                        error && error()
                    }
                })
            },
            fail: () => {
                error && error()
            }
        })
    }
})