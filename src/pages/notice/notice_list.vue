<template>
  <div class="notice-list">
    <!-- 头部操作区 -->
    <div class="header-actions">
      <el-button type="primary" @click="showAddDialog">
        <i class="el-icon-plus"></i> 新增通知
      </el-button>

      <!-- 状态筛选 -->
      <el-select
        v-model="searchForm.status"
        placeholder="选择状态"
        clearable
        @change="handleSearch"
        style="width: 150px; margin-left: 10px;">
        <el-option label="全部" value=""></el-option>
        <el-option label="上架" value="1"></el-option>
        <el-option label="下架" value="0"></el-option>
      </el-select>
    </div>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      v-loading="loading"
      style="width: 100%; margin-top: 20px;">

      <el-table-column prop="id" label="ID" width="80"></el-table-column>

      <el-table-column prop="content" label="通知内容" min-width="200">
        <template slot-scope="scope">
          <span :title="scope.row.content">{{ scope.row.content }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status == 1 ? 'success' : 'danger'">
            {{ scope.row.status == 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="position" label="位置" width="100"></el-table-column>

      <el-table-column prop="create_time" label="创建时间" width="180"></el-table-column>

      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>

    </el-table>

    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.page"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.limit"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      style="margin-top: 20px; text-align: right;">
    </el-pagination>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      @close="resetForm">

      <el-form :model="form" :rules="rules" ref="form" label-width="100px">

        <el-form-item label="通知内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="3"
            placeholder="请输入通知内容"
            maxlength="255"
            show-word-limit>
          </el-input>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="位置" prop="position">
          <el-input-number
            v-model="form.position"
            :min="1"
            :max="100"
            placeholder="请输入位置">
          </el-input-number>
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
import {
  noticeListApi,
  noticeListAddApi,
  noticeListEditApi,
  noticeListDelApi
} from '@/api/adminApi'

export default {
  name: 'NoticeList',
  data() {
    return {
      // 表格数据
      tableData: [],
      loading: false,

      // 搜索表单
      searchForm: {
        status: ''
      },

      // 分页
      pagination: {
        page: 1,
        limit: 20,
        total: 0
      },

      // 弹窗
      dialogVisible: false,
      dialogTitle: '新增通知',
      submitLoading: false,

      // 表单
      form: {
        id: '',
        content: '',
        status: 1,
        position: 1
      },

      // 表单验证规则
      rules: {
        content: [
          { required: true, message: '请输入通知内容', trigger: 'blur' },
          { max: 255, message: '内容长度不能超过255字符', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ],
        position: [
          { required: true, message: '请输入位置', trigger: 'blur' },
          { type: 'number', min: 1, message: '位置必须大于0', trigger: 'blur' }
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
          page: this.pagination.page,
          limit: this.pagination.limit,
          status: this.searchForm.status
        }

        const res = await noticeListApi(params)

        if (res.code === 200) {
          this.tableData = res.data.list || []
          this.pagination.total = res.data.total || 0
        } else {
          this.$message.error(res.message || '获取数据失败')
        }
      } catch (error) {
        console.error('获取通知列表失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.getList()
    },

    // 分页 - 每页数量变化
    handleSizeChange(val) {
      this.pagination.limit = val
      this.pagination.page = 1
      this.getList()
    },

    // 分页 - 页码变化
    handleCurrentChange(val) {
      this.pagination.page = val
      this.getList()
    },

    // 显示新增弹窗
    showAddDialog() {
      this.dialogTitle = '新增通知'
      this.dialogVisible = true
      this.resetForm()
    },

    // 编辑
    handleEdit(row) {
      this.dialogTitle = '编辑通知'
      this.form = {
        id: row.id,
        content: row.content,
        status: row.status,
        position: row.position
      }
      this.dialogVisible = true
    },

    // 删除
    handleDelete(row) {
      this.$confirm('确认删除这条通知吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await noticeListDelApi({ id: row.id })

          if (res.code === 200) {
            this.$message.success('删除成功')
            this.getList()
          } else {
            this.$message.error(res.message || '删除失败')
          }
        } catch (error) {
          console.error('删除通知失败:', error)
          this.$message.error('删除失败')
        }
      }).catch(() => {
        // 用户取消删除
      })
    },

    // 提交表单
    handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            const isEdit = !!this.form.id
            const api = isEdit ? noticeListEditApi : noticeListAddApi
            const res = await api(this.form)

            if (res.code === 200) {
              this.$message.success(isEdit ? '编辑成功' : '新增成功')
              this.dialogVisible = false
              this.getList()
            } else {
              this.$message.error(res.message || '操作失败')
            }
          } catch (error) {
            console.error('提交表单失败:', error)
            this.$message.error('操作失败')
          } finally {
            this.submitLoading = false
          }
        }
      })
    },

    // 重置表单
    resetForm() {
      this.form = {
        id: '',
        content: '',
        status: 1,
        position: 1
      }
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    }
  }
}
</script>

<style scoped>
.notice-list {
  padding: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.el-table .el-table__cell {
  text-align: center;
}

.dialog-footer {
  text-align: right;
}
</style>
