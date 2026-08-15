<template>
  <DocumentationPage
    title="关于"
    description="面向航天任务规划与调度研究的原型工具。"
  >
    <section class="about-intro">
      <p class="team-name">华中科技大学管理系统工程研究中心祁超团队</p>
      <p>本工具围绕航天器任务规划、测控资源配置与调度结果分析，提供从规划包创建到报告输出的一体化工作流程。</p>
    </section>

    <section>
      <h2>项目团队</h2>
      <dl class="people-list">
        <div>
          <dt>开发</dt>
          <dd><strong>张建、蔡清林</strong>从项目启动到系统成型，全程参与产品设计、系统开发与测试完善。</dd>
        </div>
        <div>
          <dt>指导</dt>
          <dd>实验室博士后<strong>唐坚强</strong>以及<strong>祁超、张征</strong>为项目研究与开发提供指导。</dd>
        </div>
        <div>
          <dt>致谢</dt>
          <dd>实验室各位同仁在需求讨论、资料整理、系统测试等方面提供了帮助。</dd>
        </div>
      </dl>
    </section>

    <section>
      <h2>研究背景</h2>
      <div class="research-grid">
        <article>
          <h3>祁超</h3>
          <p>华中科技大学管理学院教授、博士生导师，主要研究复杂系统智能任务规划与调度优化方法。主持包括国家自然科学基金重点项目“面向复杂管理任务的智能规划：航天器任务规划”在内的多项科研项目。</p>
        </article>
        <article>
          <h3>张征</h3>
          <p>华中科技大学人工智能与自动化学院副教授，研究方向包括时空大数据分析与挖掘、智能运维以及自然交互技术，长期参与软件系统研发与科研项目。</p>
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

.research-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
}

.research-grid article {
  padding-left: 16px;
  border-left: 3px solid var(--sts-primary);
}

.research-grid h3 {
  margin-top: 0;
}

.research-grid p {
  margin-bottom: 0;
}

@media (max-width: 767px) {
  .people-list div,
  .research-grid {
    grid-template-columns: 1fr;
  }

  .people-list div {
    gap: 4px;
  }
}
</style>
