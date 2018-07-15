var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
const app = getApp()
const recorderManager = wx.getRecorderManager()


var t = 0;
var timer = null;

const options = {
    duration: 30000,
    sampleRate: 44100,
    numberOfChannels: 1,
    encodeBitRate: 192000,
    format: 'mp3',
    frameSize: 50
}

Page({

    /**
     * 页面的初始数据
     */
    data: {
        movie: {},
        commentValue: '',
        tapIndex: 0,
        authorize: true,
        buttonText: '录音',
        recordState: 0,
        tempFilePath: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            movie: {
                id: options.id,
                title: options.title,
                image: options.image
            },
            tapIndex: options.tapIndex
        })
    },
    onInput: function(event) {
        this.setData({
            commentValue: event.detail.value.trim()
        })
    },
    onShow: function() {
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.record'] === true) {
                    this.setData({
                        authorize: true
                    })
                }
            }
        })
    },
    addVoice: function() {
        var _this = this;
        var state = this.data.recordState;
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.record'] === false) {
                    wx.showModal({
                        title: '提示',
                        content: '请授权我们获取您的录音权限',
                        showCancel: false,
                        success: () => {
                            this.setData({
                                authorize: false
                            })
                        }
                    })
                } else {
                    recorderManager.onStart(() => { // 录音开始回调
                        console.log('recorder start')
                        _this.setData({
                            recordState: 1 // 开始录音时将状态置为1
                        })
                        _this.startTime(t++) // 开始计时
                        timer = setInterval(function() {
                            _this.startTime(t++)
                        }, 1000);
                    })
                    recorderManager.onStop((res) => { // 录音结束回调
                        console.log('recorder stop', res)
                        const {
                            tempFilePath
                        } = res
                        clearInterval(timer) // 结束计时
                        t = 0; // 计时清零
                        _this.setData({
                            buttonText: '录音', // 设置按钮文字为'录音'
                            recordState: 0,  // 将状态置为0
                            tempFilePath: tempFilePath // 存储获取的录音文件地址 
                        })
                        // 通过参数形式传递的时候因为录音文件的地址包含'&'和'='，在跳转的页面里面获取到的录音文件传地址错误，所以采取storage方式传递录音文件的地址
                        wx.setStorage({
                            key: 'tempFile',
                            data: res
                        })
                    })

                    if (state == 0) {
                        recorderManager.start(options)
                    } else if (state == 1) {
                        recorderManager.stop()
                    }
                }
            }
        })
    },
    startTime: function(t) { // 录音计时
        var a = '';
        if (String(t).length == 1) {
            a = '0' + t
        } else {
            a = t
        }
        this.setData({
            buttonText: `00:${a}`
        })
    },
    toPreview: function() { //进入评论预览页面
        let movie = this.data.movie;
         if(this.data.recordState == 1){ // 如果点击完成时录音还为结束不跳转到评论详情页
            wx.showModal({
                title: '提示',
                content: '正在录音，请结束录音后再完成！',
                showCancel: false
            })
         } else if (this.data.commentValue == '' && this.data.tempFilePath == '') { // 判断文字评论或录音是否为空，为空的时候不跳转到评论详情页
             wx.showModal({
                 title: '提示',
                 content: '您还未发表任何内容！',
                 showCancel: false
             })
         }else{
            wx.navigateTo({
                url: `/pages/previewComment/previewComment?id=${movie.id}&title=${movie.title}&image=${movie.image}&tapIndex=${this.data.tapIndex}&commentValue=${this.data.commentValue}`
            })
        }
    }

})