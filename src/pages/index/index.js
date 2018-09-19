// index改为落地页 根据url选择跳转页面,默认为首页,可达行程创建页、行程房间页

import Taro, { Component } from '@tarojs/taro'
import { View, Button, CoverView, CoverImage } from '@tarojs/components'
import { AtButton, AtModal, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui'
import { connect } from '@tarojs/redux'
import '@tarojs/async-await'

import { add, minus, asyncAdd, login } from '../../actions/counter'

import pomelo from 'pomelo-weixin-client'
import async from 'async'

import './index.scss'

import follow_icon from './images/follow.png'
import my_icon from './images/my.png'
import trip_icon from './images/trip.png'

@connect(({ counter }) => ({
  counter
}), (dispatch) => ({
  add () {
    dispatch(add())
  },
  dec () {
    dispatch(minus())
  },
  asyncAdd () {
    dispatch(asyncAdd())
  },
  login (token) {
    dispatch(login(token))
  }
}))
class Index extends Component {
  config = {
    navigationBarTitleText: '平安到家'
  }

  state = {
    isLogin: false,
    mapScale : '14',
    longitude: "113.324520",
    latitude: "23.099994",
    isLoginModalShow: false,
    isFirst: true
  }

  componentDidMount() {
    // redirectTo('pages/login/index')
    // 恢复业务
    this.doRecovery(()=>{});
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () { 
    this.mapCtx = wx.createMapContext('map')
    this.showLocation()
  }

  // 恢复业务
  doRecovery(callback) {
    var self = this;
    async.waterfall([
      function(_cb) {
        // 初始化pomelo
        self.initPomelo(function() {
          _cb();
        });
      },
      function(_cb) {
        // 自动登录
        if (!!self.state.isLogin) {
          _cb();
        } else {
          self.doAutoLogin(function(_err) {
            _cb(_err);
          });
        }
      },
      function(_cb) {
        // 查询是否有未完成行程
        if (self.state.isLogin) {
          self.checkUnfinishedTripOrder(function(_err, _orderNumber) {
            _cb(_err, _orderNumber);
          });
        } else {
          _cb(null);
        }
      }
    ], function(_err, _orderNumber) {
      if (!!_err) {
        Taro.showToast({
          title: ''+_err,
          icon: 'none',
          duration: 2000
        });
        setTimeout(() => {
          self.doRecovery(()=>{});
        }, 2000);
      } else {
        console.log('恢复业务成功');
        if (!!_orderNumber) {
          console.log('有未完成的行程订单: '+_orderNumber);
        }
        callback();
      }
    });
  }

  // 地图放大
  mapScale_enlargement() {
    var scale = Number(this.state.mapScale)
    console.log(scale)
    if (scale < 20) {
      this.setState({mapScale:(scale + 1) + ""})
    }
  }
  // 地图缩小
  mapScale_reduction() {
    var scale = Number(this.state.mapScale)
    console.log(scale)
    if (scale > 5) {
      this.setState({mapScale:(scale - 1) + ""})
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
          latitude:_latitude + "",
          mapScale:"18"
        })
        self.mapCtx.moveToLocation()
      }
    })
  }

  // 关闭当前页面，跳转到应用内的某个页面
  redirectTo(url) {
    Taro.redirectTo({url:url})
  }

  // 初始化Pomelo实例
  initPomelo(callback) {
    var self = this
    
    if (!!pomelo.isReady) {
      callback();
      return;
    } else {
      Taro.showLoading({ title: '初始化...', mask: true });
      pomelo.init({
        host: 'jerrysir.com/',
        port: 3010
      }, function() {
        Taro.hideLoading();
        pomelo.isReady = true;
        pomelo.isRunning = false;
        console.log('pomelo init success.');
        Taro.hideLoading();
        callback();
      });
    }

    // 设置响应
    // io-error
    // close
    // disconnect
    // onKick
    // error
    // heartbeat timeout
    // reconnect

    pomelo.on('io-error', function(err){
      console.log('io-error', err);
    });

    pomelo.on('close', function(test){
      console.log('close', test);
    });

    pomelo.on('disconnect', function(test){
      console.log('disconnect', test);
      pomelo.isReady = false;
      this.setState({isLogin: false});
    });

    pomelo.on('onKick', function(test){
      console.log('onKick', test);
    });

    pomelo.on('error', function(test){
      console.log('error', test);
    });

    pomelo.on('heartbeat timeout', function(){
      console.log('heartbeat timeout');
      Taro.showLoading({ title: '连接超时...', mask: true });
    });

    pomelo.on('reconnect', function(test){
      console.log('reconnect', test);
    });
  }

  // 自动登录
  doAutoLogin(callback) {
    // 检查本地是否有LoginToken
    const loginToken = Taro.getStorageSync('LOGIN_TOKEN');
    if (!loginToken) {
      callback();
      return;
    }

    var self = this;

    if (!pomelo.isReady) {
      _cb('pomelo 未初始化');
    } else {
      Taro.showLoading({ title: '恢复登录...', mask: true });
      pomelo.request("connector.entryHandler.entry", {token: loginToken}, function(data) {
        console.log(data);
        Taro.hideLoading();
        if (data['code'] !== 200) {
          callback('服务器错误');
        } else if (data['error']) {
          Taro.removeStorageSync('LOGIN_TOKEN'); // 登录出错后需要将缓存的login token删除
          callback(data['msg']);
        } else {
          self.setState({isLogin: true}, ()=> {
            callback();
          });
        }
      });
    }
  }

  // 检查未完成行程订单
  checkUnfinishedTripOrder(callback) {
    Taro.showLoading({ title: '正在检查未完成行程', mask: true });

    var self = this;
    if (!pomelo.isReady) {
      callback('pomelo 未初始化');
    } else {
      pomelo.request("trip.tripHandler.queryUnfinished", {}, function(data) {
        Taro.hideLoading();
        console.log(data);
        if (data['code'] !== 200) {
          callback('服务器错误');
        } else if (data['error']) {
          callback(data['msg']);
        } else {
          callback(null, data['data']['ordernumber']);
        }
      });
    }
  }

  // 创建行程订单
  createTripOrder() {
    this.doRecovery(()=>{
      Taro.showLoading({ title: '创建行程...', mask: true });
      pomelo.request("trip.tripHandler.create", {}, function(data) {
        console.log(data);
        Taro.hideLoading();
        if (data['code'] !== 200) {
          Taro.showToast({ title: '服务器错误', icon: 'none', duration: 2000 });
        } else if (!data['error']) {
          var _orderNumber = data['data']['ordernumber'];
          console.log('创建的行程订单: '+_orderNumber);
        } else {
          Taro.showToast({ title: data['msg'], icon: 'none', duration: 2000 });
        }
      });
    });
  }

  // 获取用户信息
  onGotUserInfo (e) {
    if (e.detail.userInfo) {
      Taro.showLoading({ title: '登录中...', mask: true });
      var self = this;
      this.doLogin(e.detail.userInfo.nickName, e.detail.userInfo.avatarUrl, function(_err) {
        Taro.hideLoading();
        Taro.showToast({
          title: !!_err ? '登录失败: '+_err : '登录成功',
          icon: !!_err ? 'none' : 'success',
          duration: 2000,
          complete: ()=> {
            self.doRecovery(()=>{});
          }
        });
        
      });
    }
  }

  // 用户登录
  doLogin(nickName, avatarUrl, callback) {
    var self = this;
    async.waterfall([
      function(_cb) {
        Taro.login({
          success: function(loginRes) {
            console.log('wx.login code:', loginRes.code);
            if (!!loginRes.code) {
              _cb(null, loginRes.code);
            } else {
              _cb('code为空');
            }
          },
          fail: function() {
            _cb('微信端获取code失败');
          }
        });
      },
      function(_code, _cb) {
        if (!pomelo.isReady) {
          _cb('pomelo 未初始化');
        } else {
          pomelo.request("connector.entryHandler.loginByOtherPlatform", {code: _code, nickName: nickName, avatarURL: avatarUrl}, function(data) {
            console.log(data);
            if (data['code'] !== 200) {
              _cb('服务器错误');
            } else if (!data['error']) {
              _cb(null, data['data']['token']);
            } else {
              _cb(data['msg']);
            }
          });
        }
    }],
    function(_err, _token) {
      Taro.hideLoading();
      
      if (!!_err) {
        callback(_err);
      } else {
        Taro.setStorageSync('LOGIN_TOKEN', _token);
        self.setState({isLogin: true}, () => {
          callback();
        });
      }
    });
  }

  componentDidHide () { }

  render () {
    return (
      <View className='index'>

        <Map className="map"
             longitude={this.state.longitude} latitude={this.state.latitude}
             scale={this.state.mapScale}
             show-location>

          <CoverView class='map-zoom-bg'>
            <Button className='map-zoom-enlargement' onClick={this.mapScale_enlargement.bind(this)} hoverClass='none'>+</Button>
            <Button className='map-zoom-reduction' onClick={this.mapScale_reduction.bind(this)} hoverClass='none'>-</Button>
          </CoverView>
          
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

export default Index
