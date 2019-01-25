import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtCard, AtButton } from "taro-ui"
import './index.scss'

import { Get } from "../../util/NetworkUtil"

import sos_icon from './images/sos.png'
import security_icon from './images/security.png'
import end_icon from './images/end.png'

import async from 'async'
import dayjs from 'dayjs'

/* 正在出行(观察者模式) */
export default class Index extends Component {

  config = {
    navigationBarTitleText: '行程守护'
  }

  state = {
    isConnect: false,
    isEntry: false,
    followState: 0, // 0: 未知, 1: 已关注, 2: 未关注
    eventIntervalId: null,

    ordernumber: null,
    tripState: 0, // 0: 未知, 1: 进行时, 2: 已结束, 3: 失联中
    tripCreatorid: null,
    createdTime: '-/-',
    lastUpdatedTime: '-/-',
    polyline: [],
    
    
    mapScale : 14,
    longitude: "113.324520",
    latitude: "23.099994",
    showLocation: false,
    markers: [],
    
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
  }

  componentDidMount () { }

  componentWillUnmount () {
    clearInterval(this.state.eventIntervalId);
  }

  componentDidShow () {
    var self = this;
    if (this.state.tripState === 2) { return }
    // 循环事件
    var eventIntervalId = setInterval(()=>{
      if (self.state.tripState === 1 || self.state.tripState === 3) {
        // 显示最新出现的位置
        self.showLastLocation();
      }
    }, 3000);

    this.setState({eventIntervalId: eventIntervalId}, ()=> {
      // self.doConnect();

      self.mapCtx = wx.createMapContext('myMap');
    });

    this.getTripInfo();
  }

  componentDidHide () {
    clearInterval(this.state.eventIntervalId);
    // this.setState({eventIntervalId: null});
  }

  /*    自定义函数    */

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

      // 当前速度


