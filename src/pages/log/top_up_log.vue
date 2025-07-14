<template>
  <div class="top-up-log">
    <!-- 搜索表单 -->
    <div class="search-form">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="用户ID">
          <el-input
            v-model="searchForm.user_id"
            placeholder="请输入用户ID"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.user_name"
            placeholder="请输入用户名"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="待审核" value="0"></el-option>
            <el-option label="已通过" value="1"></el-option>
            <el-option label="已拒绝" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="showAddDialog">新增充值</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <el-table
      :data="tableData"
      border
      stripe
      v-loading="tableLoading"
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column label="用户信息" width="200">
        <template slot-scope="scope">
          <div>
            <div>ID: {{ scope.row.user_id }}</div>
            <div>用户名: {{ scope.row.user_name || '-' }}</div>
            <div>昵称: {{ scope.row.nick_name || '-' }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="money" label="充值金额" width="120">
        <template slot-scope="scope">
          <span style="color: #67C23A; font-weight: bold;">
            ¥{{ Number(scope.row.money).toFixed(2) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="收款信息" width="200">
        <template slot-scope="scope">
          <div v-if="scope.row.pay_account_name">
            <div>账户: {{ scope.row.pay_account_name }}</div>
            <div v-if="scope.row.pay_method_name">方式: {{ scope.row.pay_method_name }}</div>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="打款信息" width="200">
        <template slot-scope="scope">
          <div v-if="scope.row.u_bank_user_name">
            <div>姓名: {{ scope.row.u_bank_user_name }}</div>
            <div v-if="scope.row.u_bank_name">银行: {{ scope.row.u_bank_name }}</div>
            <div v-if="scope.row.u_bank_card">卡号: {{ scope.row.u_bank_card }}</div>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.status == 1 ? 'success' : scope.row.status == 2 ? 'danger' : 'warning'"
          >
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="申请时间" width="180"></el-table-column>
      <el-table-column prop="success_time" label="审核时间" width="180">
        <template slot-scope="scope">
          {{ scope.row.success_time || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="admin_name" label="审核人" width="120">
        <template slot-scope="scope">
          {{ scope.row.admin_name || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" width="150">
        <template slot-scope="scope">
          {{ scope.row.remark || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <!-- 待审核状态可以审核和删除 -->
          <template v-if="scope.row.status == 0">
            <el-button size="mini" type="success" @click="approveRecord(scope.row)">
              通过
            </el-button>
            <el-button size="mini" type="danger" @click="rejectRecord(scope.row)">
              拒绝
            </el-button>
            <el-button size="mini" type="danger" @click="deleteRecord(scope.row.id)">
              删除
            </el-button>
          </template>
          <!-- 已审核状态只能查看 -->
          <template v-else>
            <el-button size="mini" type="info" @click="viewRecord(scope.row)">
              查看
            </el-button>
          </template>
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
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
      ></el-pagination>
    </div>

    <!-- 新增对话框 -->
    <el-dialog title="新增充值记录" :visible.sync="addDialogVisible" width="600px">
      <el-form :model="addForm" :rules="addRules" ref="addForm" label-width="120px">
        <el-form-item label="用户ID" prop="user_id">
          <el-input
            v-model="addForm.user_id"
            placeholder="请输入用户ID"
            @blur="getUserInfo"
          ></el-input>
        </el-form-item>
        <el-form-item label="用户信息" v-if="userInfo.name">
          <div>
            <p>用户名: {{ userInfo.name }}</p>
            <p>昵称: {{ userInfo.nick_name || '-' }}</p>
            <p>当前余额: ¥{{ Number(userInfo.money).toFixed(2) }}</p>
          </div>
        </el-form-item>
        <el-form-item label="充值金额" prop="money">
          <el-input-number
            v-model="addForm.money"
            :min="0.01"
            :precision="2"
            placeholder="请输入充值金额"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="收款账号" prop="pay_account_id">
          <el-select v-model="addForm.pay_account_id" placeholder="请选择收款账号" style="width: 100%">
            <el-option
              v-for="account in payAccounts"
              :key="account.id"
              :label="`${account.account_name} (${account.method_name})`"
              :value="account.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="打款银行">
          <el-input v-model="addForm.u_bank_name" placeholder="请输入打款银行名称"></el-input>
        </el-form-item>
        <el-form-item label="打款人姓名">
          <el-input v-model="addForm.u_bank_user_name" placeholder="请输入打款人姓名"></el-input>
        </el-form-item>
        <el-form-item label="打款卡号">
          <el-input v-model="addForm.u_bank_card" placeholder="请输入打款银行卡号"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="addForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAdd" :loading="submitLoading">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog :title="auditForm.type === 'approve' ? '审核通过' : '审核拒绝'" :visible.sync="auditDialogVisible" width="500px">
      <el-form :model="auditForm" ref="auditForm" label-width="100px">
        <el-form-item label="用户信息">
          <div>
            <p>用户ID: {{ auditForm.user_id }}</p>
            <p>充值金额: ¥{{ Number(auditForm.money).toFixed(2) }}</p>
          </div>
        </el-form-item>
        <el-form-item label="审核备注" :prop="auditForm.type === 'reject' ? 'remark' : ''">
          <el-input
            v-model="auditForm.remark"
            type="textarea"
            :rows="3"
            :placeholder="auditForm.type === 'approve' ? '请输入审核备注（可选）' : '请输入拒绝原因'"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="auditDialogVisible = false">取 消</el-button>
        <el-button
          :type="auditForm.type === 'approve' ? 'success' : 'danger'"
          @click="submitAudit"
          :loading="submitLoading"
        >
          {{ auditForm.type === 'approve' ? '确认通过' : '确认拒绝' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { topUpLogListApi, topUpLogAddApi, topUpLogEditApi, topUpLogDelApi } from '@/api/adminApi'

export default {
  name: 'TopUpLog',
  data() {
    return {
      // 搜索表单
      searchForm: {
        user_id: '',
        user_name: '',
        status: '',
        dateRange: []
      },

      // 表格数据
      tableData: [],
      tableLoading: false,

      // 分页
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0
      },

      // 新增对话框
      addDialogVisible: false,
      addForm: {
        user_id: '',
        money: '',
        pay_account_id: '',
        u_bank_name: '',
        u_bank_user_name: '',
        u_bank_card: '',
        remark: ''
      },
      addRules: {
        user_id: [
          { required: true, message: '请输入用户ID', trigger: 'blur' }
        ],
        money: [
          { required: true, message: '请输入充值金额', trigger: 'blur' }
        ],
        pay_account_id: [
          { required: true, message: '请选择收款账号', trigger: 'change' }
        ]
      },

      // 审核对话框
      auditDialogVisible: false,
      auditForm: {
        id: '',
        type: '', // approve | reject
        user_id: '',
        money: '',
        remark: ''
      },

      // 其他数据
      submitLoading: false,
      userInfo: {}, // 用户信息
      payAccounts: [] // 收款账号列表
    }
  },

  mounted() {
    this.getList()
    this.getPayAccounts()
  },

  methods: {
    // 获取列表数据
    async getList() {
      this.tableLoading = true
      try {
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          ...this.searchForm
        }

        // 处理时间范围
        if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
          params.start_time = this.searchForm.dateRange[0]
          params.end_time = this.searchForm.dateRange[1]
        }
        delete params.dateRange

        const res = await topUpLogListApi(params)
        if (res.code === 200) {
          this.tableData = res.data.list || []
          this.pagination.total = res.data.total || 0
        } else {
          this.$message.error(res.message || '获取数据失败')
        }
      } catch (error) {
        this.$message.error('获取数据失败')
        console.error(error)
      } finally {
        this.tableLoading = false
      }
    },

    // 获取收款账号列表
    async getPayAccounts() {
      try {
        // 这里需要调用获取收款账号的API
        // const res = await getPayAccountsApi()
        // this.payAccounts = res.data || []

        // 模拟数据
        this.payAccounts = [
          { id: 1, account_name: '公司账户1', method_name: '银行转账' },
          { id: 2, account_name: '支付宝账户', method_name: '支付宝' },
          { id: 3, account_name: 'USDT钱包', method_name: 'USDT' }
        ]
      } catch (error) {
        console.error('获取收款账号失败', error)
      }
    },

    // 获取用户信息
    async getUserInfo() {
      if (!this.addForm.user_id) {
        this.userInfo = {}
        return
      }

      try {
        // 这里需要调用获取用户信息的API
        // const res = await getUserInfoApi({ id: this.addForm.user_id })
        // this.userInfo = res.data || {}

        // 模拟数据
        this.userInfo = {
          id: this.addForm.user_id,
          name: 'user' + this.addForm.user_id,
          nick_name: '用户昵称',
          money: 1000.00
        }
      } catch (error) {
        this.$message.error('获取用户信息失败')
        this.userInfo = {}
      }
    },

    // 显示新增对话框
    showAddDialog() {
      this.addDialogVisible = true
      this.resetAddForm()
    },

    // 重置新增表单
    resetAddForm() {
      this.addForm = {
        user_id: '',
        money: '',
        pay_account_id: '',
        u_bank_name: '',
        u_bank_user_name: '',
        u_bank_card: '',
        remark: ''
      }
      this.userInfo = {}
      if (this.$refs.addForm) {
        this.$refs.addForm.clearValidate()
      }
    },

    // 提交新增
    async submitAdd() {
      this.$refs.addForm.validate(async (valid) => {
        if (!valid) return

        this.submitLoading = true
        try {
          const res = await topUpLogAddApi(this.addForm)
          if (res.code === 200) {
            this.$message.success('新增成功')
            this.addDialogVisible = false
            this.getList()
          } else {
            this.$message.error(res.message || '新增失败')
          }
        } catch (error) {
          this.$message.error('新增失败')
          console.error(error)
        } finally {
          this.submitLoading = false
        }
      })
    },

    // 审核通过
    approveRecord(row) {
      this.auditForm = {
        id: row.id,
        type: 'approve',
        user_id: row.user_id,
        money: row.money,
        remark: ''
      }
      this.auditDialogVisible = true
    },

    // 审核拒绝
    rejectRecord(row) {
      this.auditForm = {
        id: row.id,
        type: 'reject',
        user_id: row.user_id,
        money: row.money,
        remark: ''
      }
      this.auditDialogVisible = true
    },

    // 提交审核
    async submitAudit() {
      if (this.auditForm.type === 'reject' && !this.auditForm.remark.trim()) {
        this.$message.warning('请输入拒绝原因')
        return
      }

      this.submitLoading = true
      try {
        const params = {
          id: this.auditForm.id,
          status: this.auditForm.type === 'approve' ? 1 : 2,
          remark: this.auditForm.remark
        }

        const res = await topUpLogEditApi(params)
        if (res.code === 200) {
          this.$message.success('审核成功')
          this.auditDialogVisible = false
          this.getList()
        } else {
          this.$message.error(res.message || '审核失败')
        }
      } catch (error) {
        this.$message.error('审核失败')
        console.error(error)
      } finally {
        this.submitLoading = false
      }
    },

    // 删除记录
    deleteRecord(id) {
      this.$confirm('确定要删除这条充值记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await topUpLogDelApi({ id })
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.getList()
          } else {
            this.$message.error(res.message || '删除失败')
          }
        } catch (error) {
          this.$message.error('删除失败')
          console.error(error)
        }
      }).catch(() => {
        // 取消删除
      })
    },

    // 查看记录详情
    viewRecord(row) {
      this.$alert(`
        <div>
          <p><strong>充值信息：</strong></p>
          <p>充值金额：¥${Number(row.money).toFixed(2)}</p>
          <p>申请时间：${row.create_time}</p>
          <p>审核时间：${row.success_time || '-'}</p>
          <p>审核人：${row.admin_name || '-'}</p>
          <p>状态：${this.getStatusText(row.status)}</p>
          <p>备注：${row.remark || '-'}</p>
        </div>
      `, '充值记录详情', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定'
      })
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        0: '待审核',
        1: '已通过',
        2: '已拒绝'
      }
      return statusMap[status] || '未知'
    },

    // 重置搜索
    resetSearch() {
      this.searchForm = {
        user_id: '',
        user_name: '',
        status: '',
        dateRange: []
      }
      this.pagination.page = 1
      this.getList()
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.page = 1
      this.getList()
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.pagination.page = val
      this.getList()
    }
  }
}
</script>

<style scoped>
.top-up-log {
  padding: 20px;
}

.search-form {
  background: #fff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}

.el-table {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
