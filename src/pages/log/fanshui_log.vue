<template>
  <div class="fanshui-log-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>返水记录管理</h2>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="search-container">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="用户ID">
          <el-input
            v-model="searchForm.uid"
            placeholder="请输入用户ID"
            clearable
            style="width: 120px"
          />
        </el-form-item>

        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 350px"
          />
        </el-form-item>

        <el-form-item label="金额范围">
          <el-input
            v-model="searchForm.min_money"
            placeholder="最小金额"
            type="number"
            style="width: 100px"
          />
          <span style="margin: 0 8px">-</span>
          <el-input
            v-model="searchForm.max_money"
            placeholder="最大金额"
            type="number"
            style="width: 100px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">新增返水</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计信息 -->
    <div class="statistics-container" v-if="statistics">
      <el-card class="statistics-card">
        <div class="statistics-content">
          <div class="stat-item">
            <span class="stat-label">总记录数：</span>
            <span class="stat-value">{{ statistics.total_count || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总返水金额：</span>
            <span class="stat-value amount">{{ formatMoney(statistics.total_money) }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column prop="id" label="记录ID" width="80" />

        <el-table-column label="用户信息" width="150">
          <template slot-scope="scope">
            <div>
              <div>ID: {{ scope.row.uid }}</div>
              <div style="color: #409EFF">{{ scope.row.user_name || '未知用户' }}</div>
              <div v-if="scope.row.nick_name" style="color: #909399; font-size: 12px">
                昵称: {{ scope.row.nick_name }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="金额信息" width="200">
          <template slot-scope="scope">
            <div>
              <div style="color: #E6A23C">返水: {{ formatMoney(scope.row.money) }}</div>
              <div style="color: #909399; font-size: 12px">
                前: {{ formatMoney(scope.row.money_before) }}
              </div>
              <div style="color: #909399; font-size: 12px">
                后: {{ formatMoney(scope.row.money_end) }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="create_time" label="创建时间" width="160" />

        <el-table-column prop="remark" label="备注" min-width="150">
          <template slot-scope="scope">
            <span :title="scope.row.remark">{{ scope.row.remark || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="text" style="color: #F56C6C" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 批量操作 -->
    <div class="batch-actions" v-if="selectedRows.length > 0">
      <el-button type="danger" @click="handleBatchDelete">
        批量删除 ({{ selectedRows.length }})
      </el-button>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form
        :model="form"
        :rules="rules"
        ref="form"
        label-width="100px"
      >
        <el-form-item label="用户ID" prop="uid">
          <el-input
            v-model="form.uid"
            placeholder="请输入用户ID"
            :disabled="isEdit"
          />
        </el-form-item>

        <el-form-item label="返水金额" prop="money">
          <el-input
            v-model="form.money"
            placeholder="请输入返水金额"
            type="number"
            step="0.01"
          >
            <template slot="append">元</template>
          </el-input>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fanshuiLogApi, fanshuiLogAddApi, fanshuiLogEditApi, fanshuiLogDelApi } from '@/api/adminApi'

export default {
  name: 'FanshuiLog',
  data() {
    return {
      // 搜索表单
      searchForm: {
        uid: '',
        dateRange: null,
        min_money: '',
        max_money: ''
      },

      // 表格数据
      tableData: [],
      loading: false,
      selectedRows: [],

      // 分页信息
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0
      },

      // 统计信息
      statistics: {},

      // 弹窗相关
      dialogVisible: false,
      isEdit: false,
      submitLoading: false,

      // 表单数据
      form: {
        id: '',
        uid: '',
        money: '',
        remark: ''
      },

      // 表单验证规则
      rules: {
        uid: [
          { required: true, message: '请输入用户ID', trigger: 'blur' },
          { pattern: /^\d+$/, message: '用户ID必须为数字', trigger: 'blur' }
        ],
        money: [
          { required: true, message: '请输入返水金额', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (!value || value <= 0) {
                callback(new Error('返水金额必须大于0'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },

  computed: {
    dialogTitle() {
      return this.isEdit ? '编辑返水记录' : '新增返水记录'
    }
  },

  mounted() {
    this.loadData()
  },

  methods: {
    // 加载数据
    async loadData() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          ...this.getSearchParams()
        }

        const response = await fanshuiLogApi(params)

        if (response.code === 200) {
          this.tableData = response.data.list || []
          this.pagination.total = response.data.total || 0
          this.statistics = response.data.statistics || {}
        } else {
          this.$message.error(response.message || '获取数据失败')
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
      }
    },

    // 获取搜索参数
    getSearchParams() {
      const params = {}

      if (this.searchForm.uid) {
        params.uid = this.searchForm.uid
      }

      if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
        params.start_time = this.searchForm.dateRange[0]
        params.end_time = this.searchForm.dateRange[1]
      }

      if (this.searchForm.min_money) {
        params.min_money = this.searchForm.min_money
      }

      if (this.searchForm.max_money) {
        params.max_money = this.searchForm.max_money
      }

      return params
    },

    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.loadData()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        uid: '',
        dateRange: null,
        min_money: '',
        max_money: ''
      }
      this.pagination.page = 1
      this.loadData()
    },

    // 新增
    handleAdd() {
      this.isEdit = false
      this.resetForm()
      this.dialogVisible = true
    },

    // 编辑
    handleEdit(row) {
      this.isEdit = true
      this.form = {
        id: row.id,
        uid: row.uid,
        money: row.money,
        remark: row.remark || ''
      }
      this.dialogVisible = true
    },

    // 删除单个
    handleDelete(row) {
      this.$confirm(`确定要删除用户 ${row.user_name}(ID:${row.uid}) 的返水记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await fanshuiLogDelApi({ id: row.id })

          if (response.code === 200) {
            this.$message.success('删除成功')
            this.loadData()
          } else {
            this.$message.error(response.message || '删除失败')
          }
        } catch (error) {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      })
    },

    // 批量删除
    handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的记录')
        return
      }

      this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 条记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const ids = this.selectedRows.map(row => row.id)
          const response = await fanshuiLogDelApi({ ids })

          if (response.code === 200) {
            this.$message.success('批量删除成功')
            this.selectedRows = []
            this.loadData()
          } else {
            this.$message.error(response.message || '批量删除失败')
          }
        } catch (error) {
          console.error('批量删除失败:', error)
          this.$message.error('批量删除失败')
        }
      })
    },

    // 提交表单
    handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return

        this.submitLoading = true

        try {
          let response

          if (this.isEdit) {
            response = await fanshuiLogEditApi(this.form)
          } else {
            response = await fanshuiLogAddApi(this.form)
          }

          if (response.code === 200) {
            this.$message.success(this.isEdit ? '编辑成功' : '新增成功')
            this.dialogVisible = false
            this.loadData()
          } else {
            this.$message.error(response.message || '操作失败')
          }
        } catch (error) {
          console.error('提交失败:', error)
          this.$message.error('操作失败')
        } finally {
          this.submitLoading = false
        }
      })
    },

    // 重置表单
    resetForm() {
      this.form = {
        id: '',
        uid: '',
        money: '',
        remark: ''
      }

      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },

    // 表格选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 分页大小变化
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.page = 1
      this.loadData()
    },

    // 分页页码变化
    handleCurrentChange(page) {
      this.pagination.page = page
      this.loadData()
    },

    // 格式化金额
    formatMoney(amount) {
      if (!amount) return '0.00'
      return parseFloat(amount).toFixed(2)
    }
  }
}
</script>

<style scoped>
.fanshui-log-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.search-container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.search-form .el-form-item {
  margin-bottom: 10px;
}

.statistics-container {
  margin-bottom: 20px;
}

.statistics-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.statistics-content {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-left: 8px;
}

.stat-value.amount {
  color: #E6A23C;
}

.table-container {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.batch-actions {
  margin: 15px 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .search-form .el-form-item {
    width: 100%;
  }

  .statistics-content {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
