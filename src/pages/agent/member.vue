<template>
  <div class="member-container">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-card shadow="never" class="search-card">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="用户名">
            <el-input
              v-model="searchForm.username"
              placeholder="请输入用户名"
              clearable
              style="width: 200px"
              @keyup.enter.native="handleSearch"
            />
          </el-form-item>

          <el-form-item label="注册时间">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              style="width: 240px"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleSearch">
              搜索
            </el-button>
            <el-button icon="el-icon-refresh" @click="handleReset">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 会员列表 -->
    <div class="table-section">
      <el-card shadow="never">
        <div slot="header" class="table-header">
          <span class="table-title">会员列表</span>
          <span class="total-count">共 {{ totalCount }} 人</span>
        </div>

        <el-table
          v-loading="loading"
          :data="memberList"
          stripe
          border
          style="width: 100%"
          empty-text="暂无数据"
        >
          <el-table-column
            prop="id"
            label="用户ID"
            width="100"
            align="center"
          />

          <el-table-column
            prop="name"
            label="用户名"
            width="150"
            show-overflow-tooltip
          />

          <el-table-column
            prop="created_at"
            label="注册时间"
            width="160"
            align="center"
          >
            <template slot-scope="scope">
              {{ formatDateTime(scope.row.created_at) }}
            </template>
          </el-table-column>

          <el-table-column
            prop="money"
            label="当前余额"
            width="120"
            align="right"
          >
            <template slot-scope="scope">
              <span class="money-text">{{ formatMoney(scope.row.money) }}</span>
            </template>
          </el-table-column>

          <el-table-column
            prop="money_rebate"
            label="返水余额"
            width="120"
            align="right"
          >
            <template slot-scope="scope">
              <span class="rebate-text">{{ formatMoney(scope.row.money_rebate) }}</span>
            </template>
          </el-table-column>

          <el-table-column
            prop="vip_grade"
            label="会员等级"
            width="100"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag
                :type="getVipTagType(scope.row.vip_grade)"
                size="small"
              >
                VIP{{ scope.row.vip_grade }}
              </el-tag>
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
import { memberApi } from '@/api/agentApi'

export default {
  name: 'Member',
  data() {
    return {
      // 搜索表单
      searchForm: {
        username: '',
        dateRange: []
      },

      // 会员列表数据
      memberList: [],
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
    this.loadMemberList()
  },

  methods: {

    /**
     * 加载会员列表
     */
    async loadMemberList() {
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
        const response = await memberApi(params)

        // 详细日志输出，帮助调试
        console.log('API 响应:', response)
        console.log('响应类型:', typeof response)
        console.log('响应状态码:', response.code)

        // 修改这里：你的后端返回的成功状态码是 200，不是传统的 1
        if (response.code === 200) {
          this.memberList = response.data.list || []
          this.totalCount = response.data.total || 0

          // 成功时也可以显示一个成功消息（可选）
          // this.$message.success('会员列表加载成功')
        } else {
          this.$message.error(response.message || '获取会员列表失败')
          this.memberList = []
          this.totalCount = 0
        }

      } catch (error) {
        // 更详细的错误日志
        console.error('加载会员列表详细错误信息:', error)
        console.error('错误类型:', error.name)
        console.error('错误消息:', error.message)
        console.error('错误堆栈:', error.stack)

        // 检查是否是网络错误还是业务逻辑错误
        if (error.response) {
          // 服务器返回了错误状态码
          console.error('服务器错误状态:', error.response.status)
          console.error('服务器错误数据:', error.response.data)
          this.$message.error(`服务器错误: ${error.response.status}`)
        } else if (error.request) {
          // 请求已发出但没有收到响应
          console.error('网络请求无响应:', error.request)
          this.$message.error('网络连接超时，请检查网络连接')
        } else {
          // 其他错误
          this.$message.error('请求配置错误或其他未知错误')
        }

        this.memberList = []
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
      this.loadMemberList()
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
      this.loadMemberList()
    },

    /**
     * 分页大小改变
     */
    handleSizeChange(val) {
      this.pagination.limit = val
      this.pagination.page = 1
      this.loadMemberList()
    },

    /**
     * 当前页改变
     */
    handleCurrentChange(val) {
      this.pagination.page = val
      this.loadMemberList()
    },

    /**
     * 格式化日期时间
     */
    formatDateTime(datetime) {
      if (!datetime) return '-'
      return datetime.replace(/:\d{2}$/, '') // 去掉秒数，只显示到分钟
    },

    /**
     * 格式化金额
     */
    formatMoney(amount) {
      if (amount === null || amount === undefined) return '0.00'
      return parseFloat(amount).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    /**
     * 获取VIP等级标签类型
     */
    getVipTagType(vipGrade) {
      if (vipGrade >= 5) return 'danger'   // 红色
      if (vipGrade >= 3) return 'warning'  // 橙色
      if (vipGrade >= 1) return 'success'  // 绿色
      return 'info'                        // 灰色
    }
  }
}
</script>

<style scoped>
.member-container {
  padding: 20px;
}

.search-section {
  margin-bottom: 20px;
}

.search-card {
  border: 1px solid #f0f0f0;
}

.search-form {
  margin-bottom: 0;
}

.table-section {
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.total-count {
  font-size: 14px;
  color: #909399;
}

.money-text {
  color: #67C23A;
  font-weight: 600;
}

.rebate-text {
  color: #E6A23C;
  font-weight: 600;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .member-container {
    padding: 10px;
  }

  .search-form {
    flex-direction: column;
  }

  .search-form .el-form-item {
    margin-right: 0;
    margin-bottom: 10px;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .total-count {
    margin-top: 5px;
  }

  .pagination-wrapper {
    text-align: center;
  }
}
</style>
