import {
  ADD,
  MINUS,
  LOGIN,
  LOGOUT,
  SET_USER_INFO,
  SET_TRIP_INFO,
  SET_TRIP_STATE,
  APPEND_TRIP_LOCATION_POINTS,
  APPEND_TRIP_LOGS,
  RESET_TRIP
} from '../constants/counter'

export const add = () => {
  return {
    type: ADD
  }
}
export const minus = () => {
  return {
    type: MINUS
  }
}

// 异步的action
export function asyncAdd () {
  return dispatch => {
    setTimeout(() => {
      dispatch(add())
    }, 2000)
  }
}

// 用户登录
export const login = (token) => {
  return {
    type: LOGIN,
    token: token
  }
}

// 用户注销
export const logout = () => {
  return {
    type: LOGOUT
  }
}

// 设置用户信息
export const setUserInfo = (nickName, avatarURL) => {
  return {
    type: SET_USER_INFO,
    nickName: nickName,
    avatarURL: avatarURL
  }
}

// 设置行程信息
export const setTripInfo = (orderNumber, createdTime) => {
  return {
    type: SET_TRIP_INFO,
    orderNumber: orderNumber,
    createdTime: createdTime
  }
}

// 设置行程状态
export const setTripState = (state, polyline, logs) => {
  return {
    type: SET_TRIP_STATE,
    state: state,
    polyline: polyline,
    logs: logs
  }
}

// 添加位置坐标点
export const appendTripLocationPoints = (points) => {
  return {
    type: APPEND_TRIP_LOCATION_POINTS,
    points: points
  }
}

// 添加行程日志
export const appendTripLogs = (logs) => {
  return {
    type: APPEND_TRIP_LOGS,
    logs: logs
  }
}

// 重置行程信息和状态
export const resetTrip = () => {
  return {
    type: RESET_TRIP
  }
}