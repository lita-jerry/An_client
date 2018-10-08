import Taro, { Component, getApp } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './index.scss'

import follow_icon from './images/follow.png'
import my_icon from './images/my.png'
import trip_icon from './images/trip.png'

import async from 'async'
import pomelo from 'pomelo-weixin-client'

import pomeloUtil from '../../util/pomelo'

/* 行程首页 */
export default class Index extends Component {

  config = {
    navigationBarTitleText: '平安到家'
  }

  state = {
    isLogin: false,
    isConnect: false,
    eventIntervalId: null,
    mapScale : 14,
    longitude: "113.324520",
    latitude: "23.099994"
  }

  componentWillMount () {
    var self = this;
    pomelo.on('disconnect', function(value){
      console.log('on pomelo disconnect:', value);
      self.setState({isConnect: false, isLogin: false});
      Taro.showLoading({ title: '尝试重新连接...', mask: true });
    });
  }

  componentDidMount () { }

  componentWillUnmount () {
    clearInterval(this.state.eventIntervalId);
    pomelo.disconnect();
  }

  componentDidShow () {
    var self = this;
    // 循环事件
    var eventIntervalId = setInterval(()=>{
      if (!self.state.isConnect) {
        self.doConnect();
      }
    }, 3000);

    this.setState({eventIntervalId: eventIntervalId}, ()=> {
      self.doConnect();

      self.mapCtx = wx.createMapContext('myMap');
      self.showCurrentLocation();
    });
  }

  componentDidHide () {
    clearInterval(this.state.eventIntervalId);
    pomelo.disconnect();
  }

  /*    自定义函数    */

  // pomelo连接
  doConnect () {

    if (!!this.state.isConnect) {
      Taro.hideLoading();
      this.doCheckLoginToken();
      return;
    };

    var self = this;
    pomeloUtil.init(pomelo, function(_err) {
      if (!!_err) {
        self.setState({isConnect: false, isLogin: false});
        Taro.showLoading({ title: '断开连接...', mask: true });
      } else {
        Taro.hideLoading();
        self.setState({isConnect: true});
        self.doCheckLoginToken();
      }
    });
  }

  // 校验loginToken
  doCheckLoginToken () {
    if (!!this.state.isLogin) { return }

    // 检查本地是否有LoginToken
    const loginToken = Taro.getStorageSync('LOGIN_TOKEN');
    if (!loginToken) { return }

    var self = this;
    pomeloUtil.checkLoginToken(pomelo, loginToken, function(_err) {
      if (!!_err) {
        console.log(_err);
        Taro.setStorageSync('LOGIN_TOKEN', null);
      } else {
        self.setState({isLogin: true});
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
          // 跳转到tripping
          Taro.reLaunch({url: '/pages/tripping/index?ordernumber='+ordernumber})
        }
      }
    });
  }

  // 创建行程
  createTrip() {
    Taro.showLoading({ title: '创建行程', mask: true });
    pomelo.createTrip(function(err, ordernumber) {
      if (!!err) {
        pomelo.reInit(function() {
          Taro.reLaunch({url: '/pages/index/index'})
        })
      } else {
        Taro.hideLoading();
        if (!!ordernumber) {
          // 跳转到tripping
          Taro.reLaunch({url: '/pages/tripping/index?ordernumber='+ordernumber})
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
  showCurrentLocation() {
    this.mapCtx.moveToLocation();
  }

  // 开始上传当前位置
  startUploadLocation() {}

  // 结束上传当前位置
  stopUploadLocation() {} 

  render () {
    return (
      <View className='index'>

        <Map id="myMap"
             className="map"
             longitude={this.state.longitude} latitude={this.state.latitude}
             scale={this.state.mapScale+''}
             show-location>

          {/* <CoverView class='map-zoom-bg'>
            <Button className='map-zoom-enlargement' onClick={this.mapScale_enlargement.bind(this)} hoverClass='none'>+</Button>
            <Button className='map-zoom-reduction' onClick={this.mapScale_reduction.bind(this)} hoverClass='none'>-</Button>
          </CoverView> */}
          
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
              <CoverImage className='start-icon' src={trip_icon} onClick={this.createTrip} />
              {
                !this.state.isLogin
                && <Button className='start-icon-unlogin' openType="getUserInfo" lang="zh_CN" onGetUserInfo={this.onGotUserInfo.bind(this)} type='primary' ></Button>
              }
            </CoverView>

          </CoverView>

          <CoverView className='map-show-location-bg'>
            <Button className='map-show-location-btn' onClick={this.showCurrentLocation.bind(this)} hoverClass='none'>⊙</Button>
          </CoverView>

        </Map>

      </View>
    )
  }
}

