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

import pomeloUtil from '../../util/pomelo'

/* 正在出行(观察者模式) */
export default class Index extends Component {

  config = {
    navigationBarTitleText: '行程守护'
  }

  state = {
    isConnect: false,
    isEntry: false,
    eventIntervalId: null,

    ordernumber: null,
    tripState: 0,
    createdTime: '-/-',
    lastUpdatedTime: '-/-',
    polyline: [],
    
    
    mapScale : 14,
    longitude: "113.324520",
    latitude: "23.099994",
    showLocation: false,
    
    lengthOfTime: 0,
    distance: 0,
    speed: 0 // m/s
  }

  componentWillMount () {

    // 获取行程订单编号
    if (!this.$router.params['ordernumber']) {
      this.reLaunchToIndex();
    }
    this.setState({ordernumber: this.$router.params['ordernumber']});

    var self = this;
    pomelo.on('disconnect', function(err){
      console.log('on pomelo disconnect:', err);
      self.setState({isConnect: false, isEntry: false});
      Taro.showLoading({ title: '尝试重新连接', mask: true });
    });
  }

  componentDidMount () { }

  componentWillUnmount () {
    clearInterval(this.state.eventIntervalId);
    pomelo.disconnect();
  }

  componentDidShow () {
    var self = this;
    if (this.state.tripState === 2) { return }
    // 循环事件
    var eventIntervalId = setInterval(()=>{
      if (!self.state.isConnect) {
        self.doConnect();
      } else {
        if (self.state.tripState === 1) {
          // 显示当前位置
          self.showCurrentLocation();
          // 上传当前位置
          self.uploadCurrentLocation();
        } else if (self.state.tripState === 0) {
          // 表示仅建立了Socket连接
          self.doConnect();
        }
      }
    }, 3000);

    this.setState({eventIntervalId: eventIntervalId}, ()=> {
      self.doConnect();

      self.mapCtx = wx.createMapContext('myMap');
      self.showCurrentLocation();
    });
  }

  componentDidHide () {
    clearInterval(this.state.eventIntervalId);
    // this.setState({eventIntervalId: null});
    pomelo.disconnect();
  }

  /*    自定义函数    */

  // pomelo连接
  doConnect () {

    if (!!this.state.isConnect) {
      Taro.hideLoading();
      this.getTripInfo();
      return;
    };

    var self = this;
    pomeloUtil.init(pomelo, function(err) {
      if (!!err) {
        self.setState({isConnect: false, isEntry: false, tripState: 0});
      } else {
        Taro.hideLoading();
        self.setState({isConnect: true});
        self.getTripInfo();
      }
    });
  }

  // 刷新当前状态,重新计算时间、距离、速度
  refreshStatus() {
    var lengthOfTime = 0;
    var distance = 0;
    var speed = 0; // 米/每秒

    if (this.state.tripState === 1) {
      // 时长
      var createdTime = dayjs(this.state.createdTime);
      lengthOfTime = dayjs().diff(createdTime, 'minutes');

      // 距离
      distance = this.computePolylineDistance(this.state.polyline);

      // 行程平均配速这里不做计算

      this.setState({lengthOfTime: lengthOfTime < 1 ? 1 : lengthOfTime, distance: distance});
    } else if (this.state.tripState === 2) {
      // 时长
      var createdTime = this.state.createdTime;
      var endTime = this.state.lastUpdatedTime; // 此时,最后更新时间就是行程结束时间
      lengthOfTime = dayjs(endTime).diff(dayjs(createdTime), 'minutes');

      // 距离
      distance = this.computePolylineDistance(this.state.polyline);

      // 行程平均配速
      speed = (distance * 1000) / (dayjs(endTime).diff(dayjs(createdTime), 'second')); // 千米/每时
      console.log('平均速度:', speed);
      this.setState({lengthOfTime: lengthOfTime < 1 ? 1 : lengthOfTime, distance: distance, speed: speed});
    }
  }

