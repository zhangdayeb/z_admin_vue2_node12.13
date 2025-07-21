import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import 'default-passive-events'
import "@css/reset.scss"               // 重置HTML样式、
import "@css/app.scss"                 // 全局样式
import "@css/el-ui.scss"               // 优化element样式
import '@css/dark.scss'                // 暗黑主题
import "@/assets/icon/iconfont.css"    // 图标库
import "@/assets/icon/iconfont.js"     // 彩色图标
import ElementUI from 'element-ui'     // 组件库
import vuescroll from 'vuescroll'      // 滚动插件
import i18n from './lang/i18n'         // 多语言
import VCharts from 'v-charts'         // echarts封装版
import components from '@/components'  // 注册全局组件
import derectives from '@/directives'  // 注册全局指令
import minTool from '@/common/minTool'

// 🆕 添加富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 在现有的 main.js 中添加
import { setGroupApi } from '@/api/loginApi' // 引入获取配置的API
import { setGroupPrefix } from '@/utils/config'


Vue.use(components)
Vue.use(derectives)
Vue.use(vuescroll)
Vue.use(VCharts)
Vue.use(ElementUI, { size: 'small', zIndex: 3000 }) // 全局设置element组件默认大小

// 🆕 注册富文本编辑器
Vue.use(VueQuillEditor)

Vue.prototype.$echarts = echarts
Vue.prototype.$minTool = minTool
Vue.config.productionTip = false


// 初始化配置
async function initConfig() {
  localStorage.clear()
  try {
    const res = await setGroupApi({})
    if (res.code === 200 ) {
      setGroupPrefix(res.data.group_prefix)
    }
  } catch (error) {
    console.warn('获取配置失败，使用默认配置:', error)
  }
}

// 在创建 Vue 实例前调用
initConfig().then(() => {
  new Vue({
    el: '#app',
    router,
    store,
    i18n,
    components: { App },
    template: '<App/>'
  })
})
