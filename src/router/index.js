import Vue from 'vue'
import store from '@/store'
import Router from 'vue-router'
import Home from '@/pages/home/Home.vue'
import Console from '@/pages/dashboard/Console'
import setting from '@/config/setting'

Vue.use(Router)

// 基础路由配置（无需权限验证）
const routes = [
  { path: '/', redirect: '/dashboard/console' },
  {
    path: '/dashboard',
    component: Home,
    meta: { title: '首页' },
    children: [{ path: 'console', component: Console, meta: { title: '控制面板' } }]
  },
  {
    path: '/login',
    component: () => import('@/pages/login/Login'),
    meta: { title: '登录', newPage: true }
  },
  {
    path: '/exception',
    component: Home,
    meta: { title: '异常页面' },
    children: [
      { path: '403', component: () => import('@/pages/exception/403'), meta: { title: '403' } },
      { path: '404', component: () => import('@/pages/exception/404'), meta: { title: '404' } },
      { path: '500', component: () => import('@/pages/exception/500'), meta: { title: '500' } }
    ]
  }
]

// 权限路由配置（需要登录验证）
export const allowRouters = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('@/pages/login/Login'), meta: { title: '登陆' } },

  // 仪表板模块
  {
    path: '/dashboard',
    component: Home,
    meta: { title: '控制面板' },
    children: [
      { path: 'console', component: Console, meta: { title: '控制台' } }
    ]
  },
  // 代理管理
  {
    path: '/log',
    component: Home,
    meta: { title: '日志' },
    children: [
      { path: 'agent_withdraw_log', component: () => import('@/pages/log/agent_withdraw_log'), meta: { title: '代理提现' } },
      { path: 'fanshui_log', component: () => import('@/pages/log/fanshui_log'), meta: { title: '返水列表' } },
      { path: 'game_log', component: () => import('@/pages/log/game_log'), meta: { title: '游戏记录' } },
      { path: 'top_up_log', component: () => import('@/pages/log/top_up_log'), meta: { title: '充值列表' } },
      { path: 'user_withdraw_log', component: () => import('@/pages/log/user_withdraw_log'), meta: { title: '用户提现' } }
    ]
  },
  {
    path: '/activity',
    component: Home,
    meta: { title: '活动' },
    children: [
      { path: 'activity_list', component: () => import('@/pages/activity/activity_list'), meta: { title: '活动列表' } }
    ]
  },
  {
    path: '/money',
    component: Home,
    meta: { title: '公司账号' },
    children: [
      { path: 'account', component: () => import('@/pages/money/account'), meta: { title: '公司账号' } }
    ]
  },
  {
    path: '/notice',
    component: Home,
    meta: { title: '通知' },
    children: [
      { path: 'notice_list', component: () => import('@/pages/notice/notice_list'), meta: { title: '通知列表' } }
    ]
  },
  {
    path: '/user',
    component: Home,
    meta: { title: '记录管理' },
    children: [
      { path: 'agent_list', component: () => import('@/pages/user/agent_list'), meta: { title: '代理列表' } },
      { path: 'user_list', component: () => import('@/pages/user/user_list'), meta: { title: '会员列表' } }
    ]
  }
]

// 创建路由实例
const router = new Router({
  routes: allowRouters
})

// 路由前置守卫
router.beforeEach((to, from, next) => {
  let isLogin = false
  const { meta, matched } = to
  const { title, newPage, keepAlive } = meta

  // 获取用户登录状态
  const sys = JSON.parse(localStorage.getItem("sys"))
  if (sys) {
    isLogin = sys.user.isLogin
  }

  // 设置keepAlive状态
  to.params.keepAlive = keepAlive

  // 权限验证（当前被注释，可根据需要开启）
  // if (!isLogin && to.path !== '/login') {
  //   next('/login')
  //   return
  // }

  // 菜单数据加载检查
  const { menuList } = store.state.menu
  if (menuList.length > 0 && !matched.length) {
    router.push('/exception/404')
    return
  }

  next()

  // 新页面不加入标签页管理
  if (newPage) return

  // 标签页管理
  store.dispatch('worktab/worktabRoute', {
    to: {
      name: to.name || '',
      title: (to.meta && title) || '',
      path: to.path,
      params: to.params
    },
    from: {
      name: from.name || '',
      title: (from.meta && from.meta.title) || '',
      path: from.path,
      params: to.params
    }
  })

  // 设置页面标题
  if (title) {
    document.title = title
    // document.title = `${title} - ${setting.systemName}` // 如需完整标题格式
  }
})

export default router
