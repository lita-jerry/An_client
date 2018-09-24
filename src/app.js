import Taro, { Component } from '@tarojs/taro'
import Index from './pages/index'

import './app.scss'

// Pomelo扩展
import './PomeloManager'

class App extends Component {

  config = {
    pages: [
      'pages/index/index',
      'pages/trip/index',
      'pages/tripping/index'
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    }
  }

  componentDidMount () {}

  componentDidShow () {}

  componentDidHide () {}

  componentCatchError () {}

  render () {
    return (
      <Index />
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
