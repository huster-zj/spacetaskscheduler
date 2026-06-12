<!--
 * @Author: Jerry
 * @Date: 2024-10-09 15:11:40
 * @LastEditors: Do not edit
 * @LastEditTime: 2026-02-24 15:15:44
 * @FilePath: \spacetaskscheduler\README.md
-->

# SpaceTaskScheduler - 航天器任务规划系统

## 项目简介

航天器任务规划系统是一个基于 Vue 3 + FastAPI 的航天器任务规划管理平台，用于处理空间站任务规划、资源调度等功能。

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3 + TypeScript |
| 构建工具 | Vite 5.3.1 |
| UI 组件 | Ant Design Vue 3.2.20 |
| 状态管理 | Pinia 2.2.4 |
| 后端框架 | FastAPI |
| 开发语言 | Python 3.9+ |

## Git 分支策略

```
main     → 稳定版本（冻结）
V2_main  → 开发主干
feature/* → 功能分支
fix/*    → Bug 修复分支
```

## 开发流程

采用 BMad V6 方法论，详见 [CLAUDE.md](CLAUDE.md)。

## 当前版本 (v1.0.0)

### 已实现功能

- [x] 基础任务管理
  - 任务创建、编辑、删除
  - 任务列表展示
  - 任务详情查看
- [x] 资源管理
  - 资源创建、编辑、删除
  - 资源列表展示
  - 资源详情查看
- [x] 算法管理
  - 最小弧段申请
  - 最大任务完成度

### 已知问题

- [ ] 首页配置页面
  - 文件信息存储为localStorage
  - 双击可以直接导入文件内容
- [ ] 甘特图
  - 资源甘特图
  - 任务甘特图
- [ ] 接口问题
  - 计算可行时间窗（输入和输出）
  - 算法接入（输入和输出）
- [ ] 表格中特定类型的字段设置
- [ ] 资源详情页中所属资源组

## 项目运行

### 前端 (Vue)

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 后端 (FastAPI)

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 启动服务器
uvicorn main:app --reload --host 0.0.0.0 --port 8000
uvicorn main:app --reload
```

### 部署相关

#### Linux/WSL 使用 GNU Screen（示例会话名：S-front / S-back）

```bash
screen -S S-front
cd frontend && npm run dev
# 运行后按 Ctrl+a 然后按 d 断开（服务继续在后台跑）

# 安装
# Ubuntu/Debian
sudo apt update && sudo apt install -y screen
# CentOS/RHEL
sudo yum install -y screen

# 卸载（如需）
# Ubuntu/Debian
sudo apt remove -y screen
# CentOS/RHEL
sudo yum remove -y screen

# 前端：后台启动并记录日志
screen -L -Logfile front.log -dmS S-front bash -lc 'cd astroscheduler.cn && npm run dev'

# 后端：后台启动并记录日志
screen -L -Logfile back.log -dmS S-back  bash -lc 'cd astroscheduler-backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload'

# 常用管理
screen -ls                      # 列出会话
screen -r S-front               # 重新连接
screen -S S-front -X quit       # 停止（删除）会话
# 交互进入后，Ctrl+a d 断开不停止；Ctrl+a H 开关日志

# 删除会话/清理
screen -S S-back -X quit        # 删除指定会话
screen -ls                      # 查看僵尸会话（Dead）
screen -wipe                    # 清理僵尸会话记录

# 强制删除所有 screen 进程（谨慎）
pkill screen
```

#### Linux 端口占用与进程管理

```bash
# 查看端口占用（任选其一）
ss -ltnp | grep 5173
netstat -tunlp | grep 5173
lsof -i:5173
fuser -v 5173/tcp

# 结束进程（把 PID 替换为上一步查到的）
kill -9 PID

# 或直接按端口杀进程
fuser -k 5173/tcp
```
#### Linux快捷键

```bash
终端复制/粘贴：Ctrl+Shift+C / Ctrl+Shift+V；中键粘贴；TTY 用 screen/tmux。
Bash 编辑/导航：Ctrl+A/E 行首尾，Alt+F/B 词移动，Ctrl+U/K 清行，Ctrl+R 历史搜索，Ctrl+L 清屏等。
历史命令：!!、!git、!$/!^ 等。
作业控制：Ctrl+C 中断；Ctrl+Z 挂起；jobs/fg/bg；disown/nohup 脱离会话。
Screen 快捷键：Ctrl+a d 断开不停止、Ctrl+a c 新窗口、Ctrl+a [ 复制模式、Ctrl+a H 日志、分屏与切换等。
```

## 下一版本计划 (v1.1.0)

### 功能增强

- [ ] 添加多种任务调度算法
- [ ] 接入ATK，实现预报文件配置调用接口
- [ ] 增加光照、升交点等资源，实现任务的资源需求接口

### 性能优化

- [ ] 优化数据缓存策略
- [ ] 改进约束检测算法效率

## 后续版本规划 (v2.0.0)

### 新特性开发

- [ ] 面向航天领域调度规划特定问题的大模型开发
  - 算例生成：根据真实的算例结合用户需求生成伪真实的算例
  - 冲突检测：运行算法之前，自动检测用户输入的信息是否有冲突
  - 冲突消解：算法结合大语言模型给出冲突消解建议，有可能给的建议不可行（看到的是局部的冲突），大语言模型理解问题并给出建议
  - 自然语言交互：用户不通过在系统中配置特定的字段来建模，而是通过自然语言交互由大模型自动生成模型
  - 调用工具：模型调用外部工具api，如cplex/copt等求解问题或生成甘特图等
- [ ] 多人协作功能
  - 实时编辑同步
  - 操作日志记录
  - 权限管理系统
- [ ] 多个窗口工作
  - 系统可以开多个页面多线程工作，同时处理多个项目需求
- [ ] docker部署
  - 降低用户使用门槛，部署在docker上

### 架构优化

- [ ] 飞控中心未来规划：定义模板或插件，在规划包中保存不同的文件，类似于文件流。用户根据自己的需求进行扩展算法、资源定义等，使用python进行编辑，甚至可以允许用户自己去写界面

## 技术栈

- 前端框架：Vue 3
- 状态管理：Pinia
- UI组件：Ant Design Vue
- 构建工具：Vite
- 开发语言：JavaScript/TypeScript
