import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { AtSegmentedControl, AtAvatar } from 'taro-ui'

import './index.scss'

import pomelo from 'pomelo-weixin-client'
import pomeloUtil from '../../util/pomelo'

/* 我的关注、关注我的 */
export default class Index extends Component {

  config = {
    navigationBarTitleText: '平安到家'
  }

  state = {
    isConnect: false,
    eventIntervalId: null,

    currentTab: 0, // 0: 我关注的人; 1: 关注我的人
    followerList: [], // 我关注的人
    followingList: [], // 关注我的人
  }

  tabChangedHandle (value) {
    var self = this;
    this.setState({currentTab: value}, ()=>{
      self.reloadData();
    });
  }

  componentWillMount () {
    var self = this;
    pomelo.on('disconnect', function(err){
      console.log('follow page: on pomelo disconnect:', err);
      self.setState({isConnect: false});

      Taro.showLoading({ title: '重新连接', mask: true });
    });
  }

  componentDidMount () { }

  componentWillUnmount () {
    clearInterval(this.state.eventIntervalId);
    pomelo.removeAllListeners();
    pomelo.disconnect();
  }

  componentDidShow () {
    var self = this;
    
    if (!Taro.getStorageSync('LOGIN_TOKEN')) {
      self.reLaunchToIndex();
    }

    // 循环事件
    var eventIntervalId = setInterval(()=>{
      if (!self.state.isConnect) {
        self.doConnect();
      }
    }, 3000);

    this.setState({eventIntervalId: eventIntervalId}, ()=> {
      self.doConnect();
    });
  }

  componentDidHide () {
    clearInterval(this.state.eventIntervalId);
    // this.setState({eventIntervalId: null});
    pomelo.disconnect();
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
          self.reloadData();
        });
      }
    });
  }

  reloadData() {
    if (!this.state.isConnect) { return }

    var self = this;

    if (this.state.currentTab === 0) {
      // 我关注的人
      pomeloUtil.getFollowing(pomelo, Taro.getStorageSync('LOGIN_TOKEN'), function(err, follower) {
        if (!!err) { return }
        self.setState({followerList: follower});
      });
    } else if (this.state.currentTab === 1) {
      // 关注我的人
      pomeloUtil.getFollower(pomelo, Taro.getStorageSync('LOGIN_TOKEN'), function(err, following) {
        if (!!err) { return }
        self.setState({followingList: following});
      });
    }
  }

  // 取消关注
  cancelFollow(uid) {

    console.log('取消关注uid:', uid);

    var self = this;

    pomeloUtil.unfollow(pomelo, Taro.getStorageSync('LOGIN_TOKEN'), uid, function(err) {
      self.reloadData();
    });
  }

  // 关闭当前页,返回到index页面,一般用于出错时
  reLaunchToIndex() {
    Taro.reLaunch({url: '/pages/index/index'});
  }

  render () {

    return (
      <View className='page'>
        <div style='padding-left:10px; padding-right:10px;'>
            <AtSegmentedControl onClick={this.tabChangedHandle.bind(this)} selectedColor='#6190E8' current={this.state.currentTab} values={['我关注的人', '关注我的人']} />
            {/* 我关注的人 */}
            {this.state.currentTab === 0
              && this.state.followerList.map((follower) => {
                  return <View key={follower.id} className='follower-cell'>
                           <AtAvatar image={follower.avatarURL} size='small' className='follower-cell-avatar'></AtAvatar>
                           <Text className='follower-cell-nickname'>{follower.nickName}</Text>
                           <Button plain type='primary' size='mini' className='follower-cell-btn' onClick={this.cancelFollow.bind(this, follower.uid)}>取消关注</Button>
                         </View>
                })
            }

            {/* 关注我的人 */}
            {this.state.currentTab === 1
              && this.state.followingList.map((follower) => {
                  return <View key={follower.id} className='follower-cell'>
                          <AtAvatar image={follower.avatarURL} size='small' className='follower-cell-avatar'></AtAvatar>
                          <Text className='follower-cell-nickname'>{follower.nickName}</Text>
                         </View>
                })
            }
        </div>
        
      </View>
    )
  }
}

