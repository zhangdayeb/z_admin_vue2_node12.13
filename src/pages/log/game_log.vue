<template>
  <div class="game-log-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="用户ID">
          <el-input
            v-model="searchForm.member_id"
            placeholder="请输入用户ID"
            clearable>
          </el-input>
        </el-form-item>

        <el-form-item label="开始时间">
          <el-date-picker
            v-model="searchForm.start_time"
            type="datetime"
            placeholder="选择开始时间"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="结束时间">
          <el-date-picker
            v-model="searchForm.end_time"
            type="datetime"
            placeholder="选择结束时间"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="最小金额">
          <el-input
            v-model="searchForm.min_money"
            placeholder="最小金额"
            type="number"
            clearable>
          </el-input>
        </el-form-item>

        <el-form-item label="最大金额">
          <el-input
            v-model="searchForm.max_money"
            placeholder="最大金额"
            type="number"
            clearable>
          </el-input>
        </el-form-item>

        <el-form-item label="操作类型">
          <el-input
            v-model="searchForm.operate_type"
            placeholder="操作类型"
            type="number"
            clearable>
          </el-input>
        </el-form-item>

        <el-form-item label="金额类型">
          <el-select v-model="searchForm.money_type" placeholder="金额类型" clearable>
            <el-option label="money" value="money"></el-option>
            <el-option label="bonus" value="bonus"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="getList">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="showAddDialog">新增</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计信息 -->
    <div class="statistics-info" v-if="statistics">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card>
            <div slot="header">总记录数</div>
            <div class="stat-number">{{ statistics.total_count || 0 }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <div slot="header">总金额</div>
            <div class="stat-number">{{ statistics.total_money || 0 }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <div slot="header">收入总额</div>
            <div class="stat-number text-success">{{ statistics.total_income || 0 }}</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <div slot="header">支出总额</div>
            <div class="stat-number text-danger">{{ statistics.total_expense || 0 }}</div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格 -->
    <el-table
      :data="tableData"
      border
      stripe
      v-loading="loading"
      style="width: 100%">

      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="member_id" label="用户ID" width="100"></el-table-column>
      <el-table-column prop="user_name" label="用户名" width="120"></el-table-column>
      <el-table-column prop="money" label="操作金额" width="120">
        <template slot-scope="scope">
          <span :class="scope.row.number_type === 1 ? 'text-success' : 'text-danger'">
            {{ scope.row.number_type === 1 ? '+' : '-' }}{{ scope.row.money }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="money_before" label="操作前金额" width="120"></el-table-column>
      <el-table-column prop="money_after" label="操作后金额" width="120"></el-table-column>
      <el-table-column prop="money_type" label="金额类型" width="100"></el-table-column>
      <el-table-column prop="operate_type" label="操作类型" width="100"></el-table-column>
      <el-table-column prop="description" label="描述" width="150" show-overflow-tooltip></el-table-column>
      <el-table-column prop="remark" label="备注" width="150" show-overflow-tooltip></el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="160"></el-table-column>

      <el-table-column label="操作" fixed="right" width="150">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="showEditDialog(scope.row)">编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="deleteRecord(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      :before-close="handleDialogClose">

      <el-form
        :model="formData"
        :rules="formRules"
        ref="dataForm"
        label-width="120px">

        <el-form-item label="用户ID" prop="member_id" v-if="!isEdit">
          <el-input v-model="formData.member_id" placeholder="请输入用户ID"></el-input>
        </el-form-item>

        <el-form-item label="操作金额" prop="money">
          <el-input v-model="formData.money" type="number" placeholder="请输入操作金额"></el-input>
        </el-form-item>

        <el-form-item label="操作前金额" prop="money_before">
          <el-input v-model="formData.money_before" type="number" placeholder="请输入操作前金额"></el-input>
        </el-form-item>

        <el-form-item label="操作后金额" prop="money_after">
          <el-input v-model="formData.money_after" type="number" placeholder="请输入操作后金额"></el-input>
        </el-form-item>

        <el-form-item label="金额类型" prop="money_type">
          <el-select v-model="formData.money_type" placeholder="请选择金额类型">
            <el-option label="money" value="money"></el-option>
            <el-option label="bonus" value="bonus"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="数量类型" prop="number_type">
          <el-select v-model="formData.number_type" placeholder="请选择数量类型">
            <el-option label="增加(+)" :value="1"></el-option>
            <el-option label="减少(-)" :value="-1"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="操作类型" prop="operate_type">
          <el-input v-model="formData.operate_type" type="number" placeholder="请输入操作类型"></el-input>
        </el-form-item>

        <el-form-item label="关联模型">
          <el-input v-model="formData.model_name" placeholder="请输入关联模型名称"></el-input>
        </el-form-item>

        <el-form-item label="模型ID">
          <el-input v-model="formData.model_id" type="number" placeholder="请输入模型ID"></el-input>
        </el-form-item>

        <el-form-item label="操作描述">
          <el-input v-model="formData.description" placeholder="请输入操作描述"></el-input>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息">
          </el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { gameLogApi, gameLogAddApi, gameLogEditApi, gameLogDelApi } from '@/api/adminApi'

export default {
  name: 'GameLog',
  data() {
    return {
      // 搜索表单
      searchForm: {
        member_id: '',
        start_time: '',
        end_time: '',
        min_money: '',
        max_money: '',
        operate_type: '',
        money_type: ''
      },

      // 表格数据
      tableData: [],
      loading: false,

      // 分页
      currentPage: 1,
      pageSize: 20,
      total: 0,

      // 统计信息
      statistics: {},

      // 对话框
      dialogVisible: false,
      dialogTitle: '新增游戏记录',
      isEdit: false,
      submitLoading: false,

      // 表单数据
      formData: {
        id: '',
        member_id: '',
        money: '',
        money_before: '',
        money_after: '',
        money_type: 'money',
        number_type: 1,
        operate_type: '',
        model_name: '',
        model_id: '',
        description: '',
        remark: ''
      },

      // 表单验证规则
      formRules: {
        member_id: [
          { required: true, message: '请输入用户ID', trigger: 'blur' }
        ],
        money: [
          { required: true, message: '请输入操作金额', trigger: 'blur' }
        ],
        money_before: [
          { required: true, message: '请输入操作前金额', trigger: 'blur' }
        ],
        money_after: [
          { required: true, message: '请输入操作后金额', trigger: 'blur' }
        ],
        operate_type: [
          { required: true, message: '请输入操作类型', trigger: 'blur' }
        ]
      }
    }
  },

  mounted() {
    this.getList()
  },

  methods: {
    // 获取列表数据
    async getList() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          ...this.searchForm
        }

        const response = await gameLogApi(params)

        if (response.code === 200) {
          this.tableData = response.data.list
          this.total = response.data.total
          this.statistics = response.data.statistics
        } else {
          this.$message.error(response.message || '获取数据失败')
        }
      } catch (error) {
        console.error('获取游戏记录失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    // 重置搜索
    resetSearch() {
      this.searchForm = {
        member_id: '',
        start_time: '',
        end_time: '',
        min_money: '',
        max_money: '',
        operate_type: '',
        money_type: ''
      }
      this.currentPage = 1
      this.getList()
    },

    // 分页相关
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.getList()
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.getList()
    },

    // 显示新增对话框
    showAddDialog() {
      this.dialogTitle = '新增游戏记录'
      this.isEdit = false
      this.resetFormData()
      this.dialogVisible = true
    },

    // 显示编辑对话框
    showEditDialog(row) {
      this.dialogTitle = '编辑游戏记录'
      this.isEdit = true
      this.formData = {
        id: row.id,
        member_id: row.member_id,
        money: row.money,
        money_before: row.money_before,
        money_after: row.money_after,
        money_type: row.money_type,
        number_type: row.number_type,
        operate_type: row.operate_type,
        model_name: row.model_name || '',
        model_id: row.model_id || '',
        description: row.description || '',
        remark: row.remark || ''
      }
      this.dialogVisible = true
    },

    // 重置表单数据
    resetFormData() {
      this.formData = {
        id: '',
        member_id: '',
        money: '',
        money_before: '',
        money_after: '',
        money_type: 'money',
        number_type: 1,
        operate_type: '',
        model_name: '',
        model_id: '',
        description: '',
        remark: ''
      }

      // 清除表单验证
      if (this.$refs.dataForm) {
        this.$refs.dataForm.clearValidate()
      }
    },

    // 关闭对话框
    handleDialogClose() {
      this.dialogVisible = false
      this.resetFormData()
    },

    // 提交表单
    submitForm() {
      this.$refs.dataForm.validate(async (valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            let response
            if (this.isEdit) {
              response = await gameLogEditApi(this.formData)
            } else {
              response = await gameLogAddApi(this.formData)
            }

            if (response.code === 200) {
              this.$message.success(response.message || '操作成功')
              this.dialogVisible = false
              this.getList()
            } else {
              this.$message.error(response.message || '操作失败')
            }
          } catch (error) {
            console.error('提交失败:', error)
            this.$message.error('操作失败')
          } finally {
            this.submitLoading = false
          }
        }
      })
    },

    // 删除记录
    deleteRecord(row) {
      this.$confirm(`确定要删除ID为 ${row.id} 的游戏记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await gameLogDelApi({ id: row.id })

          if (response.code === 200) {
            this.$message.success(response.message || '删除成功')
            this.getList()
          } else {
            this.$message.error(response.message || '删除失败')
          }
        } catch (error) {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      })
    }
  }
}
</script>

<style scoped>
.game-log-container {
  padding: 20px;
}

.search-form {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,.12), 0 0 6px rgba(0,0,0,.04);
}

.statistics-info {
  margin-bottom: 20px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.text-success {
  color: #67C23A !important;
}

.text-danger {
  color: #F56C6C !important;
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}

.dialog-footer {
  text-align: right;
}
</style>