      this.setState({lengthOfTime: lengthOfTime < 1 ? 1 : lengthOfTime, distance: distance});
    } else if (this.state.tripState === 2) {
      // 时长
      var createdTime = this.state.createdTime;
      var endTime = this.state.lastUpdatedTime; // 此时,最后更新时间就是行程结束时间
      lengthOfTime = dayjs(endTime).diff(dayjs(createdTime), 'minutes');

      // 距离
      distance = this.computePolylineDistance(this.state.polyline);

      // 行程平均配速
      speed = (distance * 1000) / (dayjs(endTime).diff(dayjs(createdTime), 'second')); // 米/分钟
      console.log('平均速度:', speed);
      this.setState({lengthOfTime: lengthOfTime < 1 ? 1 : lengthOfTime, distance: distance, speed: speed});
    }
  }

  // 显示最新出现的位置
  showLastLocation() {
    var self = this
    Get('/trip/wxmp/info', { ordernumber:this.state.ordernumber }, true, (result)=> {
      if (result.code === 200) {
        var mapScale = self.state.mapScale
        if (self.state.longitude !== result.lastlocation.longitude || self.state.latitude !== result.lastlocation.latitude) {
          mapScale = 16
        }
        self.setState({
          createdTime: result.ctime,
          lastUpdatedTime: result.lastlocation ? result.lastlocation.time : result.ctime,
          tripState: result.state,
          tripCreatorid: result.creatorid,
          longitude: result.lastlocation.longitude,
          latitude: result.lastlocation.latitude,
          lastUpdatedTime: result.lastlocation.time,
          mapScale: mapScale
        }, ()=> {
          if (self.state.tripState === 1 || self.state.tripState === 3) {
            self.translateMarker()
          } else {
            self.showPolyline()
          }
        })
      } else {
        self.reLaunchToIndex()
      }
    })

    
  }

  translateMarker() {
    var self = this
    self.mapCtx.translateMarker({
      markerId: 1,
      autoRotate: false,
      duration: 1000,
      destination: {
        latitude: this.state.latitude,
        longitude: this.state.longitude,
      },
      animationEnd() {
        var polyline = self.state.polyline;
        var startTime = self.state.lastUpdatedTime;
        var lengthOfTime = dayjs().diff(dayjs(startTime), 'second');
        var distance = self.computePolylineDistance([
          {longitude: self.state.longitude, latitude: self.state.latitude},
          {longitude: self.state.longitude, latitude: self.state.latitude}
        ]);
        var speed = distance * 1000 / lengthOfTime;

        self.setState({
          longitude: self.state.longitude, 
          latitude: self.state.latitude,
          lastUpdatedTime: dayjs().format(),
          polyline: polyline.concat({longitude: self.state.longitude, latitude: self.state.latitude}),
          speed: speed
        });
        self.refreshStatus()
        // self.mapCtx.moveToLocation()
      }
    })
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
    _getpolyline([], 0, 10, callback)

    function _getpolyline(polyline, pageno, pagesize, callback) {
      Get('/trip/wxmp/polyline', { ordernumber:self.state.ordernumber, pageno:pageno, pagesize:pagesize }, true, (result)=> {
        if (result.code === 200) {
          var newPolyline = polyline.concat(result.polyline);
          if (result.polyline.length > 0) {
            _getpolyline(newPolyline, pageno+1, pagesize, callback)
          } else {
            self.setState({ polyline:newPolyline }, ()=> {
              callback(null, newPolyline)
            })
          }
        } else {
          callback('获取路线出错', null)
        }
      })
    }
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
      // console.log("计算结果",s)
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
    var self = this
    Get('/trip/wxmp/info', { ordernumber:this.state.ordernumber }, true, (result)=> {
      if (result.code === 200) {
        self.setState({
          createdTime: result.ctime,
          lastUpdatedTime: result.lastlocation ? result.lastlocation.time : result.ctime,
          tripState: result.state,
          tripCreatorid: result.creatorid,
          longitude: result.lastlocation.longitude,
          latitude: result.lastlocation.latitude,
          lastUpdatedTime: result.lastlocation.time,
          markers: [{id: 1, latitude: result.lastlocation.latitude, longitude: result.lastlocation.longitude, name: '当前位置'}]
        }, ()=> {
          // if (self.state.tripState === 1 || self.state.tripState === 3) {
          //   self.entryWatchingRoom();
          // }
          self.showPolyline();
          self.getFollowState();
        })
      } else {
        self.reLaunchToIndex()
      }
    })
  }

  // 添加关注
  addFollow() {
    if (!this.state.tripCreatorid || this.state.followState === 1) { return }
    var self = this
    Get('/user/wxmp/follow/add', {uid: this.state.tripCreatorid}, true, (result)=> {
      self.getFollowState();
    })
  }
  // 取消关注
  cancelFollow() {
    if (!this.state.tripCreatorid || this.state.followState !== 1) { return }
    var self = this
    Get('/user/wxmp/follow/remove', {uid: this.state.tripCreatorid}, true, (result)=> {
      self.getFollowState();
    })
  }
  // 查询关注状态
  getFollowState() {
    if (!this.state.tripCreatorid) { return }
    var self = this
    Get('/user/wxmp/follow/state', {uid: this.state.tripCreatorid}, true, (result)=> {
      if (result.code === 200) {
        self.setState({followState: result.isfollow ? 1 : 2});
      }
    })
  }

  // 分享行程
  onShareAppMessage(Object) {
    return {
      title: '请求你的保护',
      path: '/pages/index/index?event=watching&ordernumber='+this.state.ordernumber
    }
  }

  // 关闭当前页,返回到index页面,一般用于出错时
  reLaunchToIndex() {
    Taro.reLaunch({url: '/pages/index/index'});
  }

  render () {
    return (
      <View className='index'>
        <AtCard
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
                this.state.followState === 1
                ? <AtButton type='primary' size='normal' style='width:50vw;' onClick={this.cancelFollow}>取消关注</AtButton>
                : <AtButton type='primary' size='normal' style='width:50vw;' onClick={this.addFollow}>关注Ta</AtButton>
              }
              <AtButton type='secondary' openType='share'>分享给朋友</AtButton>
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
             show-location = {false}
             markers = {this.state.markers}>
 
          {/* <CoverView style='position:flex; position:absolute; bottom:25PX; width:100vw; height:90PX;'> */}
            {/* <view style='position: absolute; z-index:199; left:0; top:0; width: 74PX; height: 74PX; background: url(images/icon-spin-s.png) no-repeat; animation: spin 800ms infinite linear;'></CoverView> */}
            {/* <CoverView style='position:absolute; left:0; top:0; right:0; bottom:0; margin:auto; width:66PX; height:66PX; background-color:white; border:2PX solid #DC143C; border-radius:33PX; box-shadow: 0 0 15PX #4E4E4E;' > */}
                {/* <CoverImage style='position:absolute; left:0; top:0; right:0; bottom:0; margin:auto; width:66%; height:66%;' src={sos_icon} onClick={this.createTripOrder} /> */}
            {/* </CoverView> */}
          {/* </CoverView> */}

          {/* <CoverView style='position:fixed; bottom:122PX; left:10PX; z-index:99; width:44PX; height:44PX;'> */}
            {/* <Button style='position:absolute; left:0; top:0; right:0; bottom:0; margin:auto; width:99%; height:99%;' onClick={this.showLastLocation.bind(this)} hoverClass='none'>⊙</Button> */}
          {/* </CoverView> */}

        </map>

      </View>
    )
  }
}

