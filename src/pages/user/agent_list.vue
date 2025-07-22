<template>
  <div class="agent-list">
    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="代理账号">
          <el-input v-model="searchForm.agent_name" placeholder="请输入代理账号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="邀请码">
          <el-input v-model="searchForm.invitation_code" placeholder="请输入邀请码" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="正常" :value="1" />
            <el-option label="冻结" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="代理类型">
          <el-select v-model="searchForm.agent_type" placeholder="请选择代理类型" clearable style="width: 150px">
            <el-option label="3级代理" :value="1" />
            <el-option label="无限级代理" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="Telegram用户名">
          <el-input v-model="searchForm.tg_username" placeholder="请输入TG用户名" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">新增代理</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="agent_name" label="代理账号" width="150" />
        <el-table-column prop="agent_type" label="代理类型" width="120">
          <template slot-scope="scope">
            <el-tag :type="scope.row.agent_type === 1 ? 'primary' : 'success'">
              {{ scope.row.agent_type === 1 ? '3级代理' : '无限级代理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '冻结' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="money" label="可用余额" width="120">
          <template slot-scope="scope">
            <span style="color: #67C23A">{{ scope.row.money.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="money_total" label="累计佣金" width="120">
          <template slot-scope="scope">
            <span style="color: #E6A23C">{{ scope.row.money_total.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fanyong_proportion" label="返佣比例" width="100">
          <template slot-scope="scope">
            <span style="color: #409EFF">{{ scope.row.fanyong_proportion.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="agent_id_1" label="一级代理" width="90" />
        <el-table-column prop="agent_id_2" label="二级代理" width="90" />
        <el-table-column prop="agent_id_3" label="三级代理" width="90" />
        <el-table-column prop="invitation_code" label="邀请码" width="100" />
        <el-table-column prop="tg_username" label="TG用户名" width="120">
          <template slot-scope="scope">
            <span v-if="scope.row.tg_username">{{ scope.row.tg_username }}</span>
            <span v-else style="color: #C0C4CC">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="tg_first_name" label="TG姓名" width="120">
          <template slot-scope="scope">
            <span v-if="scope.row.tg_first_name || scope.row.tg_last_name">
              {{ (scope.row.tg_first_name || '') + ' ' + (scope.row.tg_last_name || '') }}
            </span>
            <span v-else style="color: #C0C4CC">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="150" />
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
    <el-dialog :title="dialogType === 'add' ? '新增代理' : '编辑代理'" :visible.sync="dialogVisible" width="800px">
      <el-form :model="formData" :rules="formRules" ref="agentForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="代理账号" prop="agent_name">
              <el-input v-model="formData.agent_name" :disabled="dialogType === 'edit'" placeholder="请输入代理账号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="代理类型" prop="agent_type">
              <el-select v-model="formData.agent_type" placeholder="请选择代理类型" style="width: 100%">
                <el-option label="3级代理" :value="1" />
                <el-option label="无限级代理" :value="2" />
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
            <el-form-item label="邀请码" prop="invitation_code">
              <el-input v-model="formData.invitation_code" placeholder="留空自动生成" />
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
            <el-form-item label="累计佣金" prop="money_total">
              <el-input-number v-model="formData.money_total" :precision="2" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="返佣比例" prop="fanyong_proportion">
              <el-input-number v-model="formData.fanyong_proportion" :precision="2" :min="0" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="一级代理ID" prop="agent_id_1">
              <el-input-number v-model="formData.agent_id_1" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="二级代理ID" prop="agent_id_2">
              <el-input-number v-model="formData.agent_id_2" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="三级代理ID" prop="agent_id_3">
              <el-input-number v-model="formData.agent_id_3" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Telegram 信息 -->
        <el-divider content-position="left">Telegram 信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Telegram ID" prop="tg_id">
              <el-input v-model="formData.tg_id" placeholder="请输入Telegram ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Telegram用户名" prop="tg_username">
              <el-input v-model="formData.tg_username" placeholder="请输入Telegram用户名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名字" prop="tg_first_name">
              <el-input v-model="formData.tg_first_name" placeholder="请输入名字" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓氏" prop="tg_last_name">
              <el-input v-model="formData.tg_last_name" placeholder="请输入姓氏" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="所属群组" prop="tg_crowd_ids">
              <el-input v-model="formData.tg_crowd_ids" placeholder="请输入Telegram群组ID，多个用逗号分隔" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { agentListApi, agentAddApi, agentEditApi, agentDelApi } from '@/api/adminApi'

export default {
  name: 'AgentList',
  data() {
    return {
      loading: false,
      submitLoading: false,
      dialogVisible: false,
      dialogType: 'add', // add | edit

      // 搜索表单
      searchForm: {
        agent_name: '',
        invitation_code: '',
        status: '',
        agent_type: '',
        tg_username: ''
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
        agent_name: '',
        agent_type: 1,
        status: 1,
        money: 0,
        money_total: 0,
        fanyong_proportion: 0,
        agent_id_1: 0,
        agent_id_2: null,
        agent_id_3: null,
        invitation_code: '',
        tg_id: '',
        tg_username: '',
        tg_first_name: '',
        tg_last_name: '',
        tg_crowd_ids: ''
      },

      // 表单验证规则
      formRules: {
        agent_name: [
          { required: true, message: '请输入代理账号', trigger: 'blur' },
          { max: 200, message: '代理账号长度不能超过200字符', trigger: 'blur' }
        ],
        agent_type: [
          { required: true, message: '请选择代理类型', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ],
        fanyong_proportion: [
          { type: 'number', min: 0, max: 100, message: '返佣比例必须在0-100之间', trigger: 'blur' }
        ],
        tg_id: [
          { max: 200, message: 'Telegram ID长度不能超过200字符', trigger: 'blur' }
        ],
        tg_username: [
          { max: 200, message: 'Telegram用户名长度不能超过200字符', trigger: 'blur' }
        ],
        tg_first_name: [
          { max: 200, message: '名字长度不能超过200字符', trigger: 'blur' }
        ],
        tg_last_name: [
          { max: 200, message: '姓氏长度不能超过200字符', trigger: 'blur' }
        ],
        tg_crowd_ids: [
          { max: 200, message: '群组ID长度不能超过200字符', trigger: 'blur' }
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

        const res = await agentListApi(params)
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
        agent_name: '',
        invitation_code: '',
        status: '',
        agent_type: '',
        tg_username: ''
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
        agent_name: '',
        agent_type: 1,
        status: 1,
        money: 0,
        money_total: 0,
        fanyong_proportion: 0,
        agent_id_1: 0,
        agent_id_2: null,
        agent_id_3: null,
        invitation_code: '',
        tg_id: '',
        tg_username: '',
        tg_first_name: '',
        tg_last_name: '',
        tg_crowd_ids: ''
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.agentForm.clearValidate()
      })
    },

    // 编辑
    handleEdit(row) {
      this.dialogType = 'edit'
      this.formData = {
        id: row.id,
        agent_name: row.agent_name,
        agent_type: row.agent_type,
        status: row.status,
        money: row.money,
        money_total: row.money_total,
        fanyong_proportion: row.fanyong_proportion,
        agent_id_1: row.agent_id_1,
        agent_id_2: row.agent_id_2,
        agent_id_3: row.agent_id_3,
        invitation_code: row.invitation_code || '',
        tg_id: row.tg_id || '',
        tg_username: row.tg_username || '',
        tg_first_name: row.tg_first_name || '',
        tg_last_name: row.tg_last_name || '',
        tg_crowd_ids: row.tg_crowd_ids || ''
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.agentForm.clearValidate()
      })
    },

    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除这个代理吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await agentDelApi({ id: row.id })
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
      this.$refs.agentForm.validate(async (valid) => {
        if (!valid) return false

        this.submitLoading = true
        try {
          const api = this.dialogType === 'add' ? agentAddApi : agentEditApi
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
.agent-list {
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