  // 结束行程
  endTripping() {
    var self = this;

    pomeloUtil.end(pomelo, function(err) {
      if (!!err) { return }
      self.setState({tripState: 2, lastUpdatedTime: dayjs().format()}, ()=>{
        // 显示路线图
        self.showPolyline();
      });
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
        console.log(res);
        // 这里根据上次位置做偏移计算,如果偏移微小则不做上传
        self.setState({
          longitude: res.longitude + "", 
          latitude: res.latitude + ""
        });
        // 如果偏移量较小,则不上传位置,此时 this.state 中的值还未改变
        var deviation = '0.00003';
        if (Math.abs(self.state.longitude - res.longitude) > deviation || Math.abs(self.state.latitude - res.latitude) > deviation) {
          // 上传位置
          pomeloUtil.uploadLocation(pomelo, res.longitude, res.latitude, function(err) {
            if (!!err) {
              Taro.showToast({title: '网络不稳定', icon: 'none', duration: 2000});
            } else {
              Taro.showToast({title: '位置已上传, 当前速度:'+res.speed, icon: 'none', duration: 2000});
              var polyline = self.state.polyline;
              self.setState({polyline: polyline.concat({longitude: res.longitude, latitude: res.latitude})});
            }
          });
        } else {
          console.log('位置偏移量较小,不上传');
        }
        // 计算当前速度
        // var distance = self.computePolylineDistance([{latitude: self.state.latitude, longitude: self.state.longitude}, {latitude: res.latitude, longitude: res.longitude}]);
        // var speed = distance / (3 / 60 * 60); // 转成 千米/每时
        // self.setState({speed: speed}, ()=>{ self.refreshStatus() });
        self.setState({speed: res.speed > 0 ? res.speed : 0}, ()=>{ self.refreshStatus() });
      }
    });
  }

  // 显示路线图
  showPolyline() {
    var self = this;
    this.getPolyline(function(err, polyline) {
      if (!!err) { return }
      var points = self.state.polyline.map((currentValue, index, arr) => {
        return {
          longitude: currentValue['longitude'],
          latitude: currentValue['latitude']
        };
      });
      self.mapCtx.includePoints({
        points: points
      });
      self.refreshStatus();    
    });
  }

  // 获取路线
  getPolyline(callback) {
    var self = this;
    pomeloUtil.getPolyline(pomelo, Taro.getStorageSync('LOGIN_TOKEN'), this.state.ordernumber, function(err, polyline) {
      if (!!err) { callback('获取路线失败'); return; }
      self.setState({
        polyline: polyline
      }, ()=> {
        callback(null);
      });
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
    
    if (this.state.isEntry) { return }

    var self = this;

    pomeloUtil.getInfo(pomelo, Taro.getStorageSync('LOGIN_TOKEN'), this.state.ordernumber, function(err, tripInfo) {
      if (!!err) { return }

      // uid, nickName, avatar, tripState, createdTime, lastUpdatedTime

      self.setState({
        createdTime: tripInfo.createdTime,
        lastUpdatedTime: tripInfo.lastUpdatedTime
      }, ()=> {
        if (tripInfo.tripState === 1) {
          self.entryTrippingRoom();
        } else if (tripInfo.tripState === 2) {
          self.setState({tripState: 2}, ()=>{
            self.showPolyline();
          });
        }
      });
    });
  }

  // 进入行程房间
  entryTrippingRoom() {

    if (this.state.isEntry) { return }

    var self = this;

    pomeloUtil.entryTrippingRoom(pomelo, Taro.getStorageSync('LOGIN_TOKEN'), this.state.ordernumber, function(err) {
      if (!!err) { return }
      self.setState({isEntry: true, tripState: 1});
      self.uploadCurrentLocation();
      self.getPolyline(function(_err) {
        self.refreshStatus();
      });
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
        extra={dayjs(this.state.createdTime).format('MM月DD日 HH:mm')}
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
                  <text style='font-size:150%; text-align:center; color:#53505F'>{this.state.distance > 1 ? this.state.distance.toFixed(2) : this.state.distance.toFixed(3) * 1000}</text>
                  <text style='font-size:90%; text-align:center; color:#535257'>{this.state.distance > 1 ? 'km' : 'm'}</text>
                </div>
                <div style='display:flex; justify-content:center;'>
                  <text style='color:#878787'>行驶距离</text>
                </div>
              </div>

              <div style='width:10vh; height:10vh;'>
                <div style='display:flex; flex-direction:row; align-items:center; justify-content:center;'>
                  <text style='font-size:150%; text-align:center; color:#53505F'>{this.state.speed > 1000 ? (this.state.speed / 1000.0).toFixed(2) : this.state.speed.toFixed(1)}</text>
                  <text style='font-size:90%; text-align:center; color:#535257'>{this.state.speed > 1000 ? 'km/s' : 'm/s'}</text>
                </div>
                <div style='display:flex; justify-content:center;'>
                  <text style='color:#878787'>{this.state.tripState === 1 ? '当前速度' : '平均速度'}</text>
                </div>
              </div>
            </div>

            <div style='display:flex; flex-direction:row; justify-content:space-around; left:0; right:0; margin:auto; width:90vw; height:6vh;'>
              {
                this.state.tripState === 1 || this.state.tripState === 3
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
                dottedLine: false
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

