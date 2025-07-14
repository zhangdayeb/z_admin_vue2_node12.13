import axios from '@/utils/request';

// 代理提现记录 列表
export function agentWithdrawLogListApi(params) {
  return axios.post({
    url: '/log/agent_withdraw_log_list',
    data: params
  }).then((res) => {
    return res
  })
}

// 代理提现记录 编辑
export function agentWithdrawLogEditApi(params) {
  return axios.post({
    url: '/log/agent_withdraw_log_edit',
    data: params
  }).then((res) => {
    return res
  })
}

// 代理提现记录 删除
export function agentWithdrawLogDelApi(params) {
  return axios.post({
    url: '/log/agent_withdraw_log_del',
    data: params
  }).then((res) => {
    return res
  })
}

// 会员提现记录 列表
export function userWithdrawLogListApi(params) {
  return axios.post({
    url: '/log/user_withdraw_log_list',
    data: params
  }).then((res) => {
    return res
  })
}

// 会员提现记录 编辑
export function userWithdrawLogEditApi(params) {
  return axios.post({
    url: '/log/user_withdraw_log_edit',
    data: params
  }).then((res) => {
    return res
  })
}

// 会员提现记录 删除
export function userWithdrawLogDelApi(params) {
  return axios.post({
    url: '/log/user_withdraw_log_del',
    data: params
  }).then((res) => {
    return res
  })
}

// 会员存款记录 列表
export function topUpLogListApi(params) {
  return axios.post({
    url: '/log/top_up_log_list',
    data: params
  }).then((res) => {
    return res
  })
}

// 会员存款记录 编辑
export function topUpLogEditApi(params) {
  return axios.post({
    url: '/log/top_up_log_edit',
    data: params
  }).then((res) => {
    return res
  })
}

// 会员存款记录 删除
export function topUpLogDelApi(params) {
  return axios.post({
    url: '/log/top_up_log_del',
    data: params
  }).then((res) => {
    return res
  })
}

// 会员返水记录 列表
export function fanshuiLogApi(params) {
  return axios.post({
    url: '/log/fanshui_log',
    data: params
  }).then((res) => {
    return res
  })
}

// 会员返水记录 删除
export function fanshuiLogDelApi(params) {
  return axios.post({
    url: '/log/fanshui_log_del',
    data: params
  }).then((res) => {
    return res
  })
}

// 会员游戏记录 列表
export function gameLogApi(params) {
  return axios.post({
    url: '/log/game_log',
    data: params
  }).then((res) => {
    return res
  })
}

// 会员游戏记录 删除
export function gameLogDelApi(params) {
  return axios.post({
    url: '/log/game_log_del',
    data: params
  }).then((res) => {
    return res
  })
}

// 代理列表 列表
export function agentListApi(params) {
  return axios.post({
    url: '/user/agent_list',
    data: params
  }).then((res) => {
    return res
  })
}

// 代理列表 新增
export function agentAddApi(params) {
  return axios.post({
    url: '/user/agent_add',
    data: params
  }).then((res) => {
    return res
  })
}

// 代理列表 编辑
export function agentEditApi(params) {
  return axios.post({
    url: '/user/agent_edit',
    data: params
  }).then((res) => {
    return res
  })
}

// 代理列表 删除
export function agentDelApi(params) {
  return axios.post({
    url: '/user/agent_del',
    data: params
  }).then((res) => {
    return res
  })
}

// 会员列表 列表
export function userListApi(params) {
  return axios.post({
    url: '/user/user_list',
    data: params
  }).then((res) => {
    return res
  })
}

// 会员列表 新增
export function userAddApi(params) {
  return axios.post({
    url: '/user/user_add',
    data: params
  }).then((res) => {
    return res
  })
}

// 会员列表 编辑
export function userEditApi(params) {
  return axios.post({
    url: '/user/user_edit',
    data: params
  }).then((res) => {
    return res
  })
}

// 会员列表 删除
export function userDelApi(params) {
  return axios.post({
    url: '/user/user_del',
    data: params
  }).then((res) => {
    return res
  })
}

// 活动列表 类型
export function activityTypeApi(params) {
  return axios.post({
    url: '/activity/activity_type',
    data: params
  }).then((res) => {
    return res
  })
}

// 活动列表 列表
export function activityListApi(params) {
  return axios.post({
    url: '/activity/activity_list',
    data: params
  }).then((res) => {
    return res
  })
}

// 活动列表 新增
export function activityAddApi(params) {
  return axios.post({
    url: '/activity/activity_add',
    data: params
  }).then((res) => {
    return res
  })
}

// 活动列表 编辑
export function activityEditApi(params) {
  return axios.post({
    url: '/activity/activity_edit',
    data: params
  }).then((res) => {
    return res
  })
}

// 活动列表 删除
export function activityDelApi(params) {
  return axios.post({
    url: '/activity/activity_del',
    data: params
  }).then((res) => {
    return res
  })
}

// 公司账号 列表
export function accountListApi(params) {
  return axios.post({
    url: '/money/account_list',
    data: params
  }).then((res) => {
    return res
  })
}

// 公司账号 新增
export function accountListAddApi(params) {
  return axios.post({
    url: '/money/account_add',
    data: params
  }).then((res) => {
    return res
  })
}

// 公司账号 编辑
export function accountListEditApi(params) {
  return axios.post({
    url: '/money/account_edit',
    data: params
  }).then((res) => {
    return res
  })
}

// 公司账号 删除
export function accountListDelApi(params) {
  return axios.post({
    url: '/money/account_del',
    data: params
  }).then((res) => {
    return res
  })
}

// 通知列表 列表
export function noticeListApi(params) {
  return axios.post({
    url: '/notice/notice_list',
    data: params
  }).then((res) => {
    return res
  })
}

// 通知列表 新增
export function noticeListAddApi(params) {
  return axios.post({
    url: '/notice/notice_add',
    data: params
  }).then((res) => {
    return res
  })
}

// 通知列表 编辑
export function noticeListEditApi(params) {
  return axios.post({
    url: '/notice/notice_edit',
    data: params
  }).then((res) => {
    return res
  })
}

// 通知列表 删除
export function noticeListDelApi(params) {
  return axios.post({
    url: '/notice/notice_del',
    data: params
  }).then((res) => {
    return res
  })
}
