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
    latitude: "23.099994"
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  /*    自定义函数    */

  // 自动登录
  doAutoLogin () {
    if (!!pomelo.isLogin) {
      this.setState({isLogin: true});
      this.doRecoveryTrip();
      return;
    }
    // 检查本地是否有LoginToken
    const loginToken = Taro.getStorageSync('LOGIN_TOKEN');
    if (!loginToken) { return }

    var self = this;

    Taro.showLoading({ title: '自动登录...', mask: true });
    pomelo.entry(loginToken, function(err) {
      if (!!err) {
        pomelo.reInit(function() {
          Taro.reLaunch({url: '/pages/index/index'})
        })
      } else {
        self.setState({isLogin: true});
        Taro.hideLoading();
        self.doRecoveryTrip();
      }
    });
  }

  // 恢复行程
  doRecoveryTrip () {
    Taro.showLoading({ title: '查询可恢复行程', mask: true });
    pomelo.queryUnfinished(function(err, ordernumber) {
      if (!!err) {
        pomelo.reInit(function() {
          Taro.reLaunch({url: '/pages/index/index'})
        })
      } else {
        Taro.hideLoading();
        if (!!ordernumber) {
          console.log('有可恢复行程', ordernumber);
          // 改变当前状态
        }
      }
    });
  }

  // 获取用户信息
  onGotUserInfo (e) {
    if (!!pomelo.isLogin) {
      this.setState({isLogin: true});
      this.doRecoveryTrip();
      return;
    }
    
    Taro.showLoading({ title: '登录中...', mask: true });
    // 这里做成异步流
    var self = this;
    async.waterfall([
      function(_cb) {
        if (e.detail.userInfo) {
          _cb(null, e.detail.userInfo.nickName, e.detail.userInfo.avatarUrl);
        } else {
          _cb('获取用户信息错误');
        }
      },
      function(_nickName, _avatarUrl, _cb) {
        Taro.login({
          success: function(res) {
            console.log('wx.login code:', res.code);
            if (!!res.code) {
              _cb(null, _nickName, _avatarUrl, res.code);
            } else {
              _cb('code为空');
            }
          },
          fail: function() {
            _cb('微信端获取code失败');
          }
        });
      },
      function(_nickName, _avatarUrl, _code, _cb) {
        pomelo.loginByWeapp(_code, _nickName, _avatarUrl, function(_err, _token) {
          _cb(_err, _token);
        });
      }],
      function(_err, _token) {
        if (!!_err) {
          pomelo.reInit(function() {
            Taro.reLaunch({url: '/pages/index/index'})
          })
        } else {
          Taro.setStorageSync('LOGIN_TOKEN', _token);
          self.setState({isLogin: true});
          Taro.hideLoading();
          self.doRecoveryTrip();
        }
    })
  }

  // 地图放大
  mapScale_enlargement() {
    if (this.state.mapScale < 20) {
      this.setState({mapScale:(this.state.mapScale + 1)})
    }
  }
  // 地图缩小
  mapScale_reduction() {
    if (this.state.mapScale > 5) {
      this.setState({mapScale:(this.state.mapScale - 1)})
    }
  }
  // 地图上显示当前位置
  showLocation() {
    var self = this
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function(res) {
        var _latitude = res.latitude
        var _longitude = res.longitude
        console.log(_latitude, _longitude)
        self.setState({
          longitude:_longitude + "", 
          latitude:_latitude + ""
        })
        // self.mapCtx.moveToLocation()
      }
    })
    // this.mapCtx.moveToLocation()
    // console.log(this.state.longitude, this.state.latitude)
    // 上传位置
  }

  // 开始上传当前位置
  startUploadLocation() {}

  // 结束上传当前位置
  stopUploadLocation() {} 

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
            <Button style='position:absolute; left:0; top:0; right:0; bottom:0; margin:auto; width:99%; height:99%;' onClick={this.showLocation.bind(this)} hoverClass='none'>⊙</Button>
          </CoverView>

        </map>

      </View>
    )
  }
}

