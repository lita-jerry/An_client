import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text, Input, Slider, ScrollView } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { add, minus, asyncAdd } from '../../actions/counter'

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
              {
                this.props.counter.userState.isLogin
                  ? <cover-image id='start-btn' src={trip_icon} bindtap={this.showLocation} />
                  : <cover-image id='start-btn' src={trip_icon} bindtap={this.mapScale_reduction} />
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

        
        {/*
        <ScrollView className='scrollview'
            scrollY
            scrollWithAnimation
            scrollTop='0'
            style='flex: 1;'
            lowerThreshold='20'
            upperThreshold='20'>

          <div style='display:flex; flex-direction: row; height: 44px; align-items: center;'>
            <Text style='width: 33vw; margin-left: 8px;'>目的地:</Text>
            <Input style='flex: 1; margin-right: 8px; border-style: solid; border-width: 0.5px; border-radius: 8px; border-color: rgba(9, 153, 255, 0.25);' type='text' placeholder='将要去的目的地' />
          </div>
          
          <div style='display:flex; flex-direction: row; height: 44px; align-items: center;'>
            <Text style='width: 33vw; margin-left: 8px;'>交通工具:</Text>
            <Input style='flex: 1; margin-right: 8px;' type='text' placeholder='所搭乘的交通工具' />
          </div>
          
          <div style='display:flex; flex-direction: row; height: 44px; align-items: center;'>
            <Text style='width: 33vw; margin-left: 8px;'>定位频率(秒):</Text>
            <Slider style='flex: 1; margin-right: 8px;' step="5" value="30" showValue min="5" max="120"/>
          </div>

          <view style='height: 88px;'></view>
        </ScrollView>

        <Button className='' style="">我</Button>
        
        <div style='position:fixed; height: 66px; width: 100vw; bottom: 0; z-index:99; background-color:yellow;'>
          <Button className='' style='height: 66px; width: 100vw;' size='default' plain='true'>发起行程</Button>
        </div>
        */}

        

      </View>
    )
  }
}

export default Index
