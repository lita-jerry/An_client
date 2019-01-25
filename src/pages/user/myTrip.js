import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { AtSegmentedControl, AtAvatar, AtCard, AtList, AtListItem } from 'taro-ui'

import { Get } from "../../util/NetworkUtil"

import './index.scss'

import dayjs from 'dayjs'

import success_icon from './images/success.png'

/* 我的行程 */
export default class Index extends Component {

  config = {
    navigationBarTitleText: '安全到家'
  }

  state = {
    isConnect: false,
    eventIntervalId: null,
    
    tripList: [],
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () {
    clearInterval(this.state.eventIntervalId);
  }

  componentDidShow () {
    var self = this;
    
    if (!Taro.getStorageSync('LOGIN_TOKEN')) {
      self.reLaunchToIndex();
    }

    this.reloadData()
  }

  componentDidHide () { }

  /*    自定义函数    */

  reloadData() {
    var self = this
    Get('/trip/wxmp/finished', null, true, (result)=> {
      if (result.code === 200) {
        self.setState({tripList: result.data})
      } else {
        Taro.showToast({title: '请求错误', icon: 'none', duration: 2000})
      }
    })
  }

  // 跳转到tripping
  toTripping(ordernumber) {
    // Taro.reLaunch({url: '/pages/trip/tripping?ordernumber='+ordernumber});
    Taro.navigateTo({url: '/pages/trip/watching?ordernumber='+ordernumber});
  }

  // 关闭当前页,返回到index页面,一般用于出错时
  reLaunchToIndex() {
    Taro.reLaunch({url: '/pages/index/index'});
  }

  render () {

    return (
      <View className='page'>
        <AtList style='flex:1'>
          {this.state.tripList.map((trip) => {
            return <AtListItem
                    key={trip.ordernumber}
                    title={trip.ordernumber}
                    note={dayjs(trip.ctime).format('MM月DD日 HH:mm')}
                    extraText={dayjs(trip.stime).diff(dayjs(trip.ctime), 'minutes')+'分钟'}
                    thumb={success_icon}
                    onClick={this.toTripping.bind(this, trip.ordernumber)}
                    />
            })
          }
        </AtList>
      </View>
    )
  }
}

