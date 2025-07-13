<template>
  <div class="page-container">
    <div class="page-content">
      <!-- 页面标题 -->
      <el-card class="header-card" shadow="never">
        <div class="page-header">
          <h1 class="page-title">会员余额记录</h1>
        </div>
      </el-card>

      <!-- 搜索表单 -->
      <el-card class="search-card" shadow="never">
        <el-form
          :model="searchForm"
          class="search-form"
          inline
          size="medium"
        >
          <el-form-item label="会员账号">
            <el-input
              v-model="searchForm.username"
              placeholder="请输入会员账号"
              clearable
              style="width: 200px"
            />
          </el-form-item>

          <el-form-item label="时间范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
              style="width: 240px"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSearch" :loading="loading">
              搜索
            </el-button>
            <el-button @click="handleReset">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 数据表格 -->
      <el-card class="table-card" shadow="never">
        <el-table
          :data="tableData"
          style="width: 100%"
          v-loading="loading"
          border
          stripe
          empty-text="暂无数据"
        >
          <el-table-column
            type="index"
            label="序号"
            width="60"
            align="center"
          />

          <el-table-column
            prop="username"
            label="用户名"
            width="120"
            align="center"
          />

          <el-table-column
            prop="type_text"
            label="类型"
            width="100"
            align="center"
          />

          <el-table-column
            prop="money"
            label="金额"
            width="120"
            align="right"
          >
            <template slot-scope="scope">
              ￥{{ scope.row.money }}
            </template>
          </el-table-column>

          <el-table-column
            prop="create_time"
            label="时间"
            width="150"
            align="center"
          />
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.page"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.limit"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { memberBalanceRecordApi } from '@/api/agentApi'

export default {
  name: 'MemberBalanceRecord',
  data() {
    return {
      loading: false,
      tableData: [],
      searchForm: {
        username: '',
        dateRange: null
      },
      pagination: {
        page: 1,
        limit: 20,
        total: 0
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    // 加载数据
    async loadData() {
      try {
        this.loading = true

        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          username: this.searchForm.username,
          start_date: this.searchForm.dateRange ? this.searchForm.dateRange[0] : '',
          end_date: this.searchForm.dateRange ? this.searchForm.dateRange[1] : ''
        }

        const response = await memberBalanceRecordApi(params)

        if (response.code === 200) {
          this.tableData = response.data.list || []
          this.pagination.total = response.data.total || 0
        } else {
          this.$message.error(response.msg || '获取数据失败')
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('网络错误，请稍后重试')
      } finally {
        this.loading = false
      }
    },

    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.loadData()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        username: '',
        dateRange: null
      }
      this.pagination.page = 1
      this.loadData()
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.pagination.limit = val
      this.pagination.page = 1
      this.loadData()
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.pagination.page = val
      this.loadData()
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
  max-width: 1400px;
  margin: 0 auto;
}

.header-card {
  margin-bottom: 20px;
}

.page-header {
  text-align: center;
}

.page-title {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
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

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.el-table {
  font-size: 14px;
}

.el-table th {
  background-color: #fafafa;
  color: #303133;
  font-weight: 600;
}
</style>
