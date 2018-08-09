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

const INITIAL_STATE = {
  num: 0,
  userState: {
    isLogin: false,
    token: ''
  },
  userInfo: {
    nickName: '',
    avatarURL: ''
  },
  tripInfo: {
    orderNumber: '',
    createdTime: ''
  },
  tripState: {
    state: 0,
    polyline: [],
    logs: []
  }
}

export default function counter (state = INITIAL_STATE, action) {
  switch (action.type) {
    case ADD:
      return {
        ...state,
        num: state.num + 1
      }
     case MINUS:
       return {
         ...state,
         num: state.num - 1
       }
     case LOGIN:
       return {
         ...state,
         userState: { isLogin: true, token: action.token }
       }
     case LOGOUT:
       return {
         ...state,
         userState: { isLogin: false, token: '' },
         userInfo: { nickName: '', avatarURL: '' }
       }
      case SET_USER_INFO:
       return {
         ...state,
         userInfo: { nickName: action.nickName, avatarURL: action.avatarURL }
       }
      case SET_TRIP_INFO:
       return {
         ...state,
         tripInfo: { orderNumber: action.orderNumber, createdTime: action.createdTime }
       }
      case SET_TRIP_STATE:
       return {
         ...state,
         tripState: { state: action.state, polyline: action.polyline, logs: action.logs }
       }
      case APPEND_TRIP_LOCATION_POINTS:
       return {
         ...state,
         tripState: { polyline: state.tripState.polyline.concat(action.points) }
       }
      case APPEND_TRIP_LOGS:
       return {
         ...state,
         tripState: { logs: state.tripState.logs.concat(action.logs) }
       }
      case RESET_TRIP:
       return {
         ...state,
         tripInfo: { orderNumber: '', createdTime: '' },
         tripState: { state: 0, polyline: [], logs: [] }
       }
     default:
       return state
  }
}
