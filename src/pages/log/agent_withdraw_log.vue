<template>
  <div class="agent-withdraw-log">
    <!-- 查询条件 -->
    <div class="search-form">
      <el-form :model="searchForm" :inline="true" label-width="80px">
        <el-form-item label="代理ID">
          <el-input
            v-model="searchForm.agent_id"
            placeholder="请输入代理ID"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="代理账号">
          <el-input
            v-model="searchForm.agent_name"
            placeholder="请输入代理账号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 150px">
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请时间">
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
          <el-button type="primary" @click="getList">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计信息 -->
    <div class="statistics-card" v-if="statistics">
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="stat-item">
            <div class="stat-value">{{ statistics.total_count || 0 }}</div>
            <div class="stat-label">总记录数</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item">
            <div class="stat-value">{{ formatMoney(statistics.total_money) }}</div>
            <div class="stat-label">总提现金额</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item">
            <div class="stat-value">{{ formatMoney(statistics.total_fee) }}</div>
            <div class="stat-label">总手续费</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item">
            <div class="stat-value">{{ formatMoney(statistics.total_actual) }}</div>
            <div class="stat-label">总到账金额</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item">
            <div class="stat-value">{{ statistics.pending_count || 0 }}</div>
            <div class="stat-label">待审核</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item">
            <div class="stat-value">{{ statistics.success_count || 0 }}</div>
            <div class="stat-label">已通过</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 操作按钮 -->
    <div class="toolbar">
      <el-button type="primary" @click="showAddDialog">新增提现</el-button>
      <el-button
        type="danger"
        :disabled="!multipleSelection.length"
        @click="handleBatchDelete"
      >
        批量删除
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      @selection-change="handleSelectionChange"
      border
      stripe
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="agent_id" label="代理ID" width="80" />
      <el-table-column prop="agent_name" label="代理账号" width="120" />
      <el-table-column prop="invitation_code" label="邀请码" width="100" />
      <el-table-column prop="money" label="提现金额" width="120" align="right">
        <template slot-scope="scope">
          <span class="money-text">{{ formatMoney(scope.row.money) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="money_fee" label="手续费" width="100" align="right">
        <template slot-scope="scope">
          <span class="fee-text">{{ formatMoney(scope.row.money_fee) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="momey_actual" label="实际到账" width="120" align="right">
        <template slot-scope="scope">
          <span class="actual-text">{{ formatMoney(scope.row.momey_actual) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="money_balance" label="余额" width="120" align="right">
        <template slot-scope="scope">
          <span class="balance-text">{{ formatMoney(scope.row.money_balance) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="申请时间" width="160" />
      <el-table-column prop="success_time" label="审核时间" width="160" />
      <el-table-column prop="admin_name" label="审核人" width="100" />
      <el-table-column prop="msg" label="备注" min-width="150" show-overflow-tooltip />
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status === 0"
            type="success"
            size="mini"
            @click="handleApprove(scope.row)"
          >
            通过
          </el-button>
          <el-button
            v-if="scope.row.status === 0"
            type="warning"
            size="mini"
            @click="handleReject(scope.row)"
          >
            拒绝
          </el-button>
          <el-button
            v-if="scope.row.status === 0"
            type="danger"
            size="mini"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
          <el-button
            v-if="scope.row.status !== 0"
            type="info"
            size="mini"
            @click="handleView(scope.row)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
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

    <!-- 新增提现对话框 -->
    <el-dialog
      :visible.sync="addDialog.visible"
      title="新增代理提现"
      width="500px"
      :before-close="handleAddDialogClose"
    >
      <el-form
        ref="addForm"
        :model="addForm"
        :rules="addRules"
        label-width="100px"
      >
        <el-form-item label="代理ID" prop="agent_id">
          <el-input
            v-model="addForm.agent_id"
            placeholder="请输入代理ID"
            type="number"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="提现金额" prop="money">
          <el-input-number
            v-model="addForm.money"
            :precision="2"
            :min="0.01"
            style="width: 100%"
            @change="calculateActualAmount"
          />
        </el-form-item>
        <el-form-item label="手续费" prop="money_fee">
          <el-input-number
            v-model="addForm.money_fee"
            :precision="2"
            :min="0"
            style="width: 100%"
            @change="calculateActualAmount"
          />
        </el-form-item>
        <el-form-item label="实际到账">
          <span class="actual-display">{{ formatMoney(actualAmount) }}</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="addForm.msg"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleAddSubmit" :loading="addDialog.loading">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog
      :visible.sync="auditDialog.visible"
      :title="auditDialog.title"
      width="400px"
    >
      <el-form label-width="80px">
        <el-form-item label="审核备注">
          <el-input
            v-model="auditDialog.msg"
            type="textarea"
            :rows="3"
            placeholder="请输入审核备注"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="auditDialog.visible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleAuditSubmit"
          :loading="auditDialog.loading"
        >
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      :visible.sync="viewDialog.visible"
      title="提现详情"
      width="600px"
    >
      <el-descriptions :column="2" border v-if="viewDialog.data">
        <el-descriptions-item label="提现ID">{{ viewDialog.data.id }}</el-descriptions-item>
        <el-descriptions-item label="代理ID">{{ viewDialog.data.agent_id }}</el-descriptions-item>
        <el-descriptions-item label="代理账号">{{ viewDialog.data.agent_name }}</el-descriptions-item>
        <el-descriptions-item label="邀请码">{{ viewDialog.data.invitation_code }}</el-descriptions-item>
        <el-descriptions-item label="提现金额">
          <span class="money-text">{{ formatMoney(viewDialog.data.money) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="手续费">
          <span class="fee-text">{{ formatMoney(viewDialog.data.money_fee) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="实际到账">
          <span class="actual-text">{{ formatMoney(viewDialog.data.momey_actual) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="提现后余额">
          <span class="balance-text">{{ formatMoney(viewDialog.data.money_balance) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(viewDialog.data.status)">
            {{ getStatusText(viewDialog.data.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ viewDialog.data.create_time }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ viewDialog.data.success_time || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核人">{{ viewDialog.data.admin_name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ viewDialog.data.msg || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
import {
  agentWithdrawLogListApi,
  agentWithdrawLogAddApi,
  agentWithdrawLogEditApi,
  agentWithdrawLogDelApi
} from '@/api/adminApi'

export default {
  name: 'AgentWithdrawLog',
  data() {
    return {
      loading: false,
      tableData: [],
      multipleSelection: [],
      statistics: {},

      // 搜索表单
      searchForm: {
        agent_id: '',
        agent_name: '',
        status: '',
        dateRange: []
      },

      // 分页
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },

      // 新增对话框
      addDialog: {
        visible: false,
        loading: false
      },

      addForm: {
        agent_id: '',
        money: 0,
        money_fee: 0,
        msg: ''
      },

      addRules: {
        agent_id: [{ required: true, message: '请输入代理ID', trigger: 'blur' }],
        money: [{ required: true, message: '请输入提现金额', trigger: 'blur' }]
      },

      // 审核对话框
      auditDialog: {
        visible: false,
        loading: false,
        title: '',
        type: '', // 'approve' 或 'reject'
        id: '',
        msg: ''
      },

      // 查看对话框
      viewDialog: {
        visible: false,
        data: null
      }
    }
  },

  computed: {
    actualAmount() {
      return Math.max(0, this.addForm.money - this.addForm.money_fee)
    }
  },

  mounted() {
    this.getList()
  },

  methods: {
    async getList() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          agent_id: this.searchForm.agent_id,
          agent_name: this.searchForm.agent_name,
          status: this.searchForm.status
        }

        if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
          params.start_time = this.searchForm.dateRange[0] + ' 00:00:00'
          params.end_time = this.searchForm.dateRange[1] + ' 23:59:59'
        }

        const res = await agentWithdrawLogListApi(params)
        if (res.code === 200) {
          this.tableData = res.data.list || []
          this.pagination.total = res.data.total || 0
          this.statistics = res.data.statistics || {}
        } else {
          this.$message.error(res.message || '获取数据失败')
        }
      } catch (error) {
        console.error('获取列表失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    resetSearch() {
      this.searchForm = {
        agent_id: '',
        agent_name: '',
        status: '',
        dateRange: []
      }
      this.pagination.page = 1
      this.getList()
    },

    handleSelectionChange(selection) {
      this.multipleSelection = selection
    },

    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.page = 1
      this.getList()
    },

    handleCurrentChange(page) {
      this.pagination.page = page
      this.getList()
    },

    showAddDialog() {
      this.addDialog.visible = true
    },

    handleAddDialogClose() {
      this.$refs.addForm.resetFields()
      this.addForm = {
        agent_id: '',
        money: 0,
        money_fee: 0,
        msg: ''
      }
    },

    calculateActualAmount() {
      // 计算逻辑已在computed中处理
    },

    async handleAddSubmit() {
      try {
        await this.$refs.addForm.validate()

        if (this.actualAmount <= 0) {
          this.$message.error('扣除手续费后金额必须大于0')
          return
        }

        this.addDialog.loading = true
        const res = await agentWithdrawLogAddApi(this.addForm)

        if (res.code === 200) {
          this.$message.success('提现申请提交成功')
          this.addDialog.visible = false
          this.getList()
        } else {
          this.$message.error(res.message || '提交失败')
        }
      } catch (error) {
        console.error('提交失败:', error)
        this.$message.error('提交失败')
      } finally {
        this.addDialog.loading = false
      }
    },

    handleApprove(row) {
      this.auditDialog.title = '审核通过'
      this.auditDialog.type = 'approve'
      this.auditDialog.id = row.id
      this.auditDialog.msg = ''
      this.auditDialog.visible = true
    },

    handleReject(row) {
      this.auditDialog.title = '审核拒绝'
      this.auditDialog.type = 'reject'
      this.auditDialog.id = row.id
      this.auditDialog.msg = ''
      this.auditDialog.visible = true
    },

    async handleAuditSubmit() {
      try {
        this.auditDialog.loading = true
        const params = {
          id: this.auditDialog.id,
          status: this.auditDialog.type === 'approve' ? 1 : 2,
          msg: this.auditDialog.msg
        }

        const res = await agentWithdrawLogEditApi(params)

        if (res.code === 200) {
          this.$message.success('审核成功')
          this.auditDialog.visible = false
          this.getList()
        } else {
          this.$message.error(res.message || '审核失败')
        }
      } catch (error) {
        console.error('审核失败:', error)
        this.$message.error('审核失败')
      } finally {
        this.auditDialog.loading = false
      }
    },

    async handleDelete(row) {
      try {
        await this.$confirm('确定要删除这条提现记录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const res = await agentWithdrawLogDelApi({ ids: [row.id] })

        if (res.code === 200) {
          this.$message.success('删除成功')
          this.getList()
        } else {
          this.$message.error(res.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }
    },

    async handleBatchDelete() {
      try {
        await this.$confirm(
          `确定要删除选中的 ${this.multipleSelection.length} 条记录吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const ids = this.multipleSelection.map(item => item.id)
        const res = await agentWithdrawLogDelApi({ ids })

        if (res.code === 200) {
          this.$message.success('批量删除成功')
          this.getList()
        } else {
          this.$message.error(res.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除失败:', error)
          this.$message.error('批量删除失败')
        }
      }
    },

    handleView(row) {
      this.viewDialog.data = row
      this.viewDialog.visible = true
    },

    // 工具方法
    formatMoney(amount) {
      if (amount === null || amount === undefined) return '0.00'
      return parseFloat(amount).toFixed(2)
    },

    getStatusText(status) {
      const statusMap = {
        0: '待审核',
        1: '已通过',
        2: '已拒绝'
      }
      return statusMap[status] || '未知'
    },

    getStatusType(status) {
      const typeMap = {
        0: 'warning',
        1: 'success',
        2: 'danger'
      }
      return typeMap[status] || 'info'
    }
  }
}
</script>

<style scoped>
.agent-withdraw-log {
  padding: 20px;
}

.search-form {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.statistics-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-item {
  text-align: center;
  padding: 10px;
  border-radius: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.toolbar {
  background: #fff;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.money-text {
  color: #e6a23c;
  font-weight: bold;
}

.fee-text {
  color: #f56c6c;
  font-weight: bold;
}

.actual-text {
  color: #67c23a;
  font-weight: bold;
}

.balance-text {
  color: #409eff;
  font-weight: bold;
}

.actual-display {
  font-size: 16px;
  font-weight: bold;
  color: #409eff;
}
</style>
