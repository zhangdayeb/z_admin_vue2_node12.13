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
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 350px;"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
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
            <el-icon><Plus /></el-icon>
            新增记录
          </el-button>
          <el-button
            type="danger"
            :disabled="selectedRows.length === 0"
            @click="handleBatchDelete"
          >
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </div>
        <div class="right">
          <el-button @click="loadData">
            <el-icon><Refresh /></el-icon>
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
          <template #default="{ row }">
            <div>
              <div>ID: {{ row.u_id }}</div>
              <div>用户名: {{ row.user_name || '-' }}</div>
              <div v-if="row.nick_name">昵称: {{ row.nick_name }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="提现金额" width="120">
          <template #default="{ row }">
            <span class="money-text">{{ formatMoney(row.money) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="手续费" width="100">
          <template #default="{ row }">
            <span class="fee-text">{{ formatMoney(row.money_fee) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="实际到账" width="120">
          <template #default="{ row }">
            <span class="actual-text">{{ formatMoney(row.momey_actual) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="pay_type" label="支付方式" width="100" />
        <el-table-column label="收款信息" width="200">
          <template #default="{ row }">
            <div v-if="row.u_bank_name || row.u_back_card">
              <div>银行: {{ row.u_bank_name || '-' }}</div>
              <div>卡号: {{ row.u_back_card || '-' }}</div>
              <div>姓名: {{ row.u_back_user_name || '-' }}</div>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
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
          <template #default="{ row }">
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
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
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
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 审核弹窗 -->
    <el-dialog
      :title="auditTitle"
      v-model="auditDialogVisible"
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
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="auditDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAuditSubmit" :loading="auditLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Delete } from '@element-plus/icons-vue'
import {
  userWithdrawLogListApi,
  userWithdrawLogAddApi,
  userWithdrawLogEditApi,
  userWithdrawLogDelApi
} from '@/api/adminApi'

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const selectedRows = ref([])
const statistics = ref({})

// 搜索表单
const searchForm = reactive({
  user_id: '',
  user_name: '',
  status: '',
  pay_type: '',
  admin_uid: ''
})

const dateRange = ref([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)

// 审核弹窗
const auditDialogVisible = ref(false)
const auditLoading = ref(false)
const auditForm = reactive({
  id: '',
  status: 1,
  msg: ''
})

// 表单数据
const formData = reactive({
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
})

// 表单验证规则
const formRules = {
  u_id: [
    { required: true, message: '请输入用户ID', trigger: 'blur' }
  ],
  money: [
    { required: true, message: '请输入提现金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '提现金额必须大于0', trigger: 'blur' }
  ]
}

// 计算属性
const dialogTitle = computed(() => {
  return isEdit.value ? '编辑提现记录' : '新增提现记录'
})

const auditTitle = computed(() => {
  return auditForm.status == 1 ? '审核通过确认' : '审核拒绝确认'
})

// 监听时间范围变化
watch(dateRange, (newVal) => {
  if (newVal && newVal.length === 2) {
    searchForm.start_time = newVal[0]
    searchForm.end_time = newVal[1]
  } else {
    searchForm.start_time = ''
    searchForm.end_time = ''
  }
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }

    const response = await userWithdrawLogListApi(params)
    if (response.code === 200) {
      tableData.value = response.data.list || []
      pagination.total = response.data.total || 0
      statistics.value = response.data.statistics || {}
    } else {
      ElMessage.error(response.message || '获取数据失败')
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
    console.error('Load data error:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  dateRange.value = []
  pagination.page = 1
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.keys(formData).forEach(key => {
    formData[key] = row[key] || ''
  })
  dialogVisible.value = true
}

const handleApprove = (row) => {
  auditForm.id = row.id
  auditForm.status = 1
  auditForm.msg = ''
  auditDialogVisible.value = true
}

const handleReject = (row) => {
  auditForm.id = row.id
  auditForm.status = 2
  auditForm.msg = ''
  auditDialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    const api = isEdit.value ? userWithdrawLogEditApi : userWithdrawLogAddApi
    const response = await api(formData)

    if (response.code === 200) {
      ElMessage.success(response.message || '操作成功')
      dialogVisible.value = false
      loadData()
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('Submit error:', error)
  } finally {
    submitLoading.value = false
  }
}

const handleAuditSubmit = async () => {
  if (auditForm.status == 2 && !auditForm.msg.trim()) {
    ElMessage.warning('拒绝审核时必须填写备注')
    return
  }

  auditLoading.value = true
  try {
    const response = await userWithdrawLogEditApi(auditForm)
    if (response.code === 200) {
      ElMessage.success(response.message || '审核成功')
      auditDialogVisible.value = false
      loadData()
    } else {
      ElMessage.error(response.message || '审核失败')
    }
  } catch (error) {
    ElMessage.error('审核失败')
    console.error('Audit error:', error)
  } finally {
    auditLoading.value = false
  }
}

const handleDelete = async (ids) => {
  try {
    await ElMessageBox.confirm(
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
      ElMessage.success(response.message || '删除成功')
      loadData()
      selectedRows.value = []
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('Delete error:', error)
    }
  }
}

const handleBatchDelete = () => {
  const ids = selectedRows.value.map(row => row.id)
  handleDelete(ids)
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const resetForm = () => {
  Object.keys(formData).forEach(key => {
    if (typeof formData[key] === 'number') {
      formData[key] = 0
    } else {
      formData[key] = ''
    }
  })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const formatMoney = (amount) => {
  if (!amount && amount !== 0) return '0.00'
  return Number(amount).toFixed(2)
}

const getStatusType = (status) => {
  const statusMap = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    0: '待审核',
    1: '已通过',
    2: '已拒绝'
  }
  return statusMap[status] || '未知'
}

// 生命周期
onMounted(() => {
  loadData()
})
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
