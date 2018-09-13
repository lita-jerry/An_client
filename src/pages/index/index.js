import Taro, { Component } from '@tarojs/taro'
import { View, Button, CoverView, CoverImage } from '@tarojs/components'
import { AtButton, AtModal, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui'
import { connect } from '@tarojs/redux'

import { add, minus, asyncAdd, login } from '../../actions/counter'

import pomelo from 'pomelo-weixin-client'

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
  },
  login (token) {
    dispatch(login(token))
  }
}))
class Index extends Component {
  config = {
    navigationBarTitleText: '平安到家'
  }

  state = {
    mapScale : '14',
    longitude: "113.324520",
    latitude: "23.099994",
    isLoginModalShow: false
  }

  componentDidMount() {
    this.autoLogin()
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
    var self = this
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function(res) {
        var _latitude = res.latitude
        var _longitude = res.longitude
        console.log(_latitude, _longitude)
        self.setState({
          longitude:_longitude + "", 
          latitude:_latitude + "",
          mapScale:"18"
        })
        self.mapCtx.moveToLocation()
      }
    })
  }

  // 关闭当前页面，跳转到应用内的某个页面
  redirectTo(url) {
    Taro.redirectTo({url:url})
  }

  // 自动登录
  autoLogin() {
    // 检查本地是否有LoginToken
    // 有的话Entry

    var self = this
    // Taro.showLoading({ mask: true });
    Taro.login({
      success: function(loginRes) {
        console.log(loginRes.code)
        if (loginRes.code) {
          pomelo.init({
            host: 'jerrysir.com/',
            port: 3010
          }, function() {
              console.log('success');
              pomelo.request("connector.entryHandler.loginByOtherPlatform", {code: loginRes.code, nickName: '这个是小程序里面的昵称', avatarURL: '这个是小程序里面的头像url'}, function(data) {
                console.log(data);
              });
          });
        }
      }
    });
  }

  // 检查未完成行程订单
  checkUnfinishedTripOrder() {
    Taro.showLoading({
      mask: true
    })

    Taro.request({
      url: 'https://jerrysir.com/v1/t/unfinished',
      data: {
        session: this.props.counter.userState.token
      }
    })
    .then(unfinishedRequestRes => {
      console.log(unfinishedRequestRes.data)
      Taro.hideLoading()
      if (unfinishedRequestRes.data.ordernumber) {
        console.log('跳转到行程' + unfinishedRequestRes.data.ordernumber)
      }
    })
  }

  // 创建行程订单
  createTripOrder() {
    if (this.props.counter.userState.isLogin) {
      Taro.showLoading({
        title: '创建行程',
        mask: true
      })

      Taro.request({
        url: 'https://jerrysir.com/v1/t/create',
        data: {
          session: this.props.counter.userState.token
        }
      })
      .then(createTripOrderRequestRes => {
        console.log(createTripOrderRequestRes.data)
        Taro.hideLoading()
        if (createTripOrderRequestRes.data.ordernumber) {
          console.log('跳转到行程' + createTripOrderRequestRes.data.ordernumber)
        }
      })
    } else {
      this.redirectTo('/pages/login/login')
    }
  }

  componentDidHide () { }

  render () {
    return (
      <View className='index'>

        <Map className="map"
             longitude={this.state.longitude} latitude={this.state.latitude}
             scale={this.state.mapScale}
             show-location>

          <CoverView class='map-zoom-bg'>
          
            <AtButton className='map-zoom-enlargement' onClick={this.mapScale_enlargement.bind(this)} hoverClass='none'>+</AtButton>
            <AtButton className='map-zoom-reduction' onClick={this.mapScale_reduction.bind(this)} hoverClass='none'>-</AtButton>
          </CoverView>
          
          <CoverView class='map-tool-bar-bg'>

            <CoverView class='map-tool-box-bg'>

              <CoverView className='map-tool-left-box'>
                <CoverImage src={follow_icon} class='map-tool-box-image' />
                <CoverView class='map-tool-box-text'>我的关注</CoverView>
              </CoverView>
              
              <CoverView className='map-tool-right-box'>
                <CoverImage src={my_icon} class='map-tool-box-image' />
                <CoverView class='map-tool-box-text'>我的</CoverView>
              </CoverView>
              
            </CoverView>

            <CoverView class='start-bg' >
            {
              this.props.counter.userState.isLogin
                ? <CoverImage className='start-icon' src={trip_icon} onClick={this.createTripOrder} />
                : <CoverImage className='start-icon' src={trip_icon} onClick={this.redirectTo.bind(this,'/pages/login/login')} />
            }
            </CoverView>
          </CoverView>

          <CoverView className='map-show-location-bg'>
            <AtButton className='map-show-location-btn' onClick={this.showLocation.bind(this)} hoverClass='none'>⊙</AtButton>
          </CoverView>

        </Map>

        {/* <Button className='add_btn' onClick={this.props.add}>+</Button>
        <Button className='dec_btn' onClick={this.props.dec}>-</Button>
        <Button className='dec_btn' onClick={this.props.asyncAdd}>async</Button>
        <View>{this.props.counter.num}</View>
        <View>Hello, World</View> */}

        <AtModal isOpened={isLoginModalShow}>
          <AtModalHeader>需要登录</AtModalHeader>
          <AtModalContent>小程序需要获得你的公开信息(昵称、头像等)</AtModalContent>
          <AtModalAction>
            <Button>取消</Button>
            <Button>小程序快速登录</Button>
          </AtModalAction>
        </AtModal>

      </View>
    )
  }
}

export default Index
