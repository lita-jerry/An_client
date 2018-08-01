import {
  ADD,
  MINUS,
  LOGIN,
  LOGOUT
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
export const login = (token, nickName, avatarURL) => {
  return {
    type: LOGIN,
    token: token,
    nickName: nickName,
    avatarURL: avatarURL
  }
}

// 用户注销
export const logout = () => {
  return {
    type: LOGOUT
  }
}