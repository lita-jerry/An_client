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
    if (!this.$router.params['event']) {
      this.toTrip();
      return;
    }

    if (this.$router.params['event'] === 'watching') {
      Taro.navigateTo({url: '/pages/watching/entry?ordernumber='+this.$router.params['ordernumber']});
      return;
    }

    this.toTrip();
  }

  componentDidHide () { }

  toTrip() {
    Taro.redirectTo({url:'/pages/trip/index'});
  }

  render () {
    return (
      <View className='index'>
        {/* <Text>index</Text> */}
      </View>
    )
  }
}

