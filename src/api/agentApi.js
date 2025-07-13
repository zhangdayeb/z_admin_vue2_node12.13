import axios from '@/utils/request';

// 所属会员列表
export function memberApi(params) {
  return axios.post({
    url: '/agent/member',
    data: params
  }).then((res) => {
    return res
  })
}

// 推广信息
export function promotionApi(params) {
  return axios.post({
    url: '/agent/promotion',
    data: params
  }).then((res) => {
    return res
  })
}

// 所属会员统计记录
export function statisticalReportsApi(params) {
  return axios.post({
    url: '/agent/statistical_reports',
    data: params
  }).then((res) => {
    return res
  })
}

// 所属会员余额变动记录
export function memberBalanceRecordApi(params) {
  return axios.post({
    url: '/agent/member_balance_record',
    data: params
  }).then((res) => {
    return res
  })
}

// 所属会员游戏记录
export function memberGameRecordApi(params) {
  return axios.post({
    url: '/agent/member_game_record',
    data: params
  }).then((res) => {
    return res
  })
}

// 所属会员存款记录
export function memberDepositRecordApi(params) {
  return axios.post({
    url: '/agent/member_deposit_record',
    data: params
  }).then((res) => {
    return res
  })
}

// 所属会员取款记录
export function memberWithdrawalRecordApi(params) {
  return axios.post({
    url: '/agent/member_withdrawal_record',
    data: params
  }).then((res) => {
    return res
  })
}

// 所属会员返水记录
export function memberRebateRecordApi(params) {
  return axios.post({
    url: '/agent/member_rebate_record',
    data: params
  }).then((res) => {
    return res
  })
}
