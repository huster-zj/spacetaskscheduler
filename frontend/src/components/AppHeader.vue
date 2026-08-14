<!--
 * @Author: Jerry
 * @Date: 2024-10-09 15:13:15
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-08-30 15:36:25
 * @FilePath: \spacetaskscheduler\src\components\AppHeader.vue
-->
<template>
  <div class="app-header">
    <div class="app-header__inner">
      <RouterLink to="/" class="brand" aria-label="航天任务调度工具工作台">
        <img src="../assets/logo.jpg" alt="" class="brand__logo" />
      </RouterLink>
      <div class="app-header__navigation">
        <slot />
      </div>
      <button class="download-button" type="button" aria-label="下载示例数据" title="下载示例数据" @click="handleDownload">
        <DownloadOutlined aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { message } from 'ant-design-vue'

// 处理下载测试数据
const handleDownload = async () => {
  try {
    message.loading('正在准备下载文件...', 0)
    
    console.log('开始请求下载接口...')
    const response = await fetch('http://127.0.0.1:8000/api/download_test_files', {
      method: 'GET',
      headers: {
        'Accept': 'application/octet-stream, application/zip'
      }
    })
    
    console.log('响应状态:', response.status)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    // 获取文件名
    const contentDisposition = response.headers.get('content-disposition')
    
    // 生成带日期后缀的文件名
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    const datePrefix = `${month}${day}${hour}${minute}`
    
    let filename = `测试数据${datePrefix}.zip`
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename=([^;]+)/)
      if (filenameMatch) {
        const originalName = filenameMatch[1].replace(/"/g, '')
        // 如果是zip文件，添加日期后缀
        if (originalName.endsWith('.zip')) {
          filename = `测试数据${datePrefix}.zip`
        } else {
          // 如果是单个文件，保持原名但添加日期后缀
          const nameParts = originalName.split('.')
          if (nameParts.length > 1) {
            const ext = nameParts.pop()
            const name = nameParts.join('.')
            filename = `${name}_${datePrefix}.${ext}`
          } else {
            filename = `${originalName}_${datePrefix}`
          }
        }
      }
    }
    
    console.log('准备下载文件:', filename)
    
    // 创建blob并下载
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    message.destroy()
    message.success('文件下载成功！')
  } catch (error) {
    message.destroy()
    console.error('下载失败详情:', error)
    
    // 提供更详细的错误信息
    if (error.message.includes('Failed to fetch')) {
      message.error('网络连接失败，请确保后端服务正在运行并检查CORS设置')
    } else {
      message.error(`下载失败: ${error.message}`)
    }
  }
}
</script>

<style scoped>
.app-header {
  background: var(--sts-surface-raised);
}

.app-header__inner {
  display: flex;
  width: 100%;
  min-height: 76px;
  padding: 0 12px;
  align-items: center;
  gap: 8px;
}

.brand {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  color: var(--sts-ink-primary);
}

.brand:hover {
  color: var(--sts-ink-primary);
}

.brand__logo {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-md);
  object-fit: cover;
}

.app-header__navigation {
  min-width: 0;
  flex: 1;
}

.download-button {
  display: inline-flex;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--sts-border-strong);
  border-radius: var(--sts-radius-md);
  background: var(--sts-surface-raised);
  color: var(--sts-ink-primary);
  cursor: pointer;
}

.download-button:hover {
  border-color: var(--sts-primary);
  background: var(--sts-primary-soft);
  color: var(--sts-primary-hover);
}

.download-button .anticon {
  display: inline-flex;
  color: currentColor;
  font-size: 16px;
}

.download-button .anticon :deep(svg) {
  width: 16px;
  height: 16px;
}

@media (max-width: 767px) {
  .app-header__inner {
    min-height: 68px;
    padding: 0 8px;
    gap: 6px;
  }

  .brand__logo {
    width: 40px;
    height: 40px;
    flex-basis: 40px;
  }

  .download-button {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
  }
}
</style>
