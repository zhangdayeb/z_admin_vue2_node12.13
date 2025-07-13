<template>
  <div class="statistical-reports-container">
    <el-card class="header-card">
      <div class="page-header">
        <h2 class="page-title">财务统计</h2>
        <p class="page-desc">查看代理下属会员的充值、提现、游戏输赢统计数据</p>
      </div>
    </el-card>

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="时间范围：">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            style="width: 240px;">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="用户名：">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            style="width: 160px;"
            clearable>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            <i class="el-icon-search"></i> 查询
          </el-button>
          <el-button @click="handleReset">
            <i class="el-icon-refresh-left"></i> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片区域 -->
    <div class="statistics-grid" v-loading="loading">
      <!-- 充值统计 -->
      <el-card class="statistic-card recharge-card">
        <div class="statistic-content">
          <div class="statistic-icon">
            <i class="el-icon-money"></i>
          </div>
          <div class="statistic-info">
            <h3 class="statistic-title">总充值金额</h3>
            <p class="statistic-value">¥{{ statisticsData.total_recharge_amount }}</p>
            <p class="statistic-subtitle">共 {{ statisticsData.total_recharge_count }} 笔</p>
          </div>
        </div>
      </el-card>

      <!-- 提现统计 -->
      <el-card class="statistic-card withdraw-card">
        <div class="statistic-content">
          <div class="statistic-icon">
            <i class="el-icon-wallet"></i>
          </div>
          <div class="statistic-info">
            <h3 class="statistic-title">总提现金额</h3>
            <p class="statistic-value">¥{{ statisticsData.total_withdraw_amount }}</p>
            <p class="statistic-subtitle">共 {{ statisticsData.total_withdraw_count }} 笔</p>
          </div>
        </div>
      </el-card>

      <!-- 游戏输金额 -->
      <el-card class="statistic-card lose-card">
        <div class="statistic-content">
          <div class="statistic-icon">
            <i class="el-icon-remove-outline"></i>
          </div>
          <div class="statistic-info">
            <h3 class="statistic-title">游戏总输</h3>
            <p class="statistic-value">¥{{ statisticsData.total_game_lose }}</p>
            <p class="statistic-subtitle">会员游戏输钱总额</p>
          </div>
        </div>
      </el-card>

      <!-- 游戏赢金额 -->
      <el-card class="statistic-card win-card">
        <div class="statistic-content">
          <div class="statistic-icon">
            <i class="el-icon-circle-plus-outline"></i>
          </div>
          <div class="statistic-info">
            <h3 class="statistic-title">游戏总赢</h3>
            <p class="statistic-value">¥{{ statisticsData.total_game_win }}</p>
            <p class="statistic-subtitle">会员游戏赢钱总额</p>
          </div>
        </div>
      </el-card>

      <!-- 盈亏统计 -->
      <el-card class="statistic-card profit-card">
        <div class="statistic-content">
          <div class="statistic-icon">
            <i class="el-icon-data-line"></i>
          </div>
          <div class="statistic-info">
            <h3 class="statistic-title">游戏盈亏</h3>
            <p class="statistic-value" :class="profitClass">{{ profitAmount }}</p>
            <p class="statistic-subtitle">{{ profitText }}</p>
          </div>
        </div>
      </el-card>

      <!-- 资金流入流出 -->
      <el-card class="statistic-card flow-card">
        <div class="statistic-content">
          <div class="statistic-icon">
            <i class="el-icon-sort"></i>
          </div>
          <div class="statistic-info">
            <h3 class="statistic-title">资金净流入</h3>
            <p class="statistic-value" :class="flowClass">{{ flowAmount }}</p>
            <p class="statistic-subtitle">充值减去提现</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-if="!hasData && !loading">
      <i class="el-icon-pie-chart"></i>
      <p>暂无统计数据</p>
      <p class="empty-tips">请调整搜索条件或确认是否有下属会员</p>
    </div>
  </div>
</template>

<script>
import { statisticalReportsApi } from '@/api/agentApi'

