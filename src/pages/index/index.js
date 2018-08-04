import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text, Input, Slider, ScrollView } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { add, minus, asyncAdd } from '../../actions/counter'

import './index.scss'

import { login } from '../login/user'

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
  }
}))
class Index extends Component {
  config = {
    navigationBarTitleText: '平安到家'
  }

  state = {
    mapScale : '14',
    longitude: "113.324520",
    latitude: "23.099994"
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () { 
    this.mapCtx = wx.createMapContext('map')
    this.showLocation()
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
    var _self = this
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function(res) {
        var _latitude = res.latitude
        var _longitude = res.longitude
        console.log(_latitude, _longitude)
        _self.setState({
          longitude:_longitude + "", 
          latitude:_latitude + "",
          mapScale:"18"
        })
        _self.mapCtx.moveToLocation()
      }
    })
  }
  // 获取用户信息
  onGotUserInfo (e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail)
    
    if (e.detail.userInfo) {
      Taro.showLoading({
        title: '登录中',
        mask: true
      })
      
      login(e.detail.userInfo.nickName, e.detail.userInfo.avatarUrl, (err) => {
        console.log(err)
        Taro.hideLoading()
      })
    }
  }

  componentDidHide () { }

  render () {
    return (
      <View className='index'>

        <map id="map"
             longitude={this.state.longitude} latitude={this.state.latitude}
             scale={this.state.mapScale}
             show-location>

          <cover-view class='map-zoom-bg'>
            <Button id='map-zoom-enlargement' onClick={mapScale_enlargement}>+</Button>
            <Button id='map-zoom-reduction' onClick={mapScale_reduction}>-</Button>
          </cover-view>
          
          <cover-view class='map-tool-bar-bg'>

            <cover-view class='map-tool-box-bg'>

              <cover-view id='map-tool-left-box'>
                <cover-image src={follow_icon} class='map-tool-box-image' />
                <cover-view class='map-tool-box-text'>我的关注</cover-view>
              </cover-view>
              
              <cover-view id='map-tool-right-box'>
                <cover-image src={my_icon} class='map-tool-box-image' />
                <cover-view class='map-tool-box-text'>我的</cover-view>
              </cover-view>
              
            </cover-view>

            <cover-view class='start-bg' >
              <cover-image id='start-icon' src={trip_icon} >
                
              </cover-image>
              {
                  this.props.counter.userState.isLogin
                    ? <Button id='start-btn' openType="getUserInfo" lang="zh_CN" onGetUserInfo={onGotUserInfo} plain='true' />
                    : <Button id='start-btn' openType="getUserInfo" lang="zh_CN" onGetUserInfo={onGotUserInfo} plain='true' />
              }
            </cover-view>
          </cover-view>

          <cover-view id='map-show-location-bg'>
            <Button id='map-show-location-btn' onClick={showLocation}>⊙</Button>
          </cover-view>
        </map>

       

        {/* <Button className='add_btn' onClick={this.props.add}>+</Button>
        <Button className='dec_btn' onClick={this.props.dec}>-</Button>
        <Button className='dec_btn' onClick={this.props.asyncAdd}>async</Button>
        <View>{this.props.counter.num}</View>
        <View>Hello, World</View> */}

        {/* <View style='height:150px;background-color:rgb(26,173,25);'>A</View>
          <View style='height:150px;background-color:rgb(39,130,215);'>B</View>
          <View style='height:150px;background-color:rgb(241,241,241);color: #333;'>C</View> */}

      </View>
    )
  }
}

export default Index
