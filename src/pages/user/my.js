import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { AtAvatar, AtList, AtListItem } from 'taro-ui'

import './index.scss'

import polyline_icon from './images/polyline.png'

// import pomelo from 'pomelo-weixin-client'
// import pomeloUtil from '../../util/pomelo'

/* 我的 用户中心 */
export default class Index extends Component {

  config = {
    navigationBarTitleText: '安全到家'
  }

  state = {
    nickName: '',
    avatarUrl: '',
    gender: 0,
    // isConnect: false,
    // eventIntervalId: null,
  }

  tabChangedHandle (value) {
    // var self = this;
    // this.setState({currentTab: value}, ()=>{
    //   self.reloadData();
    // });
  }

  componentWillMount () {
    // var self = this;
    // pomelo.on('disconnect', function(err){
    //   console.log('follow page: on pomelo disconnect:', err);
    //   self.setState({isConnect: false});

    //   Taro.showLoading({ title: '重新连接', mask: true });
    // });
  }

  componentDidMount () { }

  componentWillUnmount () {
    // clearInterval(this.state.eventIntervalId);
    // pomelo.removeAllListeners();
    // pomelo.disconnect();
  }

  componentDidShow () {
    var self = this;
    
    if (!Taro.getStorageSync('LOGIN_TOKEN')) {
      self.reLaunchToIndex();
    }

    // 循环事件
    // var eventIntervalId = setInterval(()=>{
    //   if (!self.state.isConnect) {
    //     self.doConnect();
    //   }
    // }, 3000);

    // this.setState({eventIntervalId: eventIntervalId}, ()=> {
    //   self.doConnect();
    // });

    this.getInfo();
  }

  componentDidHide () {
    // clearInterval(this.state.eventIntervalId);
    // this.setState({eventIntervalId: null});
    // pomelo.disconnect();
  }

  /*    自定义函数    */

  // pomelo连接
  doConnect () {

    if (!!this.state.isConnect) {
      Taro.hideLoading();
      return;
    };

    var self = this;
    pomeloUtil.init(pomelo, function(err) {
      if (!!err) {
        self.setState({isConnect: false});
      } else {
        Taro.hideLoading();
        self.setState({isConnect: true}, ()=> {
          // self.reloadData();
        });
      }
    });
  }

  // reloadData() {
  //   if (!this.state.isConnect) { return }

  //   var self = this;

  // }

  getInfo() {
    var self = this;
    // 必须是在用户已经授权的情况下调用
    wx.getUserInfo({
      success: function(res) {
        var userInfo = res.userInfo
        var nickName = userInfo.nickName
        var avatarUrl = userInfo.avatarUrl
        var gender = userInfo.gender //性别 0：未知、1：男、2：女
        // var province = userInfo.province
        // var city = userInfo.city
        // var country = userInfo.country
        self.setState({
          nickName: nickName,
          avatarUrl: avatarUrl,
          gender: gender
        })
      }
    })
  }

  // 跳转到历史行程列表
  toTripList() {
    console.log('toTripList')
    Taro.navigateTo({url: '/pages/user/myTrip'});
  }

  // 关闭当前页,返回到index页面,一般用于出错时
  reLaunchToIndex() {
    Taro.reLaunch({url: '/pages/index/index'});
  }

  render () {

    return (
      <View className='page'>
        {/* 个人信息 */}
        <View className='user-info-bg'>
          <AtAvatar circle image={this.state.avatarUrl}></AtAvatar>
          <Text style='margin-top:20px; color:gray;'>{this.state.nickName}</Text>
        </View>
        {/* 菜单 */}
        <AtList style='flex:1'>
          <AtListItem
              title='我的行程'
              arrow='right'
              onClick={this.toTripList}
              thumb={polyline_icon}
            />
        </AtList>
        {/* 切换账号 */}
        {/* <Text className='log-out-bg'>注销登录</Text> */}
      </View>
    )
  }
}

