import Taro, { Component, getApp } from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
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
    navigationBarTitleText: 'Project1'
  }

  state = {
    isConnect: false,
    isLogin: false,
    eventIntervalId: null,
    mapScale : 14,
    longitude: "113.324520",
    latitude: "23.099994"
  }

  componentWillMount () {
    this.addPomeloHandler();
  }

  componentDidMount () { }

  componentWillUnmount () {
    clearInterval(this.state.eventIntervalId);
    
    this.removePomeloHandler();
    pomelo.disconnect();
  }

  componentDidShow () {
    var self = this;
    // 循环事件
    var eventIntervalId = setInterval(()=>{
      if (!self.state.isConnect) {
        self.doConnect();
        console.log('重新登录了');
      }
    }, 3000);

    this.setState({eventIntervalId: eventIntervalId}, ()=> {
      self.doConnect();

      self.mapCtx = wx.createMapContext('myMap');
      setTimeout(() => {
        self.showCurrentLocation();
      }, 1000);
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
    pomeloUtil.init(pomelo, function(err) {
      if (!!err) {
        self.setState({isConnect: false, isLogin: false});
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
    pomeloUtil.checkLoginToken(pomelo, loginToken, function(err) {
      if (!!err) {
        console.log(err);
        Taro.setStorageSync('LOGIN_TOKEN', null);
      } else {
        self.setState({isLogin: true}, ()=>{
          self.doRecoveryTrip();
        });
      }
    });
  }

  // 恢复行程
  doRecoveryTrip () {
    Taro.showLoading({ title: '查询可恢复行程', mask: true });

    var self = this;
    pomeloUtil.queryUnfinished(pomelo, Taro.getStorageSync('LOGIN_TOKEN'), function(err, ordernumber) {
      Taro.hideLoading();
      if (!err && !!ordernumber) {
        self.toTripping(ordernumber);
      }
    });
  }

  // 创建行程
  createTrip() {
    Taro.showLoading({ title: '创建行程', mask: true });
    
    var self = this;
    pomeloUtil.create(pomelo, Taro.getStorageSync('LOGIN_TOKEN'), function(err, ordernumber) {
      Taro.hideLoading();
      if (!err && !!ordernumber) {
        self.toTripping(ordernumber);
      }
    });
  }

  // 跳转到tripping
  toTripping(ordernumber) {
    Taro.reLaunch({url: '/pages/tripping/index?ordernumber='+ordernumber});
  }

  // 获取用户信息
  onGotUserInfo (e) {

    if (this.state.isLogin) { return }

    Taro.showLoading({ title: '登录中', mask: true });

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
            if (!!res.code) {
              _cb(null, _nickName, _avatarUrl, res.code);
            } else {
              _cb('wx.login code为空');
            }
          },
          fail: function() {
            _cb('微信端获取code失败');
          }
        });
      },
      function(_nickName, _avatarUrl, _code, _cb) {
        pomeloUtil.loginByWeapp(pomelo, _code, _nickName, _avatarUrl, function(err, token) {
          _cb(err, token);
        });
      }],
      function(_err, _token) {
        Taro.hideLoading();
        if (!_err) {
          Taro.setStorageSync('LOGIN_TOKEN', _token);
          self.setState({isLogin: true}, ()=>{
            self.doRecoveryTrip();
          });
        }
    });
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

  // 添加pomelo监听响应
  addPomeloHandler() {
    var self = this;
    pomelo.on('disconnect', function(err){
      // console.log('on pomelo disconnect:', err);
      console.error('on pomelo disconnect:', err);
      self.setState({isConnect: false, isLogin: false});
      Taro.showLoading({ title: '尝试重新连接', mask: true });
    });
  }

  // 移除pomelo监听响应
  removePomeloHandler() {
    pomelo.removeAllListeners();
  }

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
          {
            this.state.isLogin
            ? <CoverView class='map-tool-bar-bg'>

                <CoverView class='map-tool-box-bg'>

                  <CoverView className='map-tool-left-box'>
                    <CoverImage src={follow_icon} class='map-tool-box-image' />
                    <CoverView class='map-tool-box-text'>我的关注</CoverView>
                  </CoverView>

                  <CoverView style="width: 66PX;"> </CoverView>

                  <CoverView className='map-tool-right-box'>
                    <CoverImage src={my_icon} class='map-tool-box-image' />
                    <CoverView class='map-tool-box-text'>设置中心</CoverView>
                  </CoverView>
                  
                </CoverView>

                <CoverView class='start-bg' >
                  <CoverImage className='start-icon' src={trip_icon} onClick={this.createTrip} />
                </CoverView>

              </CoverView>

            : <CoverView className='unlogin-bg'><Button openType="getUserInfo" lang="zh_CN" onGetUserInfo={this.onGotUserInfo.bind(this)} type='primary' >小程序快捷登录</Button></CoverView>
          }

          <CoverView className='map-show-location-bg'>
            <Button className='map-show-location-btn' onClick={this.showCurrentLocation.bind(this)} hoverClass='none'>⊙</Button>
          </CoverView>

        </Map>

      </View>
    )
  }
}

