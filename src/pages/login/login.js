import Taro, { Component } from '@tarojs/taro'
import { View, Button } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { add, minus, asyncAdd, login } from '../../actions/counter'

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
  },
  login (token, nickName, avatarURL) {
    dispatch(login(token, nickName, avatarURL))
  }
}))
class Index extends Component {
  config = {
    navigationBarTitleText: '用户登录'
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
        <Button className='add_btn' onClick={this.props.add}>+</Button>
        <Button className='dec_btn' onClick={this.props.dec}>-</Button>
        <Button className='dec_btn' onClick={this.props.asyncAdd}>async</Button>
        <View>{this.props.counter.num}</View>
        <View>Hello, World</View>
      </View>
    )
  }
}
export default Index