import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './index.scss'

/* 落地页 */
export default class Index extends Component {

  config = {
    navigationBarTitleText: ''
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () {
    // 检查携带参数
    // Taro.navigateTo({url: '/pages/trip/index'});
    Taro.redirectTo({url:'/pages/trip/index'})
  }

  componentDidHide () { }

  render () {
    return (
      <View className='index'>
        {/* <Text>index</Text> */}
      </View>
    )
  }
}

