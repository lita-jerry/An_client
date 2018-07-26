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

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  render () {
    return (
      <View className='index'>
        {/* <Button className='add_btn' onClick={this.props.add}>+</Button>
        <Button className='dec_btn' onClick={this.props.dec}>-</Button>
        <Button className='dec_btn' onClick={this.props.asyncAdd}>async</Button>
        <View>{this.props.counter.num}</View>
        <View>Hello, World</View> */}

        {/* <View style='height:150px;background-color:rgb(26,173,25);'>A</View>
          <View style='height:150px;background-color:rgb(39,130,215);'>B</View>
          <View style='height:150px;background-color:rgb(241,241,241);color: #333;'>C</View> */}

        <ScrollView className='scrollview'
            scrollY
            scrollWithAnimation
            scrollTop='0'
            style='flex: 1;'
            lowerThreshold='20'
            upperThreshold='20'>

          <div style='display:flex; flex-direction: row; height: 44px; align-items: center;'>
            <Text style='width: 33vw; margin-left: 8px;'>目的地:</Text>
            <Input style='flex: 1; margin-right: 8px;' type='text' placeholder='将要去的目的地' />
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

        {/* <Button className='' style="">我</Button> */}
        
        <div style='position:fixed; height: 66px; width: 100vw; bottom: 0; z-index:99; background-color:yellow;'>
          <Button className='' style='height: 66px; width: 100vw;' size='default' plain='true'>发起行程</Button>
        </div>
      </View>
    )
  }
}

export default Index
