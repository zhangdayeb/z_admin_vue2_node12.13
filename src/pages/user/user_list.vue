<template>
  <div class="user-list">
    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户账号">
          <el-input v-model="searchForm.name" placeholder="请输入用户账号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="searchForm.nick_name" placeholder="请输入用户昵称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="正常" :value="1" />
            <el-option label="冻结" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="VIP等级">
          <el-select v-model="searchForm.vip_grade" placeholder="请选择VIP等级" clearable style="width: 120px">
            <el-option v-for="i in 10" :key="i-1" :label="`VIP${i-1}`" :value="i-1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">新增用户</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="用户账号" width="150" />
        <el-table-column prop="nick_name" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '冻结' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="state" label="在线状态" width="90">
          <template slot-scope="scope">
            <el-tag :type="scope.row.state === 1 ? 'success' : 'info'">
              {{ scope.row.state === 1 ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="vip_grade" label="VIP等级" width="80">
          <template slot-scope="scope">
            VIP{{ scope.row.vip_grade }}
          </template>
        </el-table-column>
        <el-table-column prop="money" label="可用余额" width="120">
          <template slot-scope="scope">
            <span style="color: #67C23A">{{ scope.row.money.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="money_rebate" label="返水余额" width="120">
          <template slot-scope="scope">
            <span style="color: #E6A23C">{{ scope.row.money_rebate.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="money_total_recharge" label="累计充值" width="120">
          <template slot-scope="scope">
            {{ scope.row.money_total_recharge.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="agent_id" label="代理ID" width="80" />
        <el-table-column prop="created_at" label="创建时间" width="150" />
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
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
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total">
        </el-pagination>
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogType === 'add' ? '新增用户' : '编辑用户'" :visible.sync="dialogVisible" width="700px">
      <el-form :model="formData" :rules="formRules" ref="userForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户账号" prop="name">
              <el-input v-model="formData.name" :disabled="dialogType === 'edit'" placeholder="请输入用户账号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="昵称" prop="nick_name">
              <el-input v-model="formData.nick_name" placeholder="请输入昵称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="VIP等级" prop="vip_grade">
              <el-select v-model="formData.vip_grade" placeholder="请选择VIP等级" style="width: 100%">
                <el-option v-for="i in 10" :key="i-1" :label="`VIP${i-1}`" :value="i-1" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="正常" :value="1" />
                <el-option label="冻结" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货币类型" prop="currency">
              <el-select v-model="formData.currency" placeholder="请选择货币类型" style="width: 100%">
                <el-option label="人民币(CNY)" value="CNY" />
                <el-option label="美元(USD)" value="USD" />
                <el-option label="泰铢(THB)" value="THB" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="可用余额" prop="money">
              <el-input-number v-model="formData.money" :precision="2" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="返水余额" prop="money_rebate">
              <el-input-number v-model="formData.money_rebate" :precision="2" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="代理ID" prop="agent_id">
              <el-input-number v-model="formData.agent_id" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="一级代理ID" prop="user_agent_id_1">
              <el-input-number v-model="formData.user_agent_id_1" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="二级代理ID" prop="user_agent_id_2">
              <el-input-number v-model="formData.user_agent_id_2" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="三级代理ID" prop="user_agent_id_3">
              <el-input-number v-model="formData.user_agent_id_3" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="formData.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { userListApi, userAddApi, userEditApi, userDelApi } from '@/api/adminApi'

export default {
  name: 'UserList',
  data() {
    return {
      loading: false,
      submitLoading: false,
      dialogVisible: false,
      dialogType: 'add', // add | edit

      // 搜索表单
      searchForm: {
        name: '',
        nick_name: '',
        phone: '',
        status: '',
        vip_grade: ''
      },

      // 分页
      pagination: {
        page: 1,
        limit: 20,
        total: 0
      },

      // 表格数据
      tableData: [],

      // 表单数据
      formData: {
        id: '',
        name: '',
        nick_name: '',
        phone: '',
        vip_grade: 0,
        status: 1,
        money: 0,
        money_rebate: 0,
        agent_id: 0,
        user_agent_id_1: null,
        user_agent_id_2: null,
        user_agent_id_3: null,
        currency: 'CNY',
        remarks: ''
      },

      // 表单验证规则
      formRules: {
        name: [
          { required: true, message: '请输入用户账号', trigger: 'blur' },
          { max: 200, message: '用户账号长度不能超过200字符', trigger: 'blur' }
        ],
        phone: [
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
        ],
        vip_grade: [
          { required: true, message: '请选择VIP等级', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ],
        currency: [
          { required: true, message: '请选择货币类型', trigger: 'change' }
        ]
      }
    }
  },

  created() {
    this.loadData()
  },

  methods: {
    // 加载数据
    async loadData() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          ...this.searchForm
        }

        const res = await userListApi(params)
        if (res.code === 200) {
          this.tableData = res.data.list
          this.pagination.total = res.data.total
        }
      } catch (error) {
        this.$message.error('加载数据失败')
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
        name: '',
        nick_name: '',
        phone: '',
        status: '',
        vip_grade: ''
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

    // 页码改变
    handleCurrentChange(val) {
      this.pagination.page = val
      this.loadData()
    },

    // 新增
    handleAdd() {
      this.dialogType = 'add'
      this.formData = {
        id: '',
        name: '',
        nick_name: '',
        phone: '',
        vip_grade: 0,
        status: 1,
        money: 0,
        money_rebate: 0,
        agent_id: 0,
        user_agent_id_1: null,
        user_agent_id_2: null,
        user_agent_id_3: null,
        currency: 'CNY',
        remarks: ''
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.userForm.clearValidate()
      })
    },

    // 编辑
    handleEdit(row) {
      this.dialogType = 'edit'
      this.formData = {
        id: row.id,
        name: row.name,
        nick_name: row.nick_name || '',
        phone: row.phone || '',
        vip_grade: row.vip_grade,
        status: row.status,
        money: row.money,
        money_rebate: row.money_rebate,
        agent_id: row.agent_id,
        user_agent_id_1: row.user_agent_id_1,
        user_agent_id_2: row.user_agent_id_2,
        user_agent_id_3: row.user_agent_id_3,
        currency: row.currency || 'CNY',
        remarks: row.remarks || ''
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.userForm.clearValidate()
      })
    },

    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除这个用户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await userDelApi({ id: row.id })
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.loadData()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        } catch (error) {
          this.$message.error('网络错误，请稍后重试')
        }
      })
    },

    // 提交表单
    handleSubmit() {
      this.$refs.userForm.validate(async (valid) => {
        if (!valid) return false

        this.submitLoading = true
        try {
          const api = this.dialogType === 'add' ? userAddApi : userEditApi
          const res = await api(this.formData)

          if (res.code === 200) {
            this.$message.success(this.dialogType === 'add' ? '新增成功' : '编辑成功')
            this.dialogVisible = false
            this.loadData()
          } else {
            this.$message.error(res.msg || (this.dialogType === 'add' ? '新增失败' : '编辑失败'))
          }
        } catch (error) {
          this.$message.error('网络错误，请稍后重试')
        } finally {
          this.submitLoading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.user-list {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}
</style>