export default {
  name: 'StatisticalReports',
  data() {
    return {
      loading: false,
      searchForm: {
        username: '',
        dateRange: []
      },
      statisticsData: {
        total_recharge_amount: '0.00',
        total_recharge_count: 0,
        total_withdraw_amount: '0.00',
        total_withdraw_count: 0,
        total_game_lose: '0.00',
        total_game_win: '0.00'
      },
      // 日期选择器配置
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },

  computed: {
    // 是否有数据
    hasData() {
      return parseFloat(this.statisticsData.total_recharge_amount) > 0 ||
             parseFloat(this.statisticsData.total_withdraw_amount) > 0 ||
             parseFloat(this.statisticsData.total_game_lose) > 0 ||
             parseFloat(this.statisticsData.total_game_win) > 0
    },

    // 游戏盈亏金额（输 - 赢，正数表示平台盈利）
    profitAmount() {
      const lose = parseFloat(this.statisticsData.total_game_lose) || 0
      const win = parseFloat(this.statisticsData.total_game_win) || 0
      const profit = lose - win
      return profit >= 0 ? `¥${profit.toFixed(2)}` : `-¥${Math.abs(profit).toFixed(2)}`
    },

    // 盈亏样式类
    profitClass() {
      const lose = parseFloat(this.statisticsData.total_game_lose) || 0
      const win = parseFloat(this.statisticsData.total_game_win) || 0
      return lose >= win ? 'profit-positive' : 'profit-negative'
    },

    // 盈亏描述文本
    profitText() {
      const lose = parseFloat(this.statisticsData.total_game_lose) || 0
      const win = parseFloat(this.statisticsData.total_game_win) || 0
      return lose >= win ? '平台盈利' : '平台亏损'
    },

    // 资金净流入（充值 - 提现）
    flowAmount() {
      const recharge = parseFloat(this.statisticsData.total_recharge_amount) || 0
      const withdraw = parseFloat(this.statisticsData.total_withdraw_amount) || 0
      const flow = recharge - withdraw
      return flow >= 0 ? `¥${flow.toFixed(2)}` : `-¥${Math.abs(flow).toFixed(2)}`
    },

    // 流入流出样式类
    flowClass() {
      const recharge = parseFloat(this.statisticsData.total_recharge_amount) || 0
      const withdraw = parseFloat(this.statisticsData.total_withdraw_amount) || 0
      return recharge >= withdraw ? 'flow-positive' : 'flow-negative'
    }
  },

  created() {
    this.loadStatisticsData()
  },

  methods: {
    /**
     * 加载统计数据
     */
    async loadStatisticsData() {
      this.loading = true
      try {
        const params = this.buildSearchParams()
        const response = await statisticalReportsApi(params)

        if (response.code === 200) {
          this.statisticsData = response.data
        } else {
          this.$message.error(response.msg || '获取统计数据失败')
          this.resetStatisticsData()
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
        this.$message.error('网络错误，请稍后重试')
        this.resetStatisticsData()
      } finally {
        this.loading = false
      }
    },

    /**
     * 构建搜索参数
     */
    buildSearchParams() {
      const params = {
        username: this.searchForm.username
      }

      // 处理时间范围
      if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
        params.start_date = this.searchForm.dateRange[0]
        params.end_date = this.searchForm.dateRange[1]
      }

      return params
    },

    /**
     * 重置统计数据
     */
    resetStatisticsData() {
      this.statisticsData = {
        total_recharge_amount: '0.00',
        total_recharge_count: 0,
        total_withdraw_amount: '0.00',
        total_withdraw_count: 0,
        total_game_lose: '0.00',
        total_game_win: '0.00'
      }
    },

    /**
     * 搜索处理
     */
    handleSearch() {
      this.loadStatisticsData()
    },

    /**
     * 重置搜索
     */
    handleReset() {
      this.searchForm = {
        username: '',
        dateRange: []
      }
      this.loadStatisticsData()
    }
  }
}
</script>

<style scoped>
.statistical-reports-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header-card {
  margin-bottom: 20px;
}

.page-header {
  text-align: center;
}

.page-title {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.page-desc {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.statistic-card {
  transition: all 0.3s ease;
  cursor: default;
}

.statistic-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.statistic-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.statistic-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.recharge-card .statistic-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.withdraw-card .statistic-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.lose-card .statistic-icon {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.win-card .statistic-icon {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.profit-card .statistic-icon {
  background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
}

.flow-card .statistic-icon {
  background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%);
}

.statistic-info {
  flex: 1;
}

.statistic-title {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.statistic-value {
  margin: 0 0 4px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
}

.statistic-subtitle {
  margin: 0;
  color: #909399;
  font-size: 12px;
}

.profit-positive {
  color: #67C23A;
}

.profit-negative {
  color: #F56C6C;
}

.flow-positive {
  color: #409EFF;
}

.flow-negative {
  color: #E6A23C;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
  color: #DCDFE6;
}

.empty-state p {
  margin: 8px 0;
  font-size: 16px;
}

.empty-tips {
  font-size: 14px;
  color: #C0C4CC;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .statistical-reports-container {
    padding: 10px;
  }

  .statistics-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .search-form {
    flex-direction: column;
    align-items: stretch;
  }

  .search-form .el-form-item {
    margin-bottom: 15px;
  }

  .statistic-content {
    padding: 15px 10px;
  }

  .statistic-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
    margin-right: 12px;
  }

  .statistic-value {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .statistic-content {
    flex-direction: column;
    text-align: center;
  }

  .statistic-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>
