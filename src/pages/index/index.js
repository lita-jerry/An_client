import Taro, { Component } from '@tarojs/taro'
import { View, Button } from '@tarojs/components'
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
        <Text>目的地:</Text>
        <Input type='text' placeholder='将要去的目的地' focus/>
        <Text>交通工具:</Text>
        <Input type='text' placeholder='所搭乘的交通工具' focus/>
        <Text>定位频率(秒):</Text>
        <Slider step="5" value="30" showValue min="5" max="120"/>
        <Button className='' style="">我</Button>
        <Button className='' style="">发起行程</Button>
      </View>
    )
  }
}

export default Index
