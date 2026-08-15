<template>
  <DocumentationPage
    title="帮助中心"
    description="从示例规划包开始，完成资源、任务、约束、调度与报告的完整流程。"
  >
    <section>
      <h2>快速开始</h2>
      <ol class="quick-start">
        <li><strong>获取算例：</strong>点击顶栏右侧下载图标，选择一个 2026 示例；选择多个时请先解压合集 ZIP。</li>
        <li><strong>打开规划包：</strong>点击“打开”并选择 `.sts` 文件，系统会恢复属性、资源、任务、约束与已有结果。</li>
        <li><strong>检查配置：</strong>按规划流程依次核对属性、资源、资源组、任务和约束。</li>
        <li><strong>运行调度：</strong>在“运行”页选择启发式算法。系统会先预处理当前数据，再启动算法。</li>
        <li><strong>查看结果：</strong>在主视图、调度结果和报告中检查任务安排、资源占用及冲突。</li>
      </ol>
    </section>

    <section>
      <h2>功能流程</h2>
      <p>规划包是一次任务规划工作的完整载体。保存或另存为后，可在首页历史文档中再次打开。</p>
      <figure class="workflow-figure">
        <img :src="workflowImage" alt="航天任务调度工具功能流程图" />
        <figcaption>从规划包创建到调度报告的完整操作流程</figcaption>
      </figure>
    </section>

    <section>
      <h2>模块说明</h2>
      <div class="module-guide">
        <details open>
          <summary>规划包与属性</summary>
          <p>“新建”会清空当前工作区；“打开”用于导入单个 `.sts`；“另存为”保存当前完整状态。属性页用于设置规划时间范围和任务、资源优先级规则。</p>
        </details>
        <details>
          <summary>资源与资源组</summary>
          <p>资源定义测控能力及可用时间窗。资源组用于表达一组可替代或联合使用的资源。时间窗必须落在规划包时间范围内。</p>
        </details>
        <details>
          <summary>任务与约束</summary>
          <p>任务包含执行窗口、持续时间和优先级。时态约束描述任务间的先后与间隔关系，逻辑约束用于组合任务规则。</p>
        </details>
        <details>
          <summary>运行、结果与报告</summary>
          <p>当前可直接使用基于优先级的启发式算法。运行成功后，主视图显示甘特图与日程，结果页显示分配状态，报告页汇总任务、资源、冲突和规划结论。</p>
        </details>
      </div>
    </section>

    <section>
      <h2>常见问题</h2>
      <dl class="faq-list">
        <div>
          <dt>打开合集 ZIP 时提示需要解压</dt>
          <dd>合集用于一次下载多个示例，不是规划包。解压后选择其中任意 `.sts` 文件打开。</dd>
        </div>
        <div>
          <dt>运行时提示网络连接失败</dt>
          <dd>预处理和启发式算法依赖本地后端服务。确认服务运行后重试，当前工作区数据不会因请求失败而丢失。</dd>
        </div>
        <div>
          <dt>结果页没有任务安排</dt>
          <dd>先确认规划包中存在任务和资源，再到运行页执行算法。若资源窗口不足，部分任务可能保持未分配状态。</dd>
        </div>
      </dl>
    </section>
  </DocumentationPage>
</template>

<script setup>
import DocumentationPage from '@/components/DocumentationPage.vue'
import workflowImage from '@/assets/help/planning-workflow.png'

defineOptions({ name: 'PlanningHelpView' })
</script>

<style scoped>
.quick-start {
  display: grid;
  gap: 6px;
}

.quick-start strong {
  color: var(--sts-ink-primary);
}

.workflow-figure {
  margin: 18px 0 0;
  text-align: center;
}

.workflow-figure img {
  display: block;
  width: min(100%, 820px);
  height: auto;
  margin: 0 auto;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-md);
  background: #ffffff;
}

.workflow-figure figcaption {
  margin-top: 8px;
  color: var(--sts-ink-muted);
  font-size: 12px;
}

.module-guide {
  border-top: 1px solid var(--sts-border);
}

.module-guide details {
  border-bottom: 1px solid var(--sts-border);
}

.module-guide summary {
  padding: 14px 4px;
  color: var(--sts-ink-primary);
  font-weight: 600;
  cursor: pointer;
}

.module-guide p {
  margin: -2px 4px 16px;
}

.faq-list {
  display: grid;
  gap: 16px;
  margin: 0;
}

.faq-list div {
  padding-left: 14px;
  border-left: 3px solid var(--sts-primary);
}

.faq-list dt {
  color: var(--sts-ink-primary);
  font-weight: 600;
}

.faq-list dd {
  margin: 4px 0 0;
  color: var(--sts-ink-secondary);
  line-height: 1.8;
}
</style>
