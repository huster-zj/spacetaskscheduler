<template>
  <DocumentationPage
    title="关于"
    description="个人维护的航天任务规划与调度研究演示网站。"
  >
    <section class="about-intro">
      <p class="team-name">个人研究与实践记录</p>
      <p>本工具围绕航天器任务规划、测控资源配置与调度结果分析，提供从规划包创建到报告输出的一体化工作流程。</p>
    </section>

    <section>
      <h2>网站与研究实践</h2>
      <dl class="people-list">
        <div>
          <dt>网站维护</dt>
          <dd>本站由站主个人维护，用于记录参与的任务规划与调度研究实践，展示研究原型和示例数据。</dd>
        </div>
        <div>
          <dt>成果积累</dt>
          <dd>工具汇集了研究过程中的需求讨论、建模设计、算法实现与测试积累。本站按研究内容展示成果，不将共同研究成果表述为个人独立原创。</dd>
        </div>
        <div>
          <dt>使用范围</dt>
          <dd>面向个人学习和算例演示，不代表任何机构的官方网站。计算结果用于方法验证，不作为实际任务执行依据。</dd>
        </div>
      </dl>
    </section>

    <section>
      <h2>研究内容与成果</h2>
      <div class="mentor-grid">
        <article>
          <h3>任务与资源建模</h3>
          <p>将任务时间窗、持续时间、优先级与资源需求组织为规划数据，通过资源组和资源池生成候选测控弧段。</p>
        </article>
        <article>
          <h3>调度方法验证</h3>
          <p>结合启发式、COPT 求解器和分支定价切割实现，观察不同资源条件下的调度方案。</p>
        </article>
        <article>
          <h3>结果分析与复现</h3>
          <p>通过任务与资源时间线、分配明细和报告检查结果，使用规划包保存和复现算例。</p>
        </article>
      </div>
    </section>
  </DocumentationPage>
</template>

<script setup>
import DocumentationPage from '@/components/DocumentationPage.vue'

defineOptions({ name: 'PlanningAboutView' })
</script>

<style scoped>
.about-intro {
  padding-bottom: 24px;
  border-bottom: 1px solid var(--sts-border);
}

.team-name {
  margin: 0 0 8px;
  color: var(--sts-ink-primary) !important;
  font-size: 20px;
  font-weight: 600;
}

.people-list {
  display: grid;
  gap: 0;
  margin: 0;
  border-top: 1px solid var(--sts-border);
}

.people-list div {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr);
  gap: 18px;
  padding: 16px 4px;
  border-bottom: 1px solid var(--sts-border);
}

.people-list dt {
  color: var(--sts-ink-muted);
  font-weight: 600;
}

.people-list dd {
  margin: 0;
  color: var(--sts-ink-secondary);
  line-height: 1.8;
}

.people-list strong {
  color: var(--sts-ink-primary);
}

.mentor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
}

.mentor-grid article {
  padding-left: 16px;
  border-left: 3px solid var(--sts-primary);
}

.mentor-grid h3 {
  margin-top: 0;
}

.mentor-grid p {
  margin-bottom: 0;
}

@media (max-width: 767px) {
  .people-list div,
  .mentor-grid {
    grid-template-columns: 1fr;
  }

  .people-list div {
    gap: 4px;
  }
}
</style>
