<template>
  <div class="page-container">
    <div class="page-content">
      <!-- 页面标题 -->
      <el-card class="header-card" shadow="never">
        <div class="page-header">
          <h2 class="page-title">会员返水记录</h2>
          <p class="page-desc">查看您代理下会员的游戏返水记录</p>
        </div>
      </el-card>

      <!-- 搜索区域 -->
      <el-card class="search-card" shadow="never">
        <el-form
          :model="searchForm"
          ref="searchForm"
          :inline="true"
          class="search-form"
        >
          <el-form-item label="会员账号">
            <el-input
              v-model="searchForm.username"
              placeholder="请输入会员账号"
              clearable
              style="width: 200px"
            />
          </el-form-item>

          <el-form-item label="返水时间">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              style="width: 300px"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="handleSearch"
            >
              搜索
            </el-button>
            <el-button
              icon="el-icon-refresh-left"
              @click="handleReset"
            >
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 数据表格 -->
      <el-card class="table-card" shadow="never">
        <div class="table-header">
          <h3>返水记录列表</h3>
          <div class="table-tools">
            <el-button
              size="small"
              icon="el-icon-refresh"
              @click="loadRebateRecordList"
            >
              刷新
            </el-button>
          </div>
        </div>

        <el-table
          :data="rebateRecordList"
          v-loading="loading"
          border
          stripe
          style="width: 100%"
          empty-text="暂无返水记录"
        >
          <el-table-column
            type="index"
            label="序号"
            width="80"
            align="center"
          />

          <el-table-column
            prop="username"
            label="会员账号"
            width="200"
            align="center"
          >
            <template slot-scope="scope">
              <span class="username-text">{{ scope.row.username }}</span>
            </template>
          </el-table-column>

          <el-table-column
            prop="money"
            label="返水金额"
            width="150"
            align="right"
          >
            <template slot-scope="scope">
              <span class="rebate-money-text">￥{{ scope.row.money }}</span>
            </template>
          </el-table-column>

          <el-table-column
            prop="create_time"
            label="返水时间"
            width="180"
            align="center"
          >
            <template slot-scope="scope">
              {{ formatDateTime(scope.row.create_time) }}
            </template>
          </el-table-column>

          <el-table-column
            prop="remark"
            label="备注"
            min-width="200"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>{{ scope.row.remark || '--' }}</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.page"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.limit"
            :total="totalCount"
            layout="total, sizes, prev, pager, next, jumper"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { memberRebateRecordApi } from '@/api/agentApi'

export default {
  name: 'MemberRebateRecord',
  data() {
    return {
      // 搜索表单
      searchForm: {
        username: '',
        dateRange: []
      },

      // 返水记录列表数据
      rebateRecordList: [],
      loading: false,
      totalCount: 0,

      // 分页参数
      pagination: {
        page: 1,
        limit: 20
      }
    }
  },

  mounted() {
    this.loadRebateRecordList()
  },

  methods: {
    /**
     * 加载返水记录列表
     */
    async loadRebateRecordList() {
      this.loading = true

      try {
        // 构建请求参数
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit
        }

        // 添加搜索条件
        if (this.searchForm.username) {
          params.username = this.searchForm.username
        }

        if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
          params.start_date = this.searchForm.dateRange[0]
          params.end_date = this.searchForm.dateRange[1]
        }

        // 调用API
        const response = await memberRebateRecordApi(params)

        // 处理响应
        if (response.code === 200) {
          this.rebateRecordList = response.data.list || []
          this.totalCount = response.data.total || 0
        } else {
          this.$message.error(response.message || '获取返水记录失败')
          this.rebateRecordList = []
          this.totalCount = 0
        }

      } catch (error) {
        console.error('加载返水记录失败:', error)

        if (error.response) {
          this.$message.error(`服务器错误: ${error.response.status}`)
        } else if (error.request) {
          this.$message.error('网络连接超时，请检查网络连接')
        } else {
          this.$message.error('请求配置错误或其他未知错误')
        }

        this.rebateRecordList = []
        this.totalCount = 0
      } finally {
        this.loading = false
      }
    },

    /**
     * 搜索处理
     */
    handleSearch() {
      this.pagination.page = 1 // 重置到第一页
      this.loadRebateRecordList()
    },

    /**
     * 重置搜索
     */
    handleReset() {
      this.searchForm = {
        username: '',
        dateRange: []
      }
      this.pagination.page = 1
      this.loadRebateRecordList()
    },

    /**
     * 分页大小改变
     */
    handleSizeChange(val) {
      this.pagination.limit = val
      this.pagination.page = 1
      this.loadRebateRecordList()
    },

    /**
     * 当前页改变
     */
    handleCurrentChange(val) {
      this.pagination.page = val
      this.loadRebateRecordList()
    },

    /**
     * 格式化日期时间
     */
    formatDateTime(dateTime) {
      if (!dateTime) return '--'

      try {
        const date = new Date(dateTime)
        if (isNaN(date.getTime())) return '--'

        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      } catch (error) {
        console.error('日期格式化失败:', error)
        return '--'
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-content {
  max-width: 1000px; /* 返水记录字段较少，使用较小的最大宽度 */
  margin: 0 auto;
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
  margin-bottom: 0;
}

.table-card {
  background: white;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.table-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.table-tools {
  display: flex;
  gap: 10px;
}

.username-text {
  font-weight: 600;
  color: #409eff;
}

.rebate-money-text {
  font-weight: 600;
  color: #67c23a; /* 绿色表示收益 */
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

/* 表格样式优化 */
.el-table {
  font-size: 14px;
}

.el-table th {
  background-color: #fafafa;
  color: #303133;
  font-weight: 600;
}

.el-table--border td,
.el-table--border th {
  border-right: 1px solid #ebeef5;
}

/* 表格行悬停效果 */
.el-table .el-table__body tr:hover > td {
  background-color: #f5f7fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container {
    padding: 10px;
  }

  .page-content {
    max-width: 100%;
  }

  .search-form {
    flex-direction: column;
  }

  .search-form .el-form-item {
    margin-right: 0;
    margin-bottom: 15px;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .pagination-wrapper {
    text-align: center;
  }

  /* 小屏幕下调整表格列宽 */
  .el-table .el-table__cell:nth-child(1) {
    width: 60px;
  }

  .el-table .el-table__cell:nth-child(2) {
    min-width: 120px;
  }

  .el-table .el-table__cell:nth-child(3) {
    width: 120px;
  }

  .el-table .el-table__cell:nth-child(4) {
    width: 140px;
  }
}

/* 返水金额突出显示 */
.rebate-money-text {
  position: relative;
}

.rebate-money-text::before {
  content: '💰';
  margin-right: 4px;
  font-size: 12px;
}

/* 空数据状态优化 */
.el-table__empty-text {
  color: #909399;
  font-size: 14px;
}
</style>
