import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtCard, AtButton } from "taro-ui"
import './index.scss'

import sos_icon from './images/sos.png'
import security_icon from './images/security.png'
import end_icon from './images/end.png'

import async from 'async'
import dayjs from 'dayjs'
import pomelo from 'pomelo-weixin-client'

/* 行程首页 */
export default class Index extends Component {

  config = {
    navigationBarTitleText: '我的行程'
  }

  state = {
    tripState: 0,
    mapScale : 14,
    longitude: "113.324520",
    latitude: "23.099994",
    showLocation: true,
    eventIntervalId: null,
    createdTime: '-/-',
    lengthOfTime: 0,
    distance: 0,
    speed: '-/-',
    polyline: []
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () {
    this.initMap();
    // 检查登录情况
    if (!pomelo.isLogin) {
      this.reLaunchToIndex();
    }
    
    // 获取行程订单编号
    if (!this.$router.params['ordernumber']) {
      this.reLaunchToIndex();
    }

    this.showCurrentLocation();

    var self = this;
    this.setState({ordernumber: this.$router.params['ordernumber']}, ()=>{
      self.getTripInfo();
    });
  }

  componentDidHide () { }

  /*    自定义函数    */

  // 初始化地图
  initMap() {
    this.mapCtx = wx.createMapContext('myMap')
  }

  // 开始事件循环
  startEventLoop() {
    var self = this
    var eventIntervalId = setInterval(()=>{
      // 显示当前位置
      self.showCurrentLocation();
      // 上传当前位置
      self.uploadCurrentLocation();
    }, 9000);
    this.setState({eventIntervalId: eventIntervalId});
  }

  // 停止事件循环
  stopEventLoop() {
    clearInterval(this.state.eventIntervalId);
    this.setState({eventIntervalId: null});
  }

  // 结束行程
  endTripping() {
    // 停止事件循环
    this.stopEventLoop();

    var self = this;
    pomelo.endTrip(function(err) {
      if (!!err) {
        console.log('出错了',err);
        self.reLaunchToIndex();
        return;
      } else {
        self.setState({tripState: 2}, ()=>{
          // 显示路线图
          self.showPolyline();
        });
      }
    });
  }

  // 显示当前位置
  showCurrentLocation() {
    this.mapCtx.moveToLocation();
  }

  // 上传当前位置
  uploadCurrentLocation() {
    var self = this;

    Taro.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function(res) {
        console.log(res.latitude, res.longitude)
        // 这里根据上次位置做偏移计算,如果偏移微小则不做上传
        self.setState({
          longitude:res.longitude + "", 
          latitude:res.latitude + ""
        });
        // 如果偏移量较小,则不上传位置,此时 this.state 中的值还未改变
        var deviation = '0.00003';
        if (Math.abs(self.state.longitude - res.longitude) > deviation || Math.abs(self.state.latitude - res.latitude) > deviation) {
          // 上传位置
          pomelo.uploadLocation(res.longitude, res.latitude, function(_err) {
            console.log('上传位置:'+_err);
          });
        } else {
          console.log('位置偏移量较小,不上传');
        }
        // 计算当前速度
      }
    });
  }

  // 显示路线图
  showPolyline() {
    var self = this;
    this.getPolyline(function() {
      var points = self.state.polyline.map((currentValue, index, arr) => {
        return {
          longitude: currentValue['longitude'],
          latitude: currentValue['latitude']
        };
      });
      self.mapCtx.includePoints({
        points: points
      });
    });
  }

  // 获取路线
  getPolyline(callback) {
    var self = this;
    
    pomelo.getPolyline(this.state.ordernumber, function(err, polyline) {
      console.log(err, polyline);
      var distance = self.computePolylineDistance(polyline);
      var newPolyline = polyline.concat(self.state.polyline);
      self.setState({
        polyline: newPolyline,
        distance: distance
      }, callback);
    });
  }

  // 根据经纬度计算距离
  computePolylineDistance(polyline) {

    function _computePolylineDistance (la1, lo1, la2, lo2) {
      var La1 = la1 * Math.PI / 180.0;
      var La2 = la2 * Math.PI / 180.0;
      var La3 = La1 - La2;
      var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
      var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
      s = s * 6378.137;//地球半径
      s = Math.round(s * 10000) / 10000;
      console.log("计算结果",s)
      return s;
    }
    
    if (polyline.length < 2) { return 0 }

    var distance = 0;
    for (let index = 1; index < polyline.length; index++) {
      const lastElement = polyline[index -1];
      const element = polyline[index];
      distance = distance + _computePolylineDistance(lastElement['latitude'], lastElement['longitude'], element['latitude'], element['longitude'])
    }
    return distance;
  }
  
  // 获取行程信息
  getTripInfo() {
    var self = this;

    pomelo.getTripInfo(this.state.ordernumber, function(err, info) {
      if (!!err) {
        self.reLaunchToIndex();
        return;
      }
      // uid, nickName, avatar, tripState, createdTime, lastUpdatedTime, polyline, logs

      // 开始时间
      var createdTime = dayjs(info['createdTime']);
      console.log(createdTime.format('MM月DD日 HH:mm'));

      // 时长
      // createdTime().isBefore(dayjs())
      var lengthOfTime = dayjs().diff(createdTime, 'minutes');
      
      // 距离、速度 在获取路线完成后计算

      // 当前状态
      var tripState = info['tripState'];

      self.setState({createdTime: createdTime.format('MM月DD日 HH:mm'),
                     lengthOfTime: lengthOfTime > 0 ? lengthOfTime : 1,
                     tripState: tripState
                    }, ()=>{
                      if (tripState === 1) {
                        self.entryTrippingRoom();
                      } else if (tripState === 2) {
                        self.showPolyline();
                      } else { return }
                     });
    });
  }

  // 进入行程房间
  entryTrippingRoom() {
    var self = this;

    pomelo.entryTripRoom(self.state.ordernumber, function(_err) {
      if (!!_err) {
        console.log(_err);
        self.reLaunchToIndex();
        return;
      }

      console.log('行程编号:'+ self.state.ordernumber +' 进入房间成功');

      self.uploadCurrentLocation();

      // 开始事件循环
      self.startEventLoop();
    });
  }

  // 添加监听事件Handler
  addChannelHandler() { }

  // 移除监听事件Handler
  removeChannelHandler() { }

  // 关闭当前页,返回到index页面,一般用于出错时
  reLaunchToIndex() {
    Taro.reLaunch({url: '/pages/index/index'});
  }

  render () {
    return (
      <View className='index'>
        <AtCard
        className="info-bg"
        title={this.state.tripState === 1 ? '行驶中' : '已结束'}
        extra={this.state.createdTime}
        isFull={true}
        thumb={this.state.tripState === 1 ? security_icon : end_icon}>
          <div style='display:flex; flex-direction:column; left:0; right:0; height:19vh; align-items:center;'>
            <div style='display:flex; flex-direction:row; justify-content:space-around; left:0; right:0; margin:auto; width:90vw; height:9vh;'>

              <div style='width:10vh; height:10vh;'>
                <div style='display:flex; flex-direction:row; align-items:center; justify-content:center;'>
                  <text style='font-size:150%; text-align:center; color:#53505F'>{this.state.lengthOfTime > 60 ? (this.state.lengthOfTime / 60).toFixed(1) : this.state.lengthOfTime}</text>
                  <text style='font-size:90%; text-align:center; color:#535257'>{this.state.lengthOfTime > 60 ? '小时' : '分钟'}</text>
                </div>
                <div style='display:flex; justify-content:center;'>
                  <text style='color:#878787'>行驶时间</text>
                </div>
              </div>

              <div style='width:10vh; height:10vh;'>
                <div style='display:flex; flex-direction:row; align-items:center; justify-content:center;'>
                  <text style='font-size:150%; text-align:center; color:#53505F'>{this.state.distance.toFixed(2)}</text>
                  <text style='font-size:90%; text-align:center; color:#535257'>km</text>
                </div>
                <div style='display:flex; justify-content:center;'>
                  <text style='color:#878787'>行驶距离</text>
                </div>
              </div>

              <div style='width:10vh; height:10vh;'>
                <div style='display:flex; flex-direction:row; align-items:center; justify-content:center;'>
                  <text style='font-size:150%; text-align:center; color:#53505F'>{(this.state.distance / this.state.lengthOfTime * 60).toFixed(2)}</text>
                  <text style='font-size:90%; text-align:center; color:#535257'>km/h</text>
                </div>
                <div style='display:flex; justify-content:center;'>
                  <text style='color:#878787'>平均速度</text>
                </div>
              </div>
            </div>

            <div style='display:flex; flex-direction:row; justify-content:space-around; left:0; right:0; margin:auto; width:90vw; height:6vh;'>
              {
                this.state.tripState === 1
                ? <AtButton type='primary' size='normal' style='width:50vw;' onClick={this.endTripping}>结束行程</AtButton>
                : <AtButton type='primary' size='normal' style='width:50vw;' onClick={this.reLaunchToIndex}>关闭页面</AtButton>
              }
              <AtButton type='secondary'>分享</AtButton>
            </div>

          </div>
        </AtCard>

        <map id="myMap"
             style='display:flex; left:0; top:0; width:100vw; height:71vh;'
             longitude={this.state.longitude} latitude={this.state.latitude}
             scale={this.state.mapScale+''}
             polyline={[{
              points: this.state.polyline.map((currentValue, index, arr) => {
                return {
                  longitude: currentValue['longitude'],
                  latitude: currentValue['latitude']
                }
              }),
              color:"#FF0000DD",
              width: 2,
              dottedLine: true
            }]}
             show-location = {this.state.tripState === 1}>
 
          <CoverView style='position:flex; position:absolute; bottom:25PX; width:100vw; height:90PX;'>
            {/* <view style='position: absolute; z-index:199; left:0; top:0; width: 74PX; height: 74PX; background: url(images/icon-spin-s.png) no-repeat; animation: spin 800ms infinite linear;'></CoverView> */}
            <CoverView style='position:absolute; left:0; top:0; right:0; bottom:0; margin:auto; width:66PX; height:66PX; background-color:white; border:2PX solid #DC143C; border-radius:33PX; box-shadow: 0 0 15PX #4E4E4E;' >
                <CoverImage style='position:absolute; left:0; top:0; right:0; bottom:0; margin:auto; width:66%; height:66%;' src={sos_icon} onClick={this.createTripOrder} />
            </CoverView>
          </CoverView>

          <CoverView style='position:fixed; bottom:122PX; left:10PX; z-index:99; width:44PX; height:44PX;'>
            <Button style='position:absolute; left:0; top:0; right:0; bottom:0; margin:auto; width:99%; height:99%;' onClick={this.showCurrentLocation.bind(this)} hoverClass='none'>⊙</Button>
          </CoverView>

        </map>

      </View>
    )
  }
}

