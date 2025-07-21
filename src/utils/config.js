export const baseUrl = 'https://zadminapi.ampj998.top'

// 配置相关的工具函数
const GROUP_PREFIX_KEY = 'group_prefix'

// 获取 group_prefix
export function getGroupPrefix() {
  return localStorage.getItem(GROUP_PREFIX_KEY) || ''
}

// 设置 group_prefix
export function setGroupPrefix(prefix) {
  console.log('设置 group_prefix:', prefix)
  if (prefix) {
    localStorage.setItem(GROUP_PREFIX_KEY, prefix)
  }
}

// 清除 group_prefix
export function removeGroupPrefix() {
  localStorage.removeItem(GROUP_PREFIX_KEY)
}
