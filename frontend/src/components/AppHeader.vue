<!--
 * @Author: Jerry
 * @Date: 2024-10-09 15:13:15
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-08-30 15:36:25
 * @FilePath: \spacetaskscheduler\src\components\AppHeader.vue
-->
<template>
  <div class="header">
    <span class="logo">
      <RouterLink to="/">
        <img src="../assets/logo.jpg" alt="无法正常显示" />
        <!-- <img src="" alt="无法正常显示" /> -->
        <span class="name">Spacecraft Task Scheduler</span>
      </RouterLink>
    </span>
    <span class="download" @click="handleDownload">
      <img src="../assets/download.png" title="示例数据下载" class="download-icon" />
    </span>
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
.header {
  display: flex;
  /* margin: 0 20px; */
  border: 2px solid #dbdada;
  margin-top: 3px;
  margin-bottom: 3px;
  /* flex-direction: column; */
  justify-content: space-between;
  /* background-color: pink; */
}

.header .logo {
  display: flex;
  height: 60px;
  width: 1000px;
  position: relative;
  margin-left: 20px;
  align-items: center;
  padding-left: 10px;
  /* background-color: green; */
}

.header .logo img {
  position: absolute;
  top: 50%;
  left: 0%;
  transform: translate(0%, -50%);
  width: 50px;
  /* height: 50px; */
}

.header .logo .name {
  position: absolute;
  top: 50%;
  left: 20%;
  transform: translate(-50%, -50%);
  font-size: 20px;
  font-weight: bold;
  /* margin-left: 60px; */
  color: #333333;
}

.header .download {
  display: flex;
  height: 60px;
  width: 100px;
  position: relative;
  margin-right: 1px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  /* 移除背景色 */
}

/* 新增下载图标样式 */
.download-icon {
  width: 50px;
  height: 50px;
  transition: transform 0.2s ease;
}

/* 添加悬停效果 */
.header .download:hover .download-icon {
  transform: scale(1.1);
}
</style>
