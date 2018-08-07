import {
  ADD,
  MINUS,
  LOGIN,
  LOGOUT,
  SETUSERINFO
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
    type: SETUSERINFO,
    nickName: nickName,
    avatarURL: avatarURL
  }
}