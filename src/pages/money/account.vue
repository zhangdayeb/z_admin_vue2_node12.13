<template>
  <div class="account-management">
    <!-- 顶部操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增账号</el-button>

      <!-- 筛选条件 -->
      <div class="filter-bar">
        <el-select v-model="filterParams.method_code" placeholder="支付方式" clearable @change="handleSearch">
          <el-option label="全部" value=""></el-option>
          <el-option
            v-for="method in payMethods"
            :key="method.method_code"
            :label="method.method_name"
            :value="method.method_code">
            <span>{{ method.icon }} {{ method.method_name }}</span>
          </el-option>
        </el-select>

        <el-select v-model="filterParams.is_active" placeholder="状态" clearable @change="handleSearch">
          <el-option label="全部" value=""></el-option>
          <el-option label="启用" :value="1"></el-option>
          <el-option label="禁用" :value="0"></el-option>
        </el-select>

        <el-input
          v-model="filterParams.account_name"
          placeholder="账户名称"
          clearable
          @keyup.enter="handleSearch"
          style="width: 200px;">
        </el-input>

        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="80"></el-table-column>

      <el-table-column label="支付方式" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.method_icon }} {{ scope.row.method_name }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="account_name" label="账户名称" width="150"></el-table-column>

      <el-table-column label="账户信息" min-width="200">
        <template slot-scope="scope">
          <div v-if="scope.row.method_code === 'bank'">
            <div>银行：{{ scope.row.bank_name }}</div>
            <div>卡号：{{ scope.row.account_number }}</div>
          </div>
          <div v-else-if="scope.row.method_code === 'huiwang'">
            <div>账号：{{ scope.row.account_number }}</div>
            <div>手机：{{ scope.row.phone_number }}</div>
          </div>
          <div v-else-if="scope.row.method_code === 'usdt'">
            <div>地址：{{ scope.row.wallet_address }}</div>
            <div v-if="scope.row.network_type">网络：{{ scope.row.network_type }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="限额" width="150">
        <template slot-scope="scope">
          <div v-if="scope.row.daily_limit">日限额：¥{{ scope.row.daily_limit }}</div>
          <div v-if="scope.row.balance_limit">余额限制：¥{{ scope.row.balance_limit }}</div>
          <div v-if="!scope.row.daily_limit && !scope.row.balance_limit">无限制</div>
        </template>
      </el-table-column>

      <el-table-column label="二维码" width="100">
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.qr_code_url"
            :src="scope.row.qr_code_url"
            :preview-src-list="[scope.row.qr_code_url]"
            style="width: 40px; height: 40px;"
            fit="cover">
          </el-image>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column label="使用统计" width="120">
        <template slot-scope="scope">
          <div>使用：{{ scope.row.usage_count }}次</div>
          <div v-if="scope.row.last_used_at" style="font-size: 12px; color: #999;">
            最后：{{ formatDate(scope.row.last_used_at) }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.is_active ? 'success' : 'danger'">
            {{ scope.row.is_active ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="创建时间" width="150">
        <template slot-scope="scope">
          {{ formatDate(scope.row.created_at) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button
            size="mini"
            :type="scope.row.is_active ? 'warning' : 'success'"
            @click="handleToggleStatus(scope.row)">
            {{ scope.row.is_active ? '禁用' : '启用' }}
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
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
      :title="dialogType === 'add' ? '新增账号' : '编辑账号'"
      :visible.sync="dialogVisible"
      width="600px"
      @close="resetForm">

      <el-form :model="formData" :rules="formRules" ref="accountForm" label-width="120px">
        <el-form-item label="支付方式" prop="method_code">
          <el-select v-model="formData.method_code" placeholder="请选择支付方式" @change="handleMethodChange">
            <el-option
              v-for="method in payMethods"
              :key="method.method_code"
              :label="method.method_name"
              :value="method.method_code">
              <span>{{ method.icon }} {{ method.method_name }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="账户名称" prop="account_name">
          <el-input v-model="formData.account_name" placeholder="请输入账户名称"></el-input>
        </el-form-item>

        <!-- 银行转账字段 -->
        <template v-if="formData.method_code === 'bank'">
          <el-form-item label="银行卡号" prop="account_number">
            <el-input v-model="formData.account_number" placeholder="请输入银行卡号（纯数字）"></el-input>
          </el-form-item>
          <el-form-item label="银行名称" prop="bank_name">
            <el-input v-model="formData.bank_name" placeholder="请输入银行名称"></el-input>
          </el-form-item>
        </template>

        <!-- 汇旺转账字段 -->
        <template v-if="formData.method_code === 'huiwang'">
          <el-form-item label="汇旺账号" prop="account_number">
            <el-input v-model="formData.account_number" placeholder="请输入汇旺账号"></el-input>
          </el-form-item>
          <el-form-item label="手机号码" prop="phone_number">
            <el-input v-model="formData.phone_number" placeholder="请输入手机号码"></el-input>
          </el-form-item>
        </template>

        <!-- USDT转账字段 -->
        <template v-if="formData.method_code === 'usdt'">
          <el-form-item label="钱包地址" prop="wallet_address">
            <el-input v-model="formData.wallet_address" placeholder="请输入USDT钱包地址"></el-input>
          </el-form-item>
          <el-form-item label="网络类型" prop="network_type">
            <el-select v-model="formData.network_type" placeholder="请选择网络类型">
              <el-option label="TRC20 (TRON)" value="TRC20"></el-option>
              <el-option label="ERC20 (Ethereum)" value="ERC20"></el-option>
            </el-select>
          </el-form-item>
        </template>

        <el-form-item label="二维码">
          <div class="qr-upload">
            <el-upload
              :action="uploadUrl"
              :show-file-list="false"
              :on-success="handleQrCodeSuccess"
              :before-upload="beforeQrCodeUpload"
              name="image"
              accept="image/*">
              <img v-if="formData.qr_code_url" :src="formData.qr_code_url" class="qr-image">
              <i v-else class="el-icon-plus qr-uploader"></i>
            </el-upload>
            <div class="upload-tip">点击上传二维码图片（支持jpg、png、gif等格式，最大5MB）</div>
          </div>
        </el-form-item>

        <el-form-item label="日限额">
          <el-input-number
            v-model="formData.daily_limit"
            :min="0"
            :precision="2"
            placeholder="不设置则无限制">
          </el-input-number>
        </el-form-item>

        <el-form-item label="余额限制">
          <el-input-number
            v-model="formData.balance_limit"
            :min="0"
            :precision="2"
            placeholder="不设置则无限制">
          </el-input-number>
        </el-form-item>

        <el-form-item label="状态" v-if="dialogType === 'edit'">
          <el-switch v-model="formData.is_active" :active-value="1" :inactive-value="0"></el-switch>
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
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { accountListApi, accountListAddApi, accountListEditApi, accountListDelApi } from '@/api/adminApi'
import { baseUrl } from '@/utils/config'

export default {
  name: 'AccountManagement',
  data() {
    return {
      loading: false,
      submitLoading: false,
      tableData: [],
      payMethods: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,

      // 上传地址
      uploadUrl: baseUrl + '/info/upload',

      // 筛选参数
      filterParams: {
        method_code: '',
        is_active: '',
        account_name: ''
      },

      // 对话框
      dialogVisible: false,
      dialogType: 'add', // add | edit

      // 表单数据
      formData: {
        id: null,
        method_code: '',
        account_name: '',
        account_number: '',
        bank_name: '',
        phone_number: '',
        wallet_address: '',
        network_type: '',
        qr_code_url: '',
        daily_limit: null,
        balance_limit: null,
        is_active: 1,
        remark: ''
      },

      // 表单验证规则
      formRules: {
        method_code: [
          { required: true, message: '请选择支付方式', trigger: 'change' }
        ],
        account_name: [
          { required: true, message: '请输入账户名称', trigger: 'blur' },
          { min: 2, max: 50, message: '账户名称长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        account_number: [
          { required: true, message: '请输入账号', trigger: 'blur' }
        ],
        bank_name: [
          { required: true, message: '请输入银行名称', trigger: 'blur' }
        ],
        phone_number: [
          { required: true, message: '请输入手机号码', trigger: 'blur' }
        ],
        wallet_address: [
          { required: true, message: '请输入钱包地址', trigger: 'blur' }
        ]
      }
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
          page: this.currentPage,
          limit: this.pageSize,
          ...this.filterParams
        }

        const res = await accountListApi(params)
        if (res.code === 200) {
          this.tableData = res.data.list
          this.total = res.data.total
          this.payMethods = res.data.pay_methods || []
        }
      } catch (error) {
        this.$message.error('加载数据失败')
      }
      this.loading = false
    },

    // 搜索
    handleSearch() {
      this.currentPage = 1
      this.loadData()
    },

    // 重置筛选
    handleReset() {
      this.filterParams = {
        method_code: '',
        is_active: '',
        account_name: ''
      }
      this.handleSearch()
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.loadData()
    },

    // 页码改变
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadData()
    },

    // 新增
    handleAdd() {
      this.dialogType = 'add'
      this.dialogVisible = true
      this.resetForm()
    },

    // 编辑
    handleEdit(row) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.formData = { ...row }
    },

    // 切换状态
    async handleToggleStatus(row) {
      try {
        const newStatus = row.is_active ? 0 : 1
        const params = {
          id: row.id,
          ...row,
          is_active: newStatus
        }

        const res = await accountListEditApi(params)
        if (res.code === 200) {
          this.$message.success(newStatus ? '启用成功' : '禁用成功')
          this.loadData()
        }
      } catch (error) {
        this.$message.error('操作失败')
      }
    },

    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除这个账号吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await accountListDelApi({ id: row.id })
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.loadData()
          }
        } catch (error) {
          this.$message.error('删除失败')
        }
      })
    },

    // 支付方式改变
    handleMethodChange() {
      // 清空相关字段
      this.formData.account_number = ''
      this.formData.bank_name = ''
      this.formData.phone_number = ''
      this.formData.wallet_address = ''
      this.formData.network_type = ''
    },

    // 二维码上传成功
    handleQrCodeSuccess(res) {
      if (res.code === 200) {
        this.formData.qr_code_url = res.data.image_url
        this.$message.success('二维码上传成功')
      } else {
        this.$message.error(res.msg || '二维码上传失败')
      }
    },

    // 二维码上传前验证
    beforeQrCodeUpload(file) {
      // 检查文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp']
      const isValidType = allowedTypes.includes(file.type)

      // 检查文件大小（5MB限制）
      const isLt5M = file.size / 1024 / 1024 < 5

      // 检查文件扩展名
      const fileName = file.name.toLowerCase()
      const validExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
      const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1)
      const isValidExt = validExts.includes(fileExt)

      if (!isValidType || !isValidExt) {
        this.$message.error('只能上传 JPG、PNG、GIF、BMP、WebP 格式的图片!')
        return false
      }

      if (!isLt5M) {
        this.$message.error('图片大小不能超过 5MB!')
        return false
      }

      return true
    },

    // 提交表单
    handleSubmit() {
      this.$refs.accountForm.validate(async (valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            let res
            if (this.dialogType === 'add') {
              res = await accountListAddApi(this.formData)
            } else {
              res = await accountListEditApi(this.formData)
            }

            if (res.code === 200) {
              this.$message.success(this.dialogType === 'add' ? '新增成功' : '编辑成功')
              this.dialogVisible = false
              this.loadData()
            }
          } catch (error) {
            this.$message.error(this.dialogType === 'add' ? '新增失败' : '编辑失败')
          }
          this.submitLoading = false
        }
      })
    },

    // 重置表单
    resetForm() {
      this.formData = {
        id: null,
        method_code: '',
        account_name: '',
        account_number: '',
        bank_name: '',
        phone_number: '',
        wallet_address: '',
        network_type: '',
        qr_code_url: '',
        daily_limit: null,
        balance_limit: null,
        is_active: 1,
        remark: ''
      }
      if (this.$refs.accountForm) {
        this.$refs.accountForm.clearValidate()
      }
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.account-management {
  padding: 20px;
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-bar {
  display: flex;
  gap: 10px;
  align-items: center;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: center;
}

.qr-upload {
  text-align: center;
}

.qr-image {
  width: 100px;
  height: 100px;
  border-radius: 6px;
  object-fit: cover;
}

.qr-uploader {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.qr-uploader:hover {
  border-color: #409EFF;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .operation-bar {
    flex-direction: column;
    gap: 15px;
  }

  .filter-bar {
    flex-wrap: wrap;
  }
}
</style>
