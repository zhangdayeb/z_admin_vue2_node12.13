<template>
  <div class="page-container">
    <div class="page-content">
      <!-- 页面标题 -->
      <el-card class="header-card" shadow="never">
        <div class="page-header">
          <h2 class="page-title">会员存款记录</h2>
          <p class="page-desc">查看您代理下会员的充值存款记录</p>
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

          <el-form-item label="充值时间">
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
          <h3>存款记录列表</h3>
          <div class="table-tools">
            <el-button
              size="small"
              icon="el-icon-refresh"
              @click="loadDepositRecordList"
            >
              刷新
            </el-button>
          </div>
        </div>

        <el-table
          :data="depositRecordList"
          v-loading="loading"
          border
          stripe
          style="width: 100%"
          empty-text="暂无存款记录"
        >
          <el-table-column
            type="index"
            label="序号"
            width="60"
            align="center"
          />

          <el-table-column
            prop="username"
            label="会员账号"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              <span class="username-text">{{ scope.row.username }}</span>
            </template>
          </el-table-column>

          <el-table-column
            prop="money"
            label="充值金额"
            width="120"
            align="right"
          >
            <template slot-scope="scope">
              <span class="money-text">￥{{ scope.row.money }}</span>
            </template>
          </el-table-column>

          <el-table-column
            prop="status"
            label="充值状态"
            width="100"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag
                :type="getStatusTagType(scope.row.status)"
                size="small"
              >
                {{ scope.row.status_text }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            prop="create_time"
            label="充值时间"
            width="160"
            align="center"
          >
            <template slot-scope="scope">
              {{ formatDateTime(scope.row.create_time) }}
            </template>
          </el-table-column>

          <el-table-column
            prop="success_time"
            label="到账时间"
            width="160"
            align="center"
          >
            <template slot-scope="scope">
              {{ formatDateTime(scope.row.success_time) }}
            </template>
          </el-table-column>

          <el-table-column
            prop="remark"
            label="备注"
            min-width="150"
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
import { memberDepositRecordApi } from '@/api/agentApi'

export default {
  name: 'MemberDepositRecord',
  data() {
    return {
      // 搜索表单
      searchForm: {
        username: '',
        dateRange: []
      },

      // 存款记录列表数据
      depositRecordList: [],
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
    this.loadDepositRecordList()
  },

  methods: {
    /**
     * 加载存款记录列表
     */
    async loadDepositRecordList() {
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
        const response = await memberDepositRecordApi(params)

        // 处理响应
        if (response.code === 200) {
          this.depositRecordList = response.data.list || []
          this.totalCount = response.data.total || 0
        } else {
          this.$message.error(response.message || '获取存款记录失败')
          this.depositRecordList = []
          this.totalCount = 0
        }

      } catch (error) {
        console.error('加载存款记录失败:', error)

        if (error.response) {
          this.$message.error(`服务器错误: ${error.response.status}`)
        } else if (error.request) {
          this.$message.error('网络连接超时，请检查网络连接')
        } else {
          this.$message.error('请求配置错误或其他未知错误')
        }

        this.depositRecordList = []
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
      this.loadDepositRecordList()
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
      this.loadDepositRecordList()
    },

    /**
     * 分页大小改变
     */
    handleSizeChange(val) {
      this.pagination.limit = val
      this.pagination.page = 1
      this.loadDepositRecordList()
    },

    /**
     * 当前页改变
     */
    handleCurrentChange(val) {
      this.pagination.page = val
      this.loadDepositRecordList()
    },

    /**
     * 获取状态标签类型
     */
    getStatusTagType(status) {
      const statusTypes = {
        0: 'warning',  // 待审核 - 橙色
        1: 'success',  // 已通过 - 绿色
        2: 'danger'    // 已拒绝 - 红色
      }
      return statusTypes[status] || 'info'
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
  max-width: 1200px;
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

.money-text {
  font-weight: 600;
  color: #f56c6c;
  font-family: 'Courier New', monospace;
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

/* 标签样式 */
.el-tag {
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container {
    padding: 10px;
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
}
</style>
