import axios from "axios"
import store from '../store'
import router from '../router'
import { baseUrl, group_prefix } from "./config.js"
import { Message } from "element-ui"
import qs from 'qs'
import { getToken, removeToken } from "@/utils/auth"  // 导入统一的auth工具函数

let cancel, promiseArr = {}
const CancelToken = axios.CancelToken
const source = CancelToken.source()

//请求拦截器
axios.interceptors.request.use(
  config => {
    config.cancelToken = source.token // 全局添加cancelToken

    //发起请求时，取消掉当前正在进行的相同请求
    if (promiseArr[config.url]) {
      promiseArr[config.url]("操作取消")
      promiseArr[config.url] = cancel
    } else {
      promiseArr[config.url] = cancel
    }

    // 拼接域名
    config.url = baseUrl + config.url

    // 使用统一的 getToken() 获取token
    const token = getToken()

    // 设置请求头 - JWT标准格式
    config.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': token ? `Bearer ${token}` : '', // JWT标准格式
      'group_prefix': group_prefix, // 从配置文件读取
      ...config.headers // 保留可能的自定义headers
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

//响应拦截器即异常处理
//响应拦截器即异常处理
axios.interceptors.response.use(
  response => {
    let { code, msg, message } = response.data

    // 支持多种成功状态码格式
    const successCodes = [1, 200] // 添加200作为成功状态码

    //登录页不需要提示
    if (!successCodes.includes(code) && !window.location.hash.includes('login')) {
      Message.error(msg || message || '请求失败')
    }

    // token验证失败，重新登录
    if (code === 7) {
      setTimeout(() => {
        document.getElementsByTagName("html")[0].removeAttribute('class') // 移除暗黑主题
        removeToken() // 使用统一的清除token函数
        store.dispatch('user/setLoginStatus', false)
        router.replace('/login')
        router.go(0)
      }, 1500)
    }

    if (response) {
      return response
    }
  },
  err => {
    // 网络错误处理
    console.error('网络请求错误:', err)

    if (err && err.response) {
      switch (err.response.status) {
        case 400:
          err.message = "错误请求 - 请求参数有误"
          break
        case 401:
          err.message = "未授权 - 请重新登录"
          // 401状态码处理 - 清除token并跳转登录
          removeToken()
          store.dispatch('user/setLoginStatus', false)
          if (!window.location.hash.includes('login')) {
            router.replace('/login')
          }
          break
        case 403:
          err.message = "拒绝访问 - 权限不足"
          break
        case 404:
          err.message = "请求错误 - 未找到该资源"
          break
        case 500:
          err.message = "服务器内部错误"
          break
        case 502:
          err.message = "网关错误"
          break
        case 503:
          err.message = "服务不可用"
          break
        case 504:
          err.message = "网关超时"
          break
        default:
          err.message = `连接错误 ${err.response.status}`
      }
    } else if (err.code === 'ECONNABORTED') {
      err.message = "请求超时，请稍后重试"
    } else if (err.message.includes('Network Error')) {
      err.message = "网络连接失败，请检查网络"
    } else {
      err.message = "连接到服务器失败"
    }

    // 显示错误消息
    if (err && err.message) {
      Message.error(err.message)
    }

    return Promise.reject(err)
  }
)

// 设置默认超时时间
axios.defaults.timeout = 100000

//get请求方式
function get(config) {
  return new Promise((resolve, reject) => {
    axios({
      url: config.url,
      method: "get",
      params: config.data
    })
    .then(res => {
      resolve(res.data)
    })
    .catch(err => {
      reject(err)
    })
  })
}

//post请求方式
function post(config) {
  return new Promise((resolve, reject) => {
    // 确保data存在
    if (config.data == undefined) {
      config.data = {}
    }

    axios({
      url: config.url,
      method: "post",
      data: qs.stringify(config.data)
    })
    .then(res => {
      resolve(res.data)
    })
    .catch(err => {
      reject(err)
    })
  })
}

export default {
  get,
  post
}
