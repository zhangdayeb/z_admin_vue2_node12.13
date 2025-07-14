<template>
  <div class="activity-container">
    <!-- 搜索和操作区 -->
    <div class="search-box">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入活动标题"
            clearable
            @keyup.enter.native="handleSearch"
          />
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchForm.type" placeholder="选择活动类型" clearable>
            <el-option label="全部" value="" />
            <el-option
              v-for="item in activityTypes"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">新增活动</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      stripe
      border
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="活动标题" min-width="200" />
      <el-table-column prop="type_name" label="活动类型" width="120" />
      <el-table-column prop="author" label="作者" width="120" />
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="thumb_url" label="缩略图" width="120">
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.thumb_url"
            :src="scope.row.thumb_url"
            :preview-src-list="[scope.row.thumb_url]"
            style="width: 50px; height: 50px"
            fit="cover"
          />
          <span v-else>暂无图片</span>
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="创建时间" width="160" />
      <el-table-column prop="update_time" label="更新时间" width="160" />
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleView(scope.row)">查看</el-button>
          <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="pagination.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.limit"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogForm.id ? '编辑活动' : '新增活动'"
      :visible.sync="dialogVisible"
      width="60%"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="dialogForm"
        :model="dialogForm"
        :rules="dialogRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="活动标题" prop="title">
              <el-input v-model="dialogForm.title" placeholder="请输入活动标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动类型" prop="type">
              <el-select v-model="dialogForm.type" placeholder="请选择活动类型" style="width: 100%">
                <el-option
                  v-for="item in activityTypes"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="作者" prop="author">
              <el-input v-model="dialogForm.author" placeholder="请输入作者" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="描述">
              <el-input v-model="dialogForm.description" placeholder="请输入活动描述" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="缩略图">
          <el-upload
            ref="upload"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            :show-file-list="false"
            accept="image/*"
          >
            <div v-if="dialogForm.thumb_url" class="upload-preview">
              <el-image
                :src="dialogForm.thumb_url"
                style="width: 120px; height: 120px"
                fit="cover"
              />
              <div class="upload-overlay">
                <el-button size="mini" type="primary">重新上传</el-button>
              </div>
            </div>
            <div v-else class="upload-placeholder">
              <i class="el-icon-plus" />
              <div>点击上传图片</div>
            </div>
          </el-upload>
          <div class="upload-tip">支持 jpg、png、gif 格式，大小不超过 5MB</div>
        </el-form-item>

        <el-form-item label="活动内容" prop="content">
          <div id="editor-container" style="height: 300px;"></div>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 查看对话框 -->
    <el-dialog
      title="查看活动详情"
      :visible.sync="viewDialogVisible"
      width="60%"
    >
      <div v-if="viewData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="活动标题">{{ viewData.title }}</el-descriptions-item>
          <el-descriptions-item label="活动类型">{{ viewData.type_name }}</el-descriptions-item>
          <el-descriptions-item label="作者">{{ viewData.author || '暂无' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ viewData.create_time }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ viewData.update_time }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ viewData.description || '暂无' }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="viewData.thumb_url" style="margin-top: 20px;">
          <h4>缩略图：</h4>
          <el-image
            :src="viewData.thumb_url"
            :preview-src-list="[viewData.thumb_url]"
            style="width: 200px; height: 200px"
            fit="cover"
          />
        </div>

        <div style="margin-top: 20px;">
          <h4>活动内容：</h4>
          <div class="content-preview" v-html="viewData.content"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { activityListApi, activityAddApi, activityEditApi, activityDelApi } from '@/api/adminApi'

