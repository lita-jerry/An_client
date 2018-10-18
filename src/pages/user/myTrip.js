import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { AtSegmentedControl, AtAvatar, AtCard, AtList, AtListItem } from 'taro-ui'

import './index.scss'

import pomelo from 'pomelo-weixin-client'
import pomeloUtil from '../../util/pomelo'

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
    pomelo.disconnect();
    pomelo.removeAllListeners();
  }

  componentDidShow () {
    var self = this;
    
    if (!Taro.getStorageSync('LOGIN_TOKEN')) {
      self.reLaunchToIndex();
    }

    pomelo.on('disconnect', function(err){
      console.log('follow page: on pomelo disconnect:', err);
      self.setState({isConnect: false});

      Taro.showLoading({ title: '重新连接', mask: true });
    });

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
    pomelo.disconnect();
    pomelo.removeAllListeners();
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

    pomeloUtil.queryFinishedList(pomelo, Taro.getStorageSync('LOGIN_TOKEN'), function(err, tripList) {
      if (!!err) { return }
      self.setState({tripList: tripList});
    });
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
                    note={dayjs(trip.startTime).format('MM月DD日 HH:mm')}
                    extraText={dayjs(trip.endTime).diff(dayjs(trip.startTime), 'minutes')+'分钟'}
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

