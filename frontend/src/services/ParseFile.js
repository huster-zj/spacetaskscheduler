export async function parsePreprocessFiles() {
  try {
    // 获取连续和非连续跟踪的数据
    const continuousResponse = await fetch('/interface/preprocess_output/连续跟踪飞控事件JSON处理结果/连续跟踪遥控事件预处理备选弧段.json');
    const nonContinuousResponse = await fetch('/interface/preprocess_output/非连续跟踪飞控事件JSON处理结果/非连续跟踪遥控事件预处理备选弧段.json');
    
    const continuousData = await continuousResponse.json();
    const nonContinuousData = await nonContinuousResponse.json();
    
    // 合并数据并处理 cekong_resource
    const combinedData = [...continuousData, ...nonContinuousData].map(item => ({
      task_name: item.task_name,
      tracking_plan_id: item.tracking_plan_id,
      start_time: item.start_time.toString(),
      end_time: item.end_time.toString(),
      duration: item.duration.toString(),
      task_to_craft: item.task_to_craft,
      // 将测控资源数组转换为字符串
      cekong_resource: item.cekong_resource
        .map(resource => resource.cekong_resource_id)
        .join(', ')
    }));

    return combinedData;
    
  } catch (error) {
    console.error('加载预处理文件失败:', error);
    return [];
  }
}

export async function parseOutputFile() {
  try {
    const response = await fetch('/interface/algorithm_output/output.txt');
    const buffer = await response.arrayBuffer();
    // 使用 GB2312 编码解码文本内容
    const decoder = new TextDecoder('gb2312');
    const content = decoder.decode(buffer);
    return parseOutputContent(content);
  } catch (error) {
    console.error('加载output.txt失败:', error);
    return [];
  }
}

export function parseOutputContent(content) {
  try {
    // 按行分割内容
    const lines = content.split('\n');
    
    // 提取使用的弧段总数
    const totalArcsLine = lines.find(line => line.includes('使用的弧段总数'));
    const totalArcs = totalArcsLine ? parseInt(totalArcsLine.split('：')[1]) : 0;
    
    // 直接跳过前3行，获取数据行（去掉空行和最后的统计信息）
    const dataLines = lines.slice(3).filter(line => {
      const trimmedLine = line.trim();
      return trimmedLine && !trimmedLine.includes('使用的弧段总数') && trimmedLine.includes('|');
    });

    // 解析每一行数据
    const parsedData = dataLines.map(line => {
      const parts = line.split('|').map(part => part.trim());
      
      if (parts.length < 5) {
        console.warn('数据行格式不正确:', line);
        return null;
      }

      return {
        id: parts[0],
        status: parts[1],
        startTime: parts[2],
        endTime: parts[3],
        arcId: parts[4],
      };
    }).filter(item => item !== null);

    return {
      data: parsedData,
      totalArcs: totalArcs,
    };
  } catch (error) {
    console.error('解析output.txt内容失败:', error);
    return {
      data: [],
      totalArcs: 0,
    };
  }
}

