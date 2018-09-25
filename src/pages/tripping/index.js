import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtCard, AtButton } from "taro-ui"
import './index.scss'

import follow_icon from './images/follow.png'
import my_icon from './images/my.png'
import trip_icon from './images/trip.png'

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

        {/* <View className="info-bg">
          <Text>行驶中</Text>
          <Text>2018年09月24日23:02:11 开始</Text>
          <Text>20 分钟</Text>
          <Text>行驶时间</Text>
          <Text>20 km</Text>
          <Text>已行驶距离</Text>
          <Text>10 km/h</Text>
          <Text>行驶速度</Text>
        </View> */}
        <AtCard
        className="info-bg"
        title='行驶中'
        extra='9月24日23:24'
        isFull={true}
        thumb='http://www.logoquan.com/upload/list/20180421/logoquan15259400209.PNG'>
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

        <Map id="myMap"
             className="map"
             longitude={this.state.longitude} latitude={this.state.latitude}
             scale={this.state.mapScale+''}
             show-location>
          
          <CoverView class='map-tool-bar-bg'>

            <CoverView class='map-tool-box-bg'>

              <CoverView className='map-tool-left-box'>
                <CoverImage src={follow_icon} class='map-tool-box-image' />
                <CoverView class='map-tool-box-text'>我的关注</CoverView>
                {
                  !this.state.isLogin
                  && <Button className='map-tool-left-box-unlogin' openType="getUserInfo" lang="zh_CN" onGetUserInfo={this.onGotUserInfo.bind(this)} type='primary' ></Button>
                }
              </CoverView>
              
              <CoverView className='map-tool-right-box'>
                <CoverImage src={my_icon} class='map-tool-box-image' />
                <CoverView class='map-tool-box-text'>我的</CoverView>
                {
                  !this.state.isLogin
                  && <Button className='map-tool-right-box-unlogin' openType="getUserInfo" lang="zh_CN" onGetUserInfo={this.onGotUserInfo.bind(this)} type='primary' ></Button>
                }
              </CoverView>
              
            </CoverView>

            <CoverView class='start-bg' >
              <CoverImage className='start-icon' src={trip_icon} onClick={this.createTripOrder} />
              {
                !this.state.isLogin
                && <Button className='start-icon-unlogin' openType="getUserInfo" lang="zh_CN" onGetUserInfo={this.onGotUserInfo.bind(this)} type='primary' ></Button>
              }
            </CoverView>

          </CoverView>

          <CoverView className='map-show-location-bg'>
            <Button className='map-show-location-btn' onClick={this.showLocation.bind(this)} hoverClass='none'>⊙</Button>
          </CoverView>

        </Map>

      </View>
    )
  }
}

