import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtCard, AtButton } from "taro-ui"
import './index.scss'

import { Get } from "../../util/NetworkUtil";

import async from 'async'

/* 观察者模式 进入页 */
export default class Index extends Component {

  config = {
    navigationBarTitleText: '进入行程房间'
  }

  state = {

    // isReady: false,
    isLogin: false,

    // isConnect: false,
    // isEntry: false,
    eventIntervalId: null,

    isCreator: false,
    ordernumber: null,
    
    mapScale : 14,
    longitude: "113.324520",
    latitude: "23.099994",
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () {
    // 获取行程订单编号
    if (!this.$router.params['ordernumber']) {
      this.reLaunchToIndex();
    }
    this.setState({ordernumber: this.$router.params['ordernumber']});
    this.mapCtx = wx.createMapContext('myMap');

    var self = this
    if (!this.state.isLogin) {
      // 检查本地是否有LoginToken
      const hasLoginToken = Taro.getStorageSync('LOGIN_TOKEN');
      if (!!hasLoginToken) {
        Taro.showLoading({ mask: true })
        this.doCheckLoginToken((err) => {
          Taro.hideLoading()
          if (!!err) {
            Taro.showToast({title: err, icon: 'none', duration: 2000})
          } else {
            self.getTripInfo()
          }
        })
      }
    }
  }

  componentDidHide () { }

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
          callback(null)
        });
      }
    })
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
            // 获取行程信息
            self.getTripInfo();
          });
        }
    });
  }

  // 刷新当前状态,在地图上显示最后出现的位置
  refreshStatus() {
    console.log(this.state);
  }

  // 进入房间
  entry() {
    if (this.state.isCreator) {
      Taro.reLaunch({url: '/pages/trip/tripping?ordernumber='+this.state.ordernumber});
    } else {
      Taro.navigateTo({url: '/pages/trip/watching?ordernumber='+this.state.ordernumber});
    }
    // 清空ordernumber,如果navigator返回的话在这里不做停留
    this.$router.params['ordernumber'] = null;
  }
  
  // 获取行程信息
  getTripInfo() {
    var self = this;
    Get('/trip/wxmp/info', { ordernumber:this.state.ordernumber }, true, (result)=> {
      if (result.code === 200) {
        self.setState({
          isCreator: result.iscreator,
          longitude: result.lastlocation.longitude,
          latitude: result.lastlocation.latitude
        }, ()=> {
          self.refreshStatus();
        })
      } else {
        self.reLaunchToIndex()
      }
    })
  }

  // 关闭当前页,返回到index页面,一般用于出错时
  reLaunchToIndex() {
    Taro.reLaunch({url: '/pages/index/index'});
  }

  render () {
    return (
      <View className='index'>
        
        <map id="myMap"
             style='display:flex; left:0; top:0; width:100vw; height:100vh; '
             longitude={this.state.longitude} latitude={this.state.latitude}
             scale={this.state.mapScale+''}
             show-location = {false}>
 
          <CoverView style='position:fixed; left:0; right:0; margin:auto; bottom:25PX; width:80vw; height:70PX;'>
          {
            this.state.isLogin
            ? <Button lang="zh_CN" onClick={this.entry} type='primary' >进入房间</Button>
            : <Button openType="getUserInfo" lang="zh_CN" onGetUserInfo={this.onGotUserInfo.bind(this)} type='primary' >小程序快捷登录</Button>
          }
          </CoverView>

        </map>

      </View>
    )
  }
}

