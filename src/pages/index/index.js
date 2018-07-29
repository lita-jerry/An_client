import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text, Input, Slider, ScrollView } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { add, minus, asyncAdd } from '../../actions/counter'

import './index.scss'

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
    mapScale : '14'
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () { 
    this.mapCtx = wx.createMapContext('myMap')
    setTimeout(() => {
      this.mapCtx.moveToLocation()
    }, 2000)
  }

  mapScale_enlargement() {
    var scale = Number(this.state.mapScale)
    console.log(scale)
    if (scale < 18) {
      this.setState({mapScale:(scale + 1) + ""})
    }
  }
  mapScale_reduction() {
    var scale = Number(this.state.mapScale)
    console.log(scale)
    if (scale > 5) {
      this.setState({mapScale:(scale - 1) + ""})
    }
  }

  showLocation() {
    this.mapCtx.moveToLocation()
    this.setState({mapScale:"18"})
  }


  componentDidHide () { }

  render () {
    return (
      <View className='index'>
        {/* <map id="map" longitude="113.324520" latitude="23.099994" 
        scale="14" 
        controls="{{controls}}" 
        bindcontroltap="controltap" 
        markers="{{markers}}" 
        bindmarkertap="markertap" 
        polyline="{{polyline}}" 
        bindregionchange="regionchange" 
        show-location 
        style="width: 100%; height: 300px;"></map> */}
        <map id="myMap"
             style='left:0; top:0; width:100vw; height:100vh;'
             scale={this.state.mapScale}
             show-location>
          <cover-view className='map_+_-'
              style='position:fixed; top:45vh; right:10px; z-index:99; width:44px; height:99px;'>
            <Button style='position:absolute; left:0; top:0; right:0; bottom:49%; margin:auto;'
                    onClick={mapScale_enlargement}>+</Button>
            <Button style='position:absolute; left:0; top:49%; right:0; bottom:0; margin:auto;'
                    onClick={mapScale_reduction}>-</Button>
          </cover-view>
          
          <cover-view className='tool_bar'
              style='position:fixed; left:0; right:0; margin:auto; bottom:20px; z-index:999; width:80vw; height:70px;'>
            <cover-view style='width:100%; height:60px; margin:3px 0; border:1px solid #ddd; border-radius:50px; background-color:white;'>
              <cover-view style='position:absolute; left:0; top:0; right:55%; bottom:0; margin:auto; width:45px; height:45px; z-index:99; background-color:blue;'></cover-view>
              <cover-view style='position:absolute; left:55%; top:0; right:0; bottom:0; margin:auto; width:45px; height:45px; z-index:99; background-color:blue;'></cover-view>
            </cover-view>
            <cover-view style='position:absolute; left:0; top:0; right:0; bottom:0; margin:auto; width:66px; height:66px; border:1px solid #aaa; border-radius:33px; z-index:99; background-color:green;'></cover-view>
          </cover-view>

          <cover-view className='map_+_-'
              style='position:fixed; bottom:110px; left:10px; z-index:99; width:44px; height:44px;'>
            <Button style='position:absolute; left:0; top:0; right:0; bottom:0; margin:auto;' onClick={showLocation}>⊙</Button>
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
