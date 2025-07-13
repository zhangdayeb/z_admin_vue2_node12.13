<template>
  <div class="promotion-container">
    <el-card class="header-card">
      <div class="page-header">
        <h2 class="page-title">推广管理</h2>
        <p class="page-desc">生成您的专属推广链接，邀请用户注册</p>
      </div>
    </el-card>

    <el-card class="content-card" v-loading="loading">
      <!-- 代理信息展示 -->
      <div class="agent-info" v-if="promotionData">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <span class="label">代理账号：</span>
              <span class="value">{{ promotionData.agent_name }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="label">当前余额：</span>
              <span class="value money">¥{{ promotionData.current_balance }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="label">累计收益：</span>
              <span class="value money earnings">¥{{ promotionData.total_earnings }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="label">邀请码：</span>
              <span class="value highlight">{{ promotionData.invitation_code }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-divider></el-divider>

      <!-- 推广地址展示 -->
      <div class="promotion-section" v-if="promotionData">
        <h3 class="section-title">推广链接</h3>

        <div class="url-container">
          <el-input
            v-model="promotionData.promotion_url"
            readonly
            class="url-input"
            placeholder="推广链接">
            <el-button
              slot="append"
              @click="copyToClipboard"
              type="primary"
              :loading="copyLoading">
              {{ copyLoading ? '复制中...' : '复制链接' }}
            </el-button>
          </el-input>
        </div>

        <div class="url-info">
          <p class="url-desc">
            <i class="el-icon-info"></i>
            将此链接分享给用户，用户通过此链接注册将成为您的下级会员
          </p>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-if="!promotionData && !loading">
        <i class="el-icon-warning-outline"></i>
        <p>暂无推广信息</p>
        <el-button @click="loadPromotionData" type="primary" plain>重新加载</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { promotionApi } from '@/api/agentApi'

export default {
  name: 'Promotion',
  data() {
    return {
      loading: false,
      copyLoading: false,
      promotionData: null
    }
  },

  created() {
    this.loadPromotionData()
  },

  methods: {
    /**
     * 加载推广数据
     */
    async loadPromotionData() {
      this.loading = true
      try {
        const response = await promotionApi({})

        if (response.code === 200) {
          this.promotionData = response.data
        } else {
          this.$message.error(response.msg || '获取推广信息失败')
          this.promotionData = null
        }
      } catch (error) {
        console.error('加载推广数据失败:', error)
        this.$message.error('网络错误，请稍后重试')
        this.promotionData = null
      } finally {
        this.loading = false
      }
    },

    /**
     * 复制推广链接到剪贴板
     */
    async copyToClipboard() {
      if (!this.promotionData || !this.promotionData.promotion_url) {
        this.$message.warning('暂无可复制的推广链接')
        return
      }

      this.copyLoading = true

      try {
        // 使用现代浏览器的Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(this.promotionData.promotion_url)
          this.$message.success('推广链接已复制到剪贴板')
        } else {
          // 降级方案：使用传统的execCommand方法
          this.fallbackCopyToClipboard(this.promotionData.promotion_url)
        }
      } catch (error) {
        console.error('复制失败:', error)
        this.$message.error('复制失败，请手动选择复制')
      } finally {
        this.copyLoading = false
      }
    },

    /**
     * 降级复制方案
     */
    fallbackCopyToClipboard(text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        const successful = document.execCommand('copy')
        if (successful) {
          this.$message.success('推广链接已复制到剪贴板')
        } else {
          this.$message.error('复制失败，请手动选择复制')
        }
      } catch (error) {
        this.$message.error('复制失败，请手动选择复制')
      }

      document.body.removeChild(textArea)
    }
  }
}
</script>

<style scoped>
.promotion-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header-card {
  margin-bottom: 20px;
}

.page-header {
  text-align: center;
}

.page-title {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.page-desc {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.content-card {
  max-width: 800px;
  margin: 0 auto;
}

.agent-info {
  margin-bottom: 20px;
}

.info-item {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.label {
  color: #606266;
  font-size: 14px;
  width: 80px;
  flex-shrink: 0;
}

.value {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.value.money {
  color: #67C23A;
  font-weight: 600;
  font-size: 15px;
}

.value.money.earnings {
  color: #E6A23C;
}

.value.highlight {
  color: #409EFF;
  font-weight: 600;
  font-size: 16px;
}

.section-title {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.url-container {
  margin-bottom: 12px;
}

.url-input {
  width: 100%;
}

.url-info {
  margin-top: 8px;
}

.url-desc {
  margin: 0;
  color: #909399;
  font-size: 13px;
  display: flex;
  align-items: center;
}

.url-desc i {
  margin-right: 6px;
  color: #409EFF;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #DCDFE6;
}

.empty-state p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .promotion-container {
    padding: 10px;
  }

  .agent-info .el-col {
    margin-bottom: 12px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .label {
    width: auto;
    margin-bottom: 4px;
  }
}
</style>
