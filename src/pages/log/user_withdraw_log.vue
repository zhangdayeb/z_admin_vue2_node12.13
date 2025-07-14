<template>
  <div class="user-withdraw-log">
    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline label-width="80px">
        <el-form-item label="用户ID">
          <el-input
            v-model="searchForm.user_id"
            placeholder="请输入用户ID"
            clearable
            style="width: 150px;"
          />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.user_name"
            placeholder="请输入用户名"
            clearable
            style="width: 150px;"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px;">
            <el-option label="待审核" value="0" />
            <el-option label="已通过" value="1" />
            <el-option label="已拒绝" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-input
            v-model="searchForm.pay_type"
            placeholder="请输入支付方式"
            clearable
            style="width: 120px;"
          />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 350px;"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <i class="el-icon-search"></i>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <i class="el-icon-refresh"></i>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮 -->
    <el-card class="operation-card" shadow="never">
      <div class="operation-bar">
        <div class="left">
          <el-button type="primary" @click="handleAdd">
            <i class="el-icon-plus"></i>
            新增记录
          </el-button>
          <el-button
            type="danger"
            :disabled="selectedRows.length === 0"
            @click="handleBatchDelete"
          >
            <i class="el-icon-delete"></i>
            批量删除
          </el-button>
        </div>
        <div class="right">
          <el-button @click="loadData">
            <i class="el-icon-refresh"></i>
            刷新
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :span="6">
        <el-card class="statistics-card">
          <div class="statistics-item">
            <div class="label">总记录数</div>
            <div class="value">{{ statistics.total_count || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="statistics-card">
          <div class="statistics-item">
            <div class="label">提现总额</div>
            <div class="value">{{ formatMoney(statistics.total_money) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="statistics-card">
          <div class="statistics-item">
            <div class="label">手续费总额</div>
            <div class="value">{{ formatMoney(statistics.total_fee) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="statistics-card">
          <div class="statistics-item">
            <div class="label">实际到账总额</div>
            <div class="value">{{ formatMoney(statistics.total_actual) }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        stripe
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户信息" width="180">
          <template slot-scope="{ row }">
            <div>
              <div>ID: {{ row.u_id }}</div>
              <div>用户名: {{ row.user_name || '-' }}</div>
              <div v-if="row.nick_name">昵称: {{ row.nick_name }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="提现金额" width="120">
          <template slot-scope="{ row }">
            <span class="money-text">{{ formatMoney(row.money) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="手续费" width="100">
          <template slot-scope="{ row }">
            <span class="fee-text">{{ formatMoney(row.money_fee) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="实际到账" width="120">
          <template slot-scope="{ row }">
            <span class="actual-text">{{ formatMoney(row.momey_actual) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="pay_type" label="支付方式" width="100" />
        <el-table-column label="收款信息" width="200">
          <template slot-scope="{ row }">
            <div v-if="row.u_bank_name || row.u_back_card">
              <div>银行: {{ row.u_bank_name || '-' }}</div>
              <div>卡号: {{ row.u_back_card || '-' }}</div>
              <div>姓名: {{ row.u_back_user_name || '-' }}</div>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template slot-scope="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="申请时间" width="160" />
        <el-table-column prop="success_time" label="审核时间" width="160" />
        <el-table-column prop="admin_name" label="审核人" width="100" />
        <el-table-column prop="msg" label="备注" width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="{ row }">
            <el-button
              v-if="row.status == 0"
              type="success"
              size="small"
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status == 0"
              type="warning"
              size="small"
              @click="handleReject(row)"
            >
              拒绝
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="row.status == 0"
              type="danger"
              size="small"
              @click="handleDelete([row.id])"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="用户ID" prop="u_id">
          <el-input v-model="formData.u_id" placeholder="请输入用户ID" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="提现金额" prop="money">
          <el-input-number
            v-model="formData.money"
            :min="0.01"
            :precision="2"
            placeholder="请输入提现金额"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="手续费" prop="money_fee">
          <el-input-number
            v-model="formData.money_fee"
            :min="0"
            :precision="2"
            placeholder="请输入手续费"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="实际到账" prop="momey_actual">
          <el-input-number
            v-model="formData.momey_actual"
            :min="0"
            :precision="2"
            placeholder="请输入实际到账金额"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="支付方式" prop="pay_type">
          <el-input v-model="formData.pay_type" placeholder="请输入支付方式" />
        </el-form-item>
        <el-form-item label="收款银行">
          <el-input v-model="formData.u_bank_name" placeholder="请输入收款银行" />
        </el-form-item>
        <el-form-item label="收款卡号">
          <el-input v-model="formData.u_back_card" placeholder="请输入收款卡号" />
        </el-form-item>
        <el-form-item label="收款姓名">
          <el-input v-model="formData.u_back_user_name" placeholder="请输入收款姓名" />
        </el-form-item>
        <el-form-item label="用户IP">
          <el-input v-model="formData.u_ip" placeholder="请输入用户IP" />
        </el-form-item>
        <el-form-item label="用户地区">
          <el-input v-model="formData.u_city" placeholder="请输入用户地区" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="formData.msg"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 审核弹窗 -->
    <el-dialog
      :title="auditTitle"
      :visible.sync="auditDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="auditForm" label-width="80px">
        <el-form-item label="审核状态">
          <el-tag :type="auditForm.status == 1 ? 'success' : 'danger'">
            {{ auditForm.status == 1 ? '审核通过' : '审核拒绝' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input
            v-model="auditForm.msg"
            type="textarea"
            :rows="4"
            placeholder="请输入审核备注（拒绝时必填）"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAuditSubmit" :loading="auditLoading">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  userWithdrawLogListApi,
  userWithdrawLogAddApi,
  userWithdrawLogEditApi,
  userWithdrawLogDelApi
} from '@/api/adminApi'

export default {
  name: 'UserWithdrawLog',
  data() {
    return {
      loading: false,
      tableData: [],
      selectedRows: [],
      statistics: {},

      // 搜索表单
      searchForm: {
        user_id: '',
        user_name: '',
        status: '',
        pay_type: '',
        admin_uid: '',
        start_time: '',
        end_time: ''
      },

      dateRange: [],

      // 分页
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0
      },

      // 弹窗相关
      dialogVisible: false,
      isEdit: false,
      submitLoading: false,

      // 审核弹窗
      auditDialogVisible: false,
      auditLoading: false,
      auditForm: {
        id: '',
        status: 1,
        msg: ''
      },

      // 表单数据
      formData: {
        id: '',
        u_id: '',
        money: 0,
        money_fee: 0,
        momey_actual: 0,
        pay_type: '',
        u_bank_name: '',
        u_back_card: '',
        u_back_user_name: '',
        u_ip: '',
        u_city: '',
        msg: ''
      },

      // 表单验证规则
      formRules: {
        u_id: [
          { required: true, message: '请输入用户ID', trigger: 'blur' }
        ],
        money: [
          { required: true, message: '请输入提现金额', trigger: 'blur' },
          { type: 'number', min: 0.01, message: '提现金额必须大于0', trigger: 'blur' }
        ]
      }
    }
  },

  computed: {
    dialogTitle() {
      return this.isEdit ? '编辑提现记录' : '新增提现记录'
    },

    auditTitle() {
      return this.auditForm.status == 1 ? '审核通过确认' : '审核拒绝确认'
    }
  },

  watch: {
    dateRange(newVal) {
      if (newVal && newVal.length === 2) {
        this.searchForm.start_time = newVal[0]
        this.searchForm.end_time = newVal[1]
      } else {
        this.searchForm.start_time = ''
        this.searchForm.end_time = ''
      }
    }
  },

  mounted() {
    this.loadData()
  },

  methods: {
    async loadData() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          ...this.searchForm
        }

        const response = await userWithdrawLogListApi(params)
        if (response.code === 200) {
          this.tableData = response.data.list || []
          this.pagination.total = response.data.total || 0
          this.statistics = response.data.statistics || {}
        } else {
          this.$message.error(response.message || '获取数据失败')
        }
      } catch (error) {
        this.$message.error('获取数据失败')
        console.error('Load data error:', error)
      } finally {
        this.loading = false
      }
    },

    handleSearch() {
      this.pagination.page = 1
      this.loadData()
    },

    handleReset() {
      Object.keys(this.searchForm).forEach(key => {
        this.searchForm[key] = ''
      })
      this.dateRange = []
      this.pagination.page = 1
      this.loadData()
    },

    handleAdd() {
      this.isEdit = false
      this.resetForm()
      this.dialogVisible = true
    },

    handleEdit(row) {
      this.isEdit = true
      Object.keys(this.formData).forEach(key => {
        this.formData[key] = row[key] || ''
      })
      this.dialogVisible = true
    },

    handleApprove(row) {
      this.auditForm.id = row.id
      this.auditForm.status = 1
      this.auditForm.msg = ''
      this.auditDialogVisible = true
    },

    handleReject(row) {
      this.auditForm.id = row.id
      this.auditForm.status = 2
      this.auditForm.msg = ''
      this.auditDialogVisible = true
    },

    handleSubmit() {
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            const api = this.isEdit ? userWithdrawLogEditApi : userWithdrawLogAddApi
            const response = await api(this.formData)

            if (response.code === 200) {
              this.$message.success(response.message || '操作成功')
              this.dialogVisible = false
              this.loadData()
            } else {
              this.$message.error(response.message || '操作失败')
            }
          } catch (error) {
            this.$message.error('操作失败')
            console.error('Submit error:', error)
          } finally {
            this.submitLoading = false
          }
        }
      })
    },

    async handleAuditSubmit() {
      if (this.auditForm.status == 2 && !this.auditForm.msg.trim()) {
        this.$message.warning('拒绝审核时必须填写备注')
        return
      }

      this.auditLoading = true
      try {
        const response = await userWithdrawLogEditApi(this.auditForm)
        if (response.code === 200) {
          this.$message.success(response.message || '审核成功')
          this.auditDialogVisible = false
          this.loadData()
        } else {
          this.$message.error(response.message || '审核失败')
        }
      } catch (error) {
        this.$message.error('审核失败')
        console.error('Audit error:', error)
      } finally {
        this.auditLoading = false
      }
    },

    async handleDelete(ids) {
      try {
        await this.$confirm(
          `确定要删除这${ids.length}条记录吗？删除后将退还用户余额。`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )

        const response = await userWithdrawLogDelApi({ ids })
        if (response.code === 200) {
          this.$message.success(response.message || '删除成功')
          this.loadData()
          this.selectedRows = []
        } else {
          this.$message.error(response.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
          console.error('Delete error:', error)
        }
      }
    },

    handleBatchDelete() {
      const ids = this.selectedRows.map(row => row.id)
      this.handleDelete(ids)
    },

    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.page = 1
      this.loadData()
    },

    handleCurrentChange(val) {
      this.pagination.page = val
      this.loadData()
    },

    resetForm() {
      Object.keys(this.formData).forEach(key => {
        if (typeof this.formData[key] === 'number') {
          this.formData[key] = 0
        } else {
          this.formData[key] = ''
        }
      })
      if (this.$refs.formRef) {
        this.$refs.formRef.clearValidate()
      }
    },

    formatMoney(amount) {
      if (!amount && amount !== 0) return '0.00'
      return Number(amount).toFixed(2)
    },

    getStatusType(status) {
      const statusMap = {
        0: 'warning',
        1: 'success',
        2: 'danger'
      }
      return statusMap[status] || 'info'
    },

    getStatusText(status) {
      const statusMap = {
        0: '待审核',
        1: '已通过',
        2: '已拒绝'
      }
      return statusMap[status] || '未知'
    }
  }
}
</script>

<style scoped>
.user-withdraw-log {
  padding: 20px;
}

.search-card,
.operation-card,
.table-card {
  margin-bottom: 20px;
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistics-row {
  margin-bottom: 20px;
}

.statistics-card {
  text-align: center;
}

.statistics-item {
  padding: 10px;
}

.statistics-item .label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.statistics-item .value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.money-text {
  color: #E6A23C;
  font-weight: bold;
}

.fee-text {
  color: #F56C6C;
  font-weight: bold;
}

.actual-text {
  color: #67C23A;
  font-weight: bold;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}
</style>
