import { ADD, MINUS, LOGIN, LOGOUT, SETUSERINFO } from '../constants/counter'

const INITIAL_STATE = {
  num: 0,
  userState: {
    isLogin: false,
    token: ''
  },
  userInfo: {
    nickName: '',
    avatarURL: ''
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
      case SETUSERINFO:
       return {
         ...state,
         userInfo: { nickName: action.nickName, avatarURL: action.avatarURL }
       }
     default:
       return state
  }
}
