import axios from '@/utils/request';

export function loginApi(params) {
  return axios.post({
    url: '/login/login',
    data: params
  }).then((res) => {
    return res
  })
}


// 集团信息获取
export function setGroupApi(params) {
  return axios.post({
    url: '/set/group',
    data: params
  }).then((res) => {
    return res
  })
}
