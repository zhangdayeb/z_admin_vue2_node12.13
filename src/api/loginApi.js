import axios from '@/utils/request';

export function loginApi(params) {
  return axios.post({
    url: '/login/login',
    data: params
  }).then((res) => {
    return res
  })
}
