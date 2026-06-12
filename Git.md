# Git常用操作

## 拉取项目

1. 添加更改到暂存区
   git add .
2. 提交更改
   git commit -m "你的提交信息"
3. 拉取远程更改并合并
   git pull origin master
   git push -u origin master
4. git show e4f8a6f29587ee24ae8907f40a44d70106b807b7:main.py

## 常用命令解释

1. git init
   初始化一个全新的 Git 存储库并开始跟踪现有目录。
   它在现有目录中添加一个隐藏的子文件夹，该子文件夹包含版本控制所需的内部数据结构。
2. git clone
   创建远程已存在的项目的本地副本。
   克隆包括项目的所有文件、历史记录和分支。
3. git add
   暂存更改。
   Git 跟踪对开发人员代码库的更改，但有必要暂存更改并拍摄更改的快照，以将其包含在项目的历史记录中。
   此命令执行暂存，即该两步过程的第一部分。
   暂存的任何更改都将成为下一个快照的一部分，并成为项目历史记录的一部分。
   通过单独暂存和提交，开发人员可以完全控制其项目的历史记录，而无需更改其编码和工作方式。
4. git commit
   将快照保存到项目历史记录中并完成更改跟踪过程。
   简言之，提交就像拍照一样。
   任何使用 git add 暂存的内容都将成为使用 git commit 的快照的一部分。
5. git merge
   将开发线合并在一起。 此命令通常用于合并在两个不同分支上所做的更改。
   例如，当开发人员想要将功能分支中的更改合并到主分支以进行部署时，他们会合并。
6. git pull
   使用远程对应项的更新来更新本地开发线。
   如果队友已向远程上的分支进行了提交，并且他们希望将这些更改反映到其本地环境中，则开发人员将使用此命令。
7. git push
   使用本地对分支所做的任何提交来更新远程存储库。


# Conda

## 环境管理

```bash
# 创建新环境
conda create --name myenv python=3.8

# 激活环境
conda activate myenv

# 退出环境
conda deactivate

# 删除环境
conda remove --name myenv --all

# 列出所有环境
conda env list
```

## 包管理

```bash
# 安装包
conda install package_name

# 安装特定版本
conda install package_name=1.2.3

# 从指定通道安装
conda install -c conda-forge package_name

# 更新包
conda update package_name

# 删除包
conda remove package_name

# 列出已安装的包
conda list
```

## 环境配置

```bash
# 添加镜像源
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main/

# 设置搜索时显示通道地址
conda config --set show_channel_urls yes

# 查看当前配置
conda config --show

# 导出环境
conda env export > environment.yml

# 从配置文件创建环境
conda env create -f environment.yml
```

## 常见问题解决

```bash
# 清理缓存
conda clean --all

# 更新 conda 自身
conda update conda

# 重置配置文件
conda config --reset

# 验证环境完整性
conda verify
```

## 最佳实践

1. 为每个项目创建独立环境
2. 使用 environment.yml 管理依赖
3. 定期更新环境
4. 使用国内镜像加速下载