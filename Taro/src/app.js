import Taro, { Component } from '@tarojs/taro'
import Index from './pages/index'

import './app.scss'

class App extends Component {

  config = {
    pages: [
      'pages/index/index',
      'pages/trip/index',
      'pages/trip/tripping',
      'pages/trip/watchingEntry',
      'pages/trip/watching',
      'pages/user/follow',
      'pages/user/my',
      'pages/user/myTrip',
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    },
    "permission": {
      "scope.userLocation": {
        "desc": "你的位置信息将用于定位效果展示"
      }
    }
  }

  globalData = { }

  componentDidMount () {}

  componentDidShow () {
    // 设置屏幕常亮
    Taro.setKeepScreenOn({
      keepScreenOn: true
    });
  }

  componentDidHide () {}

  componentCatchError () {}

  render () {
    return (
      <Index />
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
