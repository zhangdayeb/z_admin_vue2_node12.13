<template>
  <div class="config-container">
    <div class="page-header">
      <div class="header-left" v-if="isEditMode">
        <el-button
          type="text"
          icon="el-icon-arrow-left"
          @click="goBack"
          class="back-btn"
        >
          返回列表
        </el-button>
      </div>
      <h2>{{ pageTitle }}</h2>
      <p>{{ pageDescription }}</p>
      <div class="tip-notice">
        <i class="el-icon-info"></i>
        <span>欢迎词如果需要换行请插入 [换行] 程序会自动替换成telegram 里面的换行</span>
      </div>
    </div>

    <el-card v-loading="loading">
      <div slot="header">
        <span>配置信息</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="resetForm"
        >
          重置
        </el-button>
      </div>

      <el-form
        ref="configForm"
        :model="configData"
        :rules="rules"
        label-width="120px"
        size="medium"
      >
        <!-- 欢迎消息 -->
        <el-form-item label="欢迎消息" prop="welcome">
          <el-input
            v-model="configData.welcome"
            type="textarea"
            :rows="6"
            placeholder="请输入欢迎消息内容"
            maxlength="1000"
            show-word-limit
          />
          <div class="form-tip">
            注意：使用 [换行] 来表示换行
          </div>
        </el-form-item>

        <!-- 按钮配置 -->
        <div class="button-config-section">
          <h3>按钮配置</h3>

          <el-row :gutter="20" v-for="i in 6" :key="i">
            <el-col :span="12">
              <el-form-item :label="`按钮${i}名称`">
                <el-input
                  v-model="configData[`button${i}_name`]"
                  placeholder="请输入按钮名称"
                  maxlength="200"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="`按钮${i}链接`">
                <el-input
                  v-model="configData[`button${i}_url`]"
                  placeholder="请输入按钮链接"
                  maxlength="200"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            @click="saveConfig"
            :loading="saving"
          >
            保存配置
          </el-button>
          <el-button @click="loadConfig">
            重新加载
          </el-button>
          <el-button @click="goBack" v-if="isEditMode">
            返回列表
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>


  </div>
</template>

<script>
import { getBotConfigApi, updateBotConfigApi } from '@/api/telegramApi'

export default {
  name: 'Config',
  data() {
    return {
      loading: false,
      saving: false,

      // 当前编辑的机器人ID
      currentBotId: null,

      // 配置数据 - 只保留原有字段
      configData: {
        welcome: '',
        button1_name: '',
        button1_url: '',
        button2_name: '',
        button2_url: '',
        button3_name: '',
        button3_url: '',
        button4_name: '',
        button4_url: '',
        button5_name: '',
        button5_url: '',
        button6_name: '',
        button6_url: ''
      },

      // 表单验证规则
      rules: {
        welcome: [
          { required: true, message: '请输入欢迎消息', trigger: 'blur' },
          { min: 10, message: '欢迎消息至少10个字符', trigger: 'blur' }
        ]
      }
    }
  },

  computed: {
    // 是否为编辑模式
    isEditMode() {
      return !!this.currentBotId
    },

    // 页面标题
    pageTitle() {
      return this.isEditMode ? '编辑机器人配置' : '机器人配置管理'
    },

    // 页面描述
    pageDescription() {
      return this.isEditMode
        ? `正在编辑机器人 ID: ${this.currentBotId} 的配置`
        : '配置Telegram机器人的欢迎消息和按钮'
    }
  },

  mounted() {
    this.initPage()
  },

  // 监听路由变化
  watch: {
    '$route'(to, from) {
      this.initPage()
    }
  },

  methods: {
    // 初始化页面
    initPage() {
      // 从URL参数获取bot_id
      this.currentBotId = this.$route.query.bot_id || null
      this.loadConfig()
    },

    // 加载配置
    async loadConfig() {
      this.loading = true
      try {
        const params = {}

        // 如果有bot_id，传递给后端
        if (this.currentBotId) {
          params.bot_id = this.currentBotId
        }

        const res = await getBotConfigApi(params)

        if (res.code === 200) {
          // 如果有数据，使用返回的数据 - 只使用原有字段
          if (res.data) {
            this.configData = {
              welcome: res.data.welcome || '',
              button1_name: res.data.button1_name || '',
              button1_url: res.data.button1_url || '',
              button2_name: res.data.button2_name || '',
              button2_url: res.data.button2_url || '',
              button3_name: res.data.button3_name || '',
              button3_url: res.data.button3_url || '',
              button4_name: res.data.button4_name || '',
              button4_url: res.data.button4_url || '',
              button5_name: res.data.button5_name || '',
              button5_url: res.data.button5_url || '',
              button6_name: res.data.button6_name || '',
              button6_url: res.data.button6_url || ''
            }
          }
          this.$message.success('配置加载成功')
        } else {
          this.$message.error(res.message || '加载配置失败')
        }
      } catch (error) {
        console.error('加载配置失败:', error)
        this.$message.error('网络错误，请稍后重试')
      } finally {
        this.loading = false
      }
    },

    // 保存配置
    async saveConfig() {
      try {
        // 表单验证
        const valid = await this.$refs.configForm.validate()
        if (!valid) {
          return
        }

        this.saving = true

        const saveData = { ...this.configData }

        // 如果有bot_id，添加到保存数据中
        if (this.currentBotId) {
          saveData.bot_id = this.currentBotId
        }

        const res = await updateBotConfigApi(saveData)

        if (res.code === 200) {
          this.$message.success('配置保存成功')

          // 如果是编辑模式，询问是否返回列表
          if (this.isEditMode) {
            this.$confirm('配置保存成功，是否返回机器人列表？', '提示', {
              confirmButtonText: '返回列表',
              cancelButtonText: '继续编辑',
              type: 'success'
            }).then(() => {
              this.goBack()
            }).catch(() => {
              // 用户选择继续编辑，不做任何操作
            })
          }
        } else {
          this.$message.error(res.message || '保存配置失败')
        }
      } catch (error) {
        console.error('保存配置失败:', error)
        this.$message.error('网络错误，请稍后重试')
      } finally {
        this.saving = false
      }
    },

    // 重置表单
    resetForm() {
      this.$refs.configForm.resetFields()
      this.loadConfig()
    },

    // 返回列表页
    goBack() {
      this.$router.push('/telegram/BotList')
    }
  }
}
</script>

<style scoped>
.config-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.header-left {
  margin-bottom: 15px;
}

.back-btn {
  margin-bottom: 10px;
  font-size: 14px;
  color: #409eff;
}

.back-btn:hover {
  color: #66b1ff;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  margin: 0 0 10px 0;
  color: #909399;
  font-size: 14px;
}

.tip-notice {
  padding: 12px 16px;
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  color: #1890ff;
  font-size: 14px;
}

.tip-notice i {
  margin-right: 8px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.bot-info-section,
.button-config-section,
.advanced-config-section {
  margin: 30px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.bot-info-section h3,
.button-config-section h3,
.advanced-config-section h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.el-form-item {
  margin-bottom: 22px;
}

.el-card {
  border-radius: 8px;
}

.el-card ::v-deep .el-card__header {
  border-bottom: 1px solid #f0f0f0;
  padding: 18px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-card ::v-deep .el-card__body {
  padding: 20px;
}

/* 响应式处理 */
@media (max-width: 768px) {
  .config-container {
    padding: 10px;
  }

  .bot-info-section,
  .button-config-section,
  .advanced-config-section {
    padding: 15px;
  }

  .el-row {
    margin: 0;
  }

  .el-col {
    padding: 0 5px;
  }
}
</style>
