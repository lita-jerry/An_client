import Taro, { Component, getApp } from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import './index.scss'

import { Get } from "../../util/NetworkUtil";

import follow_icon from './images/follow.png'
import my_icon from './images/my.png'
import trip_icon from './images/trip.png'

import async from 'async'

/* 行程首页 */
export default class Index extends Component {

  config = {
    navigationBarTitleText: '平安到家'
  }

  state = {
    isLogin: false,
    mapScale : 14,
    longitude: "113.324520",
    latitude: "23.099994"
  }

  componentWillMount () {
    console.log('componentWillMount')
  }

  componentDidMount () {
    console.log('componentDidMount')
  }

  componentWillUnmount () {
    console.log('componentWillUnmount')
  }

  componentDidShow () {
    console.log('componentDidShow')

    if (!this.state.isLogin) {
      // 检查本地是否有LoginToken
      const hasLoginToken = Taro.getStorageSync('LOGIN_TOKEN');
      if (!!hasLoginToken) {
        Taro.showLoading({ mask: true })
        this.doCheckLoginToken((err) => {
          Taro.hideLoading()
          if (!!err) {
            Taro.showToast({title: err, icon: 'none', duration: 2000})
          }
        })
      }
    }
    
    this.mapCtx = wx.createMapContext('myMap');
    var self = this;
    setTimeout(() => {
      self.showCurrentLocation();
    }, 1000);
  }

  componentDidHide () {
    console.log('componentDidHide')
  }

  /*    自定义函数    */

  // 校验loginToken
  doCheckLoginToken (callback) {
    if (!!this.state.isLogin) { return }

    var self = this;
    Get('/user/wxmp/check', null, true, (data) => {
      console.log(data)
      if (data.code != 200) {
        Taro.setStorageSync('LOGIN_TOKEN', null);
        callback('Token已失效')
      } else {
        self.setState({isLogin: true}, ()=>{
          self.doRecoveryTrip(callback);
        });
      }
    })
  }

  // 恢复行程
  doRecoveryTrip (callback) {
    Taro.showLoading({ title: '查询可恢复行程', mask: true })

    var self = this;
    Get('/trip/wxmp/unfinished', null, true, (result)=> {
      Taro.hideLoading()
      if (result.code === 200 && result.ordernumber !== "") {
        self.toTripping(result.ordernumber);
      }
    })
  }

  // 创建行程
  createTrip() {
    Taro.showLoading({ title: '创建行程', mask: true });
    
    var self = this;
    Get('/trip/wxmp/create', null, true, (result)=> {
      Taro.hideLoading()
      if (result.code === 200 && result.ordernumber !== "") {
        self.toTripping(result.ordernumber);
      }
    })
  }

  // 跳转到tripping
  toTripping(ordernumber) {
    Taro.reLaunch({url: '/pages/trip/tripping?ordernumber='+ordernumber});
  }

  // 跳转到follow
  toFollow() {
    Taro.navigateTo({url: '/pages/user/follow'});
  }

  // 跳转到my
  toMy() {
    Taro.navigateTo({url: '/pages/user/my'});
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
        Get('/user/wxmp/login', {nickname:_nickName, avatarurl:_avatarUrl, code:_code}, false, (result)=>{
          if (result.code === 200) {
            _cb(null, result.token)
          } else {
            _cb(result.msg, null)
          }
        })
      }],
      function(_err, _token) {
        Taro.hideLoading();
        if (!_err) {
          Taro.setStorageSync('LOGIN_TOKEN', _token);
          self.setState({isLogin: true}, ()=>{
            self.doRecoveryTrip();
          });
        } else {
          console.log(_err)
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

                  <CoverView className='map-tool-left-box' onClick={this.toFollow}>
                    <CoverImage src={follow_icon} class='map-tool-box-image' />
                    <CoverView class='map-tool-box-text'>关注</CoverView>
                  </CoverView>

                  <CoverView style="width: 66PX;"> </CoverView>

                  <CoverView className='map-tool-right-box' onClick={this.toMy}>
                    <CoverImage src={my_icon} class='map-tool-box-image' />
                    <CoverView class='map-tool-box-text'>设置</CoverView>
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