export default {
  name: 'ActivityList',
  data() {
    return {
      loading: false,
      submitLoading: false,
      tableData: [],
      searchForm: {
        title: '',
        type: ''
      },
      pagination: {
        page: 1,
        limit: 20,
        total: 0
      },
      dialogVisible: false,
      viewDialogVisible: false,
      viewData: null,
      dialogForm: {
        id: '',
        title: '',
        type: '',
        content: '',
        thumb_url: '',
        author: '',
        description: ''
      },
      dialogRules: {
        title: [
          { required: true, message: '请输入活动标题', trigger: 'blur' },
          { max: 200, message: '标题长度不能超过200字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择活动类型', trigger: 'change' }
        ],
        content: [
          { required: true, message: '请输入活动内容', trigger: 'blur' }
        ]
      },
      activityTypes: [
        { id: 1, name: '充值活动' },
        { id: 2, name: '展示活动' },
        { id: 3, name: '返水活动' }
      ],
      uploadUrl: process.env.VUE_APP_API_URL + '/info/upload',
      uploadHeaders: {
        'Authorization': 'Bearer ' + this.$store.getters.token
      },
      editor: null
    }
  },
  mounted() {
    this.getList()
    this.initEditor()
  },
  beforeDestroy() {
    if (this.editor) {
      this.editor.destroy()
    }
  },
  methods: {
    // 获取列表数据
    async getList() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          title: this.searchForm.title,
          type: this.searchForm.type
        }

        const res = await activityListApi(params)
        if (res.code === 200) {
          this.tableData = res.data.list
          this.pagination.total = res.data.total
        } else {
          this.$message.error(res.msg || '获取数据失败')
        }
      } catch (error) {
        this.$message.error('网络错误，请稍后重试')
      } finally {
        this.loading = false
      }
    },

    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.getList()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        title: '',
        type: ''
      }
      this.pagination.page = 1
      this.getList()
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.pagination.limit = val
      this.pagination.page = 1
      this.getList()
    },

    // 页码改变
    handleCurrentChange(val) {
      this.pagination.page = val
      this.getList()
    },

    // 新增
    handleAdd() {
      this.dialogForm = {
        id: '',
        title: '',
        type: '',
        content: '',
        thumb_url: '',
        author: '',
        description: ''
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.dialogForm.clearValidate()
        if (this.editor) {
          this.editor.setContents('')
        }
      })
    },

    // 编辑
    handleEdit(row) {
      this.dialogForm = {
        id: row.id,
        title: row.title,
        type: row.type,
        content: row.content,
        thumb_url: row.thumb_url,
        author: row.author || '',
        description: row.description || ''
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.dialogForm.clearValidate()
        if (this.editor) {
          this.editor.setContents(row.content || '')
        }
      })
    },

    // 查看
    handleView(row) {
      this.viewData = { ...row }
      this.viewDialogVisible = true
    },

    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除这个活动吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await activityDelApi({ id: row.id })
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.getList()
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
      this.$refs.dialogForm.validate(async (valid) => {
        if (!valid) return false

        // 获取编辑器内容
        if (this.editor) {
          this.dialogForm.content = this.editor.getHTML()
        }

        if (!this.dialogForm.content || this.dialogForm.content.trim() === '<p></p>') {
          this.$message.error('请输入活动内容')
          return false
        }

        this.submitLoading = true
        try {
          const api = this.dialogForm.id ? activityEditApi : activityAddApi
          const res = await api(this.dialogForm)

          if (res.code === 200) {
            this.$message.success(this.dialogForm.id ? '编辑成功' : '新增成功')
            this.dialogVisible = false
            this.getList()
          } else {
            this.$message.error(res.msg || '操作失败')
          }
        } catch (error) {
          this.$message.error('网络错误，请稍后重试')
        } finally {
          this.submitLoading = false
        }
      })
    },

    // 关闭对话框
    handleDialogClose() {
      this.dialogVisible = false
      this.$refs.dialogForm.resetFields()
    },

    // 文件上传前验证
    beforeUpload(file) {
      const isImage = /^image\//.test(file.type)
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      if (!isLt5M) {
        this.$message.error('上传图片大小不能超过 5MB!')
        return false
      }
      return true
    },

    // 文件上传成功
    handleUploadSuccess(response) {
      if (response.code === 200) {
        this.dialogForm.thumb_url = response.data.image_url
        this.$message.success('图片上传成功')
      } else {
        this.$message.error(response.msg || '图片上传失败')
      }
    },

    // 初始化富文本编辑器（这里使用示例，实际可以使用 quill、tinymce 等）
    initEditor() {
      // 这里是示例代码，需要根据实际使用的富文本编辑器来实现
      // 比如使用 quill:
      // import Quill from 'quill'
      // this.editor = new Quill('#editor-container', { theme: 'snow' })

      // 简单示例，实际项目中请使用专业的富文本编辑器
      this.editor = {
        setContents: (content) => {
          const container = document.getElementById('editor-container')
          if (container) {
            container.innerHTML = `<textarea style="width:100%;height:100%;border:1px solid #ddd;padding:10px;">${content}</textarea>`
          }
        },
        getHTML: () => {
          const textarea = document.querySelector('#editor-container textarea')
          return textarea ? textarea.value : ''
        },
        destroy: () => {
          // 清理编辑器
        }
      }
    }
  }
}
</script>

<style scoped>
.activity-container {
  padding: 20px;
}

.search-box {
  background: #fff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.upload-preview {
  position: relative;
  display: inline-block;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.upload-preview:hover .upload-overlay {
  opacity: 1;
}

.upload-placeholder {
  width: 120px;
  height: 120px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-placeholder:hover {
  border-color: #409eff;
}

.upload-placeholder i {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-tip {
  color: #606266;
  font-size: 12px;
  margin-top: 8px;
}

.content-preview {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
  background: #fafafa;
}
</style>
