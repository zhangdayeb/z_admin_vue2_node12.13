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
        <el-form-item label="TG用户名">
          <el-input v-model="searchForm.tg_username" placeholder="请输入TG用户名" clearable style="width: 200px" />
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
        <el-form-item label="实名状态">
          <el-select v-model="searchForm.is_real_name" placeholder="请选择实名状态" clearable style="width: 120px">
            <el-option label="已实名" :value="1" />
            <el-option label="未实名" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="货币类型">
          <el-select v-model="searchForm.currency" placeholder="请选择货币类型" clearable style="width: 120px">
            <el-option label="人民币" value="CNY" />
            <el-option label="美元" value="USD" />
            <el-option label="泰铢" value="THB" />
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
        <el-table-column prop="tg_username" label="TG用户名" width="130">
          <template slot-scope="scope">
            <span v-if="scope.row.tg_username">@{{ scope.row.tg_username }}</span>
            <span v-else class="text-muted">未绑定</span>
          </template>
        </el-table-column>
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
        <el-table-column prop="is_real_name" label="实名状态" width="90">
          <template slot-scope="scope">
            <el-tag :type="scope.row.is_real_name === 1 ? 'success' : 'warning'">
              {{ scope.row.is_real_name === 1 ? '已实名' : '未实名' }}
            </el-tag>
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
        <el-table-column prop="money_fanyong" label="返佣余额" width="120">
          <template slot-scope="scope">
            <span style="color: #E6A23C">{{ scope.row.money_fanyong.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fanshui_proportion" label="返水比例" width="100">
          <template slot-scope="scope">
            {{ (scope.row.fanshui_proportion * 100).toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column prop="fanyong_proportion" label="返佣比例" width="100">
          <template slot-scope="scope">
            {{ (scope.row.fanyong_proportion * 100).toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column prop="money_total_recharge" label="累计充值" width="120">
          <template slot-scope="scope">
            {{ scope.row.money_total_recharge.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="agent_id" label="代理ID" width="80" />
        <el-table-column prop="currency" label="货币" width="80" />
        <el-table-column prop="created_at" label="创建时间" width="150" />
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="info" size="mini" @click="handleView(scope.row)">详情</el-button>
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
    <el-dialog :title="dialogType === 'add' ? '新增用户' : '编辑用户'" :visible.sync="dialogVisible" width="1000px">
      <el-form :model="formData" :rules="formRules" ref="userForm" label-width="120px">
        <el-tabs v-model="activeTab">
          <!-- 基础信息 -->
          <el-tab-pane label="基础信息" name="basic">
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
                <el-form-item label="语言" prop="language_code">
                  <el-select v-model="formData.language_code" placeholder="请选择语言" style="width: 100%">
                    <el-option label="中文" value="zh" />
                    <el-option label="中文(简体)" value="zh-hans" />
                    <el-option label="English" value="en" />
                    <el-option label="ไทย" value="th" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="实名状态" prop="is_real_name">
                  <el-select v-model="formData.is_real_name" placeholder="请选择实名状态" style="width: 100%">
                    <el-option label="已实名" :value="1" />
                    <el-option label="未实名" :value="0" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="虚拟账号" prop="is_fictitious">
                  <el-select v-model="formData.is_fictitious" placeholder="是否虚拟账号" style="width: 100%">
                    <el-option label="否" :value="0" />
                    <el-option label="是" :value="1" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="试玩账号" prop="is_trial_account">
                  <el-select v-model="formData.is_trial_account" placeholder="是否试玩账号" style="width: 100%">
                    <el-option label="否" :value="0" />
                    <el-option label="是" :value="1" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <!-- 财务信息 -->
          <el-tab-pane label="财务信息" name="finance">
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
                <el-form-item label="返佣余额" prop="money_fanyong">
                  <el-input-number v-model="formData.money_fanyong" :precision="2" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="返水比例" prop="fanshui_proportion">
                  <el-input-number v-model="formData.fanshui_proportion" :precision="4" :min="0" :max="1" style="width: 100%" />
                  <div class="form-tip">比例范围：0-1，如0.05表示5%</div>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="返佣比例" prop="fanyong_proportion">
                  <el-input-number v-model="formData.fanyong_proportion" :precision="4" :min="0" :max="1" style="width: 100%" />
                  <div class="form-tip">比例范围：0-1，如0.03表示3%</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="提现密码设置" prop="withdraw_password_set">
                  <el-select v-model="formData.withdraw_password_set" placeholder="是否设置提现密码" style="width: 100%">
                    <el-option label="已设置" :value="1" />
                    <el-option label="未设置" :value="0" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <!-- 代理关系 -->
          <el-tab-pane label="代理关系" name="agent">
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
          </el-tab-pane>

          <!-- Telegram信息 -->
          <el-tab-pane label="Telegram信息" name="telegram">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="TG ID" prop="tg_id">
                  <el-input v-model="formData.tg_id" placeholder="请输入Telegram ID" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="TG用户名" prop="tg_username">
                  <el-input v-model="formData.tg_username" placeholder="请输入Telegram用户名（不含@）" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="TG姓名" prop="tg_first_name">
                  <el-input v-model="formData.tg_first_name" placeholder="请输入Telegram姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="TG姓氏" prop="tg_last_name">
                  <el-input v-model="formData.tg_last_name" placeholder="请输入Telegram姓氏" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="TG群组IDs" prop="tg_crowd_ids">
                  <el-input v-model="formData.tg_crowd_ids" placeholder="请输入Telegram群组IDs，多个用逗号分隔" />
                  <div class="form-tip">多个群组ID用英文逗号分隔，如：-1001234567890,-1001234567891</div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <!-- 备注信息 -->
          <el-tab-pane label="备注信息" name="remark">
            <el-form-item label="备注" prop="remarks">
              <el-input v-model="formData.remarks" type="textarea" :rows="5" placeholder="请输入备注信息" />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>

    <!-- 用户详情对话框 -->
    <el-dialog title="用户详情" :visible.sync="viewDialogVisible" width="800px">
      <div v-if="viewData" class="user-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">{{ viewData.id }}</el-descriptions-item>
          <el-descriptions-item label="用户账号">{{ viewData.name }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ viewData.nick_name || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ viewData.phone || '未绑定' }}</el-descriptions-item>
          <el-descriptions-item label="VIP等级">VIP{{ viewData.vip_grade }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="viewData.status === 1 ? 'success' : 'danger'">
              {{ viewData.status === 1 ? '正常' : '冻结' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="实名状态">
            <el-tag :type="viewData.is_real_name === 1 ? 'success' : 'warning'">
              {{ viewData.is_real_name === 1 ? '已实名' : '未实名' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="货币类型">{{ viewData.currency }}</el-descriptions-item>
          <el-descriptions-item label="可用余额">
            <span style="color: #67C23A; font-weight: bold;">{{ viewData.money.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="返水余额">
            <span style="color: #E6A23C; font-weight: bold;">{{ viewData.money_rebate.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="返佣余额">
            <span style="color: #E6A23C; font-weight: bold;">{{ viewData.money_fanyong.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="累计充值">{{ viewData.money_total_recharge.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="累计提现">{{ viewData.money_total_withdraw.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="返水比例">{{ (viewData.fanshui_proportion * 100).toFixed(2) }}%</el-descriptions-item>
          <el-descriptions-item label="返佣比例">{{ (viewData.fanyong_proportion * 100).toFixed(2) }}%</el-descriptions-item>
          <el-descriptions-item label="代理ID">{{ viewData.agent_id || '无' }}</el-descriptions-item>
          <el-descriptions-item label="TG用户名">
            <span v-if="viewData.tg_username">@{{ viewData.tg_username }}</span>
            <span v-else class="text-muted">未绑定</span>
          </el-descriptions-item>
          <el-descriptions-item label="TG ID">{{ viewData.tg_id || '未绑定' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ viewData.created_at }}</el-descriptions-item>
          <el-descriptions-item label="最后更新">{{ viewData.updated_at }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ viewData.remarks || '无' }}</el-descriptions-item>
        </el-descriptions>
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
      viewDialogVisible: false,
      dialogType: 'add', // add | edit
      activeTab: 'basic', // 当前激活的标签页

      // 搜索表单
      searchForm: {
        name: '',
        nick_name: '',
        phone: '',
        tg_username: '',
        status: '',
        vip_grade: '',
        is_real_name: '',
        currency: ''
      },

      // 分页
      pagination: {
        page: 1,
        limit: 20,
        total: 0
      },

      // 表格数据
      tableData: [],

      // 查看详情数据
      viewData: null,

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
        money_fanyong: 0,
        agent_id: 0,
        user_agent_id_1: null,
        user_agent_id_2: null,
        user_agent_id_3: null,
        currency: 'CNY',
        language_code: 'zh',
        fanshui_proportion: 0,
        fanyong_proportion: 0,
        tg_id: '',
        tg_username: '',
        tg_first_name: '',
        tg_last_name: '',
        tg_crowd_ids: '',
        is_real_name: 1,
        is_fictitious: 0,
        is_trial_account: 0,
        withdraw_password_set: 1,
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
        ],
        language_code: [
          { required: true, message: '请选择语言', trigger: 'change' }
        ],
        fanshui_proportion: [
          { type: 'number', min: 0, max: 1, message: '返水比例必须在0-1之间', trigger: 'blur' }
        ],
        fanyong_proportion: [
          { type: 'number', min: 0, max: 1, message: '返佣比例必须在0-1之间', trigger: 'blur' }
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
        tg_username: '',
        status: '',
        vip_grade: '',
        is_real_name: '',
        currency: ''
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
      this.activeTab = 'basic'
      this.formData = {
        id: '',
        name: '',
        nick_name: '',
        phone: '',
        vip_grade: 0,
        status: 1,
        money: 0,
        money_rebate: 0,
        money_fanyong: 0,
        agent_id: 0,
        user_agent_id_1: null,
        user_agent_id_2: null,
        user_agent_id_3: null,
        currency: 'CNY',
        language_code: 'zh',
        fanshui_proportion: 0,
        fanyong_proportion: 0,
        tg_id: '',
        tg_username: '',
        tg_first_name: '',
        tg_last_name: '',
        tg_crowd_ids: '',
        is_real_name: 1,
        is_fictitious: 0,
        is_trial_account: 0,
        withdraw_password_set: 1,
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
      this.activeTab = 'basic'
      this.formData = {
        id: row.id,
        name: row.name,
        nick_name: row.nick_name || '',
        phone: row.phone || '',
        vip_grade: row.vip_grade,
        status: row.status,
        money: row.money,
        money_rebate: row.money_rebate,
        money_fanyong: row.money_fanyong,
        agent_id: row.agent_id,
        user_agent_id_1: row.user_agent_id_1,
        user_agent_id_2: row.user_agent_id_2,
        user_agent_id_3: row.user_agent_id_3,
        currency: row.currency || 'CNY',
        language_code: row.language_code || 'zh',
        fanshui_proportion: row.fanshui_proportion || 0,
        fanyong_proportion: row.fanyong_proportion || 0,
        tg_id: row.tg_id || '',
        tg_username: row.tg_username || '',
        tg_first_name: row.tg_first_name || '',
        tg_last_name: row.tg_last_name || '',
        tg_crowd_ids: row.tg_crowd_ids || '',
        is_real_name: row.is_real_name,
        is_fictitious: row.is_fictitious || 0,
        is_trial_account: row.is_trial_account || 0,
        withdraw_password_set: row.withdraw_password_set || 1,
        remarks: row.remarks || ''
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.userForm.clearValidate()
      })
    },

    // 查看详情
    handleView(row) {
      this.viewData = { ...row }
      this.viewDialogVisible = true
    },

    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除这个用户吗？删除后将无法恢复！', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await userDelApi({ id: row.id })
          if (res.code === 200) {
            this.$message.success(res.msg || '删除成功')
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
            this.$message.success(res.msg || (this.dialogType === 'add' ? '新增成功' : '编辑成功'))
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

.text-muted {
  color: #999;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.user-detail {
  padding: 0 20px;
}

.user-detail .el-descriptions {
  margin-top: 20px;
}
