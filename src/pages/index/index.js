import Taro, { Component } from '@tarojs/taro'
import { View, Button, CoverView, CoverImage } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { add, minus, asyncAdd, login } from '../../actions/counter'

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
  login (token, nickName, avatarURL) {
    dispatch(login(token, nickName, avatarURL))
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

  navigateTo(url) {
    Taro.navigateTo({url:url})
  }

  componentDidHide () { }

  render () {
    return (
      <View className='index'>

        <map id="map"
             longitude={this.state.longitude} latitude={this.state.latitude}
             scale={this.state.mapScale}
             show-location>

          <CoverView class='map-zoom-bg'>
            <Button id='map-zoom-enlargement' onClick={mapScale_enlargement} hoverClass='none'>+</Button>
            <Button id='map-zoom-reduction' onClick={mapScale_reduction} hoverClass='none'>-</Button>
          </CoverView>
          
          <CoverView class='map-tool-bar-bg'>

            <CoverView class='map-tool-box-bg'>

              <CoverView id='map-tool-left-box'>
                <CoverImage src={follow_icon} class='map-tool-box-image' />
                <CoverView class='map-tool-box-text'>我的关注</CoverView>
              </CoverView>
              
              <CoverView id='map-tool-right-box'>
                <CoverImage src={my_icon} class='map-tool-box-image' />
                <CoverView class='map-tool-box-text'>我的</CoverView>
              </CoverView>
              
            </CoverView>

            <CoverView class='start-bg' >
            {
              this.props.counter.userState.isLogin
                ? <CoverImage id='start-icon' src={trip_icon} onClick={this.showLocation} />
                : <CoverImage id='start-icon' src={trip_icon} onClick={this.navigateTo.bind(this,'/pages/login/login')} />
            }
            </CoverView>
          </CoverView>

          <CoverView id='map-show-location-bg'>
            <Button id='map-show-location-btn' onClick={showLocation} hoverClass='none'>⊙</Button>
          </CoverView>
        </map>

       

        {/* <Button className='add_btn' onClick={this.props.add}>+</Button>
        <Button className='dec_btn' onClick={this.props.dec}>-</Button>
        <Button className='dec_btn' onClick={this.props.asyncAdd}>async</Button>
        <View>{this.props.counter.num}</View>
        <View>Hello, World</View> */}

      </View>
    )
  }
}

export default Index
