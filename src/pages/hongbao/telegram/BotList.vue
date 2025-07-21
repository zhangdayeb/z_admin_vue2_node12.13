<template>
  <div class="bot-list-container">
    <div class="page-header">
      <h2>机器人列表</h2>
      <p>管理Telegram机器人配置</p>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="搜索">
          <el-input
            v-model="searchForm.search"
            placeholder="请输入机器人名称、用户名或ID"
            style="width: 300px;"
            clearable
            @keyup.enter.native="handleSearch"
          >
            <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <div slot="header" class="card-header">
        <span>机器人列表</span>
        <div class="header-actions">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-refresh"
            @click="loadBotList"
          >
            刷新
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="botList"
        style="width: 100%"
        stripe
        border
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <el-table-column prop="tg_bot_name" label="机器人名称" min-width="150">
          <template slot-scope="scope">
            <span v-if="scope.row.tg_bot_name">{{ scope.row.tg_bot_name }}</span>
            <span v-else class="text-muted">未设置</span>
          </template>
        </el-table-column>

        <el-table-column prop="tg_bot_username" label="用户名" min-width="150">
          <template slot-scope="scope">
            <span v-if="scope.row.tg_bot_username">@{{ scope.row.tg_bot_username }}</span>
            <span v-else class="text-muted">未设置</span>
          </template>
        </el-table-column>

        <el-table-column prop="tg_bot_id" label="机器人ID" min-width="120">
          <template slot-scope="scope">
            <span v-if="scope.row.tg_bot_id">{{ scope.row.tg_bot_id }}</span>
            <span v-else class="text-muted">未设置</span>
          </template>
        </el-table-column>

        <el-table-column prop="tg_bot_token" label="Token" min-width="120">
          <template slot-scope="scope">
            <span v-if="scope.row.tg_bot_token">{{ scope.row.tg_bot_token }}</span>
            <span v-else class="text-muted">未设置</span>
          </template>
        </el-table-column>

        <el-table-column label="配置状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.has_welcome ? 'success' : 'warning'"
              size="small"
            >
              {{ scope.row.has_welcome ? '已配置' : '未配置' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="按钮数量" width="100" align="center">
          <template slot-scope="scope">
            <el-badge :value="scope.row.button_count" class="badge-item">
              <el-button size="mini" type="text">{{ scope.row.button_count }}个</el-button>
            </el-badge>
          </template>
        </el-table-column>

        <el-table-column prop="welcome" label="欢迎消息" min-width="200">
          <template slot-scope="scope">
            <span v-if="scope.row.welcome" class="welcome-text">{{ scope.row.welcome }}</span>
            <span v-else class="text-muted">未设置</span>
          </template>
        </el-table-column>

        <el-table-column prop="updated_at" label="更新时间" width="160" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.updated_at">{{ formatTime(scope.row.updated_at) }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              @click="editBot(scope.row)"
            >
              编辑配置
            </el-button>
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
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { getBotListApi } from '@/api/telegramApi'
import dayjs from 'dayjs'

export default {
  name: 'BotList',
  data() {
    return {
      loading: false,

      // 搜索表单
      searchForm: {
        search: ''
      },

      // 机器人列表
      botList: [],

      // 分页信息
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      }
    }
  },

  mounted() {
    this.loadBotList()
  },

  methods: {
    // 加载机器人列表
    async loadBotList() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          search: this.searchForm.search
        }

        const res = await getBotListApi(params)

        if (res.code === 200) {
          this.botList = res.data.list || []
          this.pagination.total = res.data.total || 0
          this.pagination.pages = res.data.pages || 0
        } else {
          this.$message.error(res.message || '获取机器人列表失败')
        }
      } catch (error) {
        console.error('获取机器人列表失败:', error)
        this.$message.error('网络错误，请稍后重试')
      } finally {
        this.loading = false
      }
    },

    // 搜索
    handleSearch() {
      this.pagination.page = 1 // 重置到第一页
      this.loadBotList()
    },

    // 重置搜索
    resetSearch() {
      this.searchForm.search = ''
      this.pagination.page = 1
      this.loadBotList()
    },

    // 编辑机器人配置
    editBot(row) {
      // 跳转到配置页面，传递机器人ID
      this.$router.push({
        path: '/hongbao/telegram/config',
        query: { bot_id: row.id }
      })
    },

    // 分页 - 每页条数改变
    handleSizeChange(val) {
      this.pagination.limit = val
      this.pagination.page = 1
      this.loadBotList()
    },

    // 分页 - 当前页改变
    handleCurrentChange(val) {
      this.pagination.page = val
      this.loadBotList()
    },

    // 格式化时间
    formatTime(time) {
      if (!time) return '-'
      return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>

<style scoped>
.bot-list-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin: 0;
}

.table-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.text-muted {
  color: #909399;
  font-style: italic;
}

.welcome-text {
  color: #606266;
  line-height: 1.4;
}

.badge-item {
  margin-right: 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 表格样式优化 */
.el-table {
  font-size: 14px;
}

.el-table th {
  background-color: #f8f9fa;
  color: #303133;
  font-weight: 600;
}

.el-table td {
  padding: 12px 0;
}

/* 响应式处理 */
@media (max-width: 768px) {
  .bot-list-container {
    padding: 10px;
  }

  .search-form {
    flex-direction: column;
  }

  .search-form .el-form-item {
    margin-right: 0;
    margin-bottom: 10px;
  }
}

/* 卡片样式 */
.el-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.el-card ::v-deep .el-card__header {
  border-bottom: 1px solid #f0f0f0;
  padding: 18px 20px;
}

.el-card ::v-deep .el-card__body {
  padding: 20px;
}
</style>
