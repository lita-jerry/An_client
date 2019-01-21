import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { AtSegmentedControl, AtAvatar } from 'taro-ui'

import { Get } from "../../util/NetworkUtil";

import './index.scss'

/* 我的关注、关注我的 */
export default class Index extends Component {

  config = {
    navigationBarTitleText: '安全到家'
  }

  state = {
    currentTab: 0, // 0: 我关注的人; 1: 关注我的人
    followerList: [], // 我关注的人
    followingList: [], // 关注我的人
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () {
    if (!!Taro.getStorageSync('LOGIN_TOKEN')) {
      this.reloadData();
    } else {
      this.reLaunchToIndex();
    }
  }

  componentDidHide () { }

  /*    自定义函数    */

  tabChangedHandle (value) {
    var self = this;
    this.setState({currentTab: value}, ()=>{
      self.reloadData();
    });
  }

  reloadData() {
    var self = this;

    if (this.state.currentTab === 0) {
      // 我关注的人
      Get('/user/wxmp/follow/following', null, true, (result)=> {
        if (result.code === 200) {
          self.setState({followingList: result.following});
        }
      })
    } else if (this.state.currentTab === 1) {
      // 关注我的人
      Get('/user/wxmp/follow/follower', null, true, (result)=> {
        if (result.code === 200) {
          self.setState({followerList: result.followers});
        }
      })
    }
  }

  // 取消关注
  cancelFollow(uid) {

    console.log('取消关注uid:', uid);

    var self = this;
    Get('/user/wxmp/follow/remove', {uid: uid}, true, (result)=> {
      self.reloadData()
    })
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
              && this.state.followingList.map((following) => {
                  return <View key={following.userid} className='follower-cell'>
                           <AtAvatar image={following.avatarurl} size='small' className='follower-cell-avatar'></AtAvatar>
                           <Text className='follower-cell-nickname'>{following.nickname}</Text>
                           <Button plain type='primary' size='mini' className='follower-cell-btn' onClick={this.cancelFollow.bind(this, following.userid)}>取消关注</Button>
                         </View>
                })
            }

            {/* 关注我的人 */}
            {this.state.currentTab === 1
              && this.state.followerList.map((follower) => {
                  return <View key={follower.userid} className='follower-cell'>
                          <AtAvatar image={follower.avatarurl} size='small' className='follower-cell-avatar'></AtAvatar>
                          <Text className='follower-cell-nickname'>{follower.nickname}</Text>
                         </View>
                })
            }
        </div>
        
      </View>
    )
  }
}

