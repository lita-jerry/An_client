import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtCard, AtButton } from "taro-ui"
import './index.scss'

import icon_spin_s from './images/icon-spin-s.png'
import sos_icon from './images/sos.png'
import trip_icon from './images/trip.png'
import security_icon from './images/security.png'

import async from 'async'
import pomelo from 'pomelo-weixin-client'

/* 行程首页 */
export default class Index extends Component {

  config = {
    navigationBarTitleText: '我的行程'
  }

  state = {
    isLogin: false,
    mapScale : 14,
    longitude: "113.324520",
    latitude: "23.099994",
    keepIntervalId: null,
    uploadIntervalId: null
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () {
    // 获取行程订单编号
    console.log(this.$router.params);
    // 检查登录情况
    if (!pomelo.isLogin) {
      Taro.reLaunch({url: '/pages/index/index'});
    }
  }

  componentDidHide () { }

  /*    自定义函数    */

  // 进入行程房间
  entryTrippingRoom() { }

  // 开始上传当前位置的定时任务
  startUploadLocationInterval() {
    var self = this
    var uploadIntervalId = setInterval(()=>{
      wx.getLocation({
        type: 'gcj02', //返回可以用于wx.openLocation的经纬度
        success: function(res) {
          console.log(res.latitude, res.longitude)
          self.setState({
            longitude:res.longitude + "", 
            latitude:res.latitude + ""
          })
          // 上传位置
        }
      });
    }, 3000);
    this.setState({uploadIntervalId: uploadIntervalId});
  }

  // 结束上传当前位置的定时任务
  stopUploadLocationInterval() {
    clearInterval(this.state.uploadIntervalId);
    this.setState({uploadIntervalId: null});
  }

  // 添加监听事件Handler
  addChannelHandler() { }

  // 移除监听事件Handler
  removeChannelHandler() { }

  // 保持当前位置在地图中央
  keepCurrentLocationOnScreenCenter() {
    var self = this;
    var keepIntervalId = setInterval(()=>{
      self.mapCtx.moveToLocation();
    }, 1000);
    this.setState({keepIntervalId: keepIntervalId});
  }

  // 取消当前位置在地图中央
  cancelCurrentLocationOnScreenCenter() {
    clearInterval(this.state.keepIntervalId);
    this.setState({keepIntervalId: null});
  }

  // 结束行程
  endTrip() {
    // 停止上传位置的定时任务
    this.stopUploadLocationInterval();
    // 移除监听事件Handler
    this.removeChannelHandler();
    // 停止保持当前位置在屏幕中央
    this.cancelCurrentLocationOnScreenCenter()
    // 显示所有坐标点
  }

  render () {
    return (
      <View className='index'>
        <AtCard
        className="info-bg"
        title='行驶中'
        extra='9月24日23:24'
        isFull={true}
        thumb={security_icon}>
          <div style='display:flex; flex-direction:column; left:0; right:0; height:19vh; align-items:center;'>
            <div style='display:flex; flex-direction:row; justify-content:space-around; left:0; right:0; margin:auto; width:90vw; height:9vh;'>

              <div style='width:10vh; height:10vh;'>
                <div style='display:flex; flex-direction:row; align-items:center; justify-content:center;'>
                  <text style='font-size:150%; text-align:center; color:#53505F'>20</text>
                  <text style='font-size:90%; text-align:center; color:#535257'>分钟</text>
                </div>
                <div style='display:flex; justify-content:center;'>
                  <text style='color:#878787'>行驶时间</text>
                </div>
              </div>

              <div style='width:10vh; height:10vh;'>
                <div style='display:flex; flex-direction:row; align-items:center; justify-content:center;'>
                  <text style='font-size:150%; text-align:center; color:#53505F'>20</text>
                  <text style='font-size:90%; text-align:center; color:#535257'>km</text>
                </div>
                <div style='display:flex; justify-content:center;'>
                  <text style='color:#878787'>行驶距离</text>
                </div>
              </div>

              <div style='width:10vh; height:10vh;'>
                <div style='display:flex; flex-direction:row; align-items:center; justify-content:center;'>
                  <text style='font-size:150%; text-align:center; color:#53505F'>20</text>
                  <text style='font-size:90%; text-align:center; color:#535257'>km/h</text>
                </div>
                <div style='display:flex; justify-content:center;'>
                  <text style='color:#878787'>行驶速度</text>
                </div>
              </div>
            </div>

            <div style='display:flex; flex-direction:row; justify-content:space-around; left:0; right:0; margin:auto; width:90vw; height:6vh;'>
              <AtButton type='primary' size='normal' style='width:50vw;'>结束行程</AtButton>
              <AtButton type='secondary'>分享</AtButton>
            </div>

          </div>
        </AtCard>

        <map id="myMap"
             style='display:flex; left:0; top:0; width:100vw; height:71vh;'
             longitude={this.state.longitude} latitude={this.state.latitude}
             scale={this.state.mapScale+''}
             show-location>
 
          <CoverView style='position:flex; position:absolute; bottom:25PX; width:100vw; height:90PX;'>
            {/* <view style='position: absolute; z-index:199; left:0; top:0; width: 74PX; height: 74PX; background: url(images/icon-spin-s.png) no-repeat; animation: spin 800ms infinite linear;'></CoverView> */}
            <CoverView style='position:absolute; left:0; top:0; right:0; bottom:0; margin:auto; width:66PX; height:66PX; background-color:white; border:2PX solid #DC143C; border-radius:33PX; box-shadow: 0 0 15PX #4E4E4E;' >
                <CoverImage style='position:absolute; left:0; top:0; right:0; bottom:0; margin:auto; width:66%; height:66%;' src={sos_icon} onClick={this.createTripOrder} />
            </CoverView>
          </CoverView>

          <CoverView style='position:fixed; bottom:122PX; left:10PX; z-index:99; width:44PX; height:44PX;'>
            <Button style='position:absolute; left:0; top:0; right:0; bottom:0; margin:auto; width:99%; height:99%;' onClick={this.keepCurrentLocationOnScreenCenter.bind(this)} hoverClass='none'>⊙</Button>
          </CoverView>

        </map>

      </View>
    )
  }
}

