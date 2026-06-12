"""
功能：从接口目录读取预处理结果，输出到output目录
"""
import os
import subprocess
import argparse

def main():
    parser = argparse.ArgumentParser(description='JAR调用工具')
    # JAR路径
    parser.add_argument('--jar_path', required=True, help='JAR文件路径')
    # 接口目录参数
    parser.add_argument('--interface_dir', required=True, help='接口目录路径（包含taskDetail.json等文件）')
    # 最终输出目录
    parser.add_argument('--output', required=True, help='最终结果输出目录')
    args = parser.parse_args()

    # 构建JAR参数
    jar_args = [
        os.path.join(args.interface_dir, "taskDetail.json"),
        os.path.join(args.interface_dir, "测控资源.json"),
        os.path.join(args.interface_dir, "非连续跟踪飞控事件JSON处理结果", "非连续跟踪遥控事件预处理备选弧段.json"),
        os.path.join(args.interface_dir, "连续跟踪飞控事件JSON处理结果", "连续跟踪遥控事件预处理备选弧段.json"),
        args.output  # 最终输出目录
    ]

    # 确保输出目录存在
    os.makedirs(args.output, exist_ok=True)

    # 执行JAR
    run_jar(args.jar_path, jar_args)

def run_jar(jar_path, args, java_opts=None):
    """执行JAR文件"""
    java_cmd = ["java"]
    if java_opts:
        java_cmd.extend(java_opts)
    java_cmd.extend(["-jar", jar_path])
    java_cmd.extend(args)

    try:
        result = subprocess.run(
            java_cmd,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        print("JAR输出:\n", result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print("执行失败:", e.stderr)
        return False

if __name__ == "__main__":
    main()