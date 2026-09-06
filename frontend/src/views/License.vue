<template>
  <DocumentationPage title="使用与许可说明" description="个人研究演示网站的软件使用说明。">
    <section class="license-summary">
      <h2>MIT License</h2>
      <p>项目软件的完整许可及原始版权声明保存在源码根目录的 LICENSE 文件中。本页为许可摘要，不替代完整许可证，也不改变既有成果的权利归属。</p>
      <p>在保留版权声明和许可声明的前提下，可使用、复制、修改、合并、发布、分发、再许可及销售本软件副本。</p>
      <div class="license-points" aria-label="许可证摘要">
        <div><strong>允许使用</strong><span>可复制、修改和分发本软件。</span></div>
        <div><strong>保留声明</strong><span>发布副本时须保留版权和许可声明。</span></div>
        <div><strong>不提供担保</strong><span>软件按现状提供，使用风险由使用者承担。</span></div>
      </div>
    </section>

    <section>
      <h2>第三方组件</h2>
      <p>第三方组件及优化求解器适用各自的许可证与授权条件，项目软件许可不授予这些组件的额外使用权。复制、分发或用于其他场景前，应分别核对相应授权。</p>
    </section>
    <section>
      <h2>演示使用范围</h2>
      <p>本站用于个人学习、研究记录与算例演示。示例数据和调度结果用于方法验证，不作为实际任务执行依据。网站维护主体不等同于全部研究成果的著作权人。</p>
    </section>
  </DocumentationPage>
</template>

<script setup>
import DocumentationPage from '@/components/DocumentationPage.vue'

defineOptions({ name: 'PlanningLicenseView' })
</script>

<style scoped>
.license-summary p {
  max-width: 820px;
}

.license-points {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.license-points div {
  display: grid;
  gap: 4px;
  padding: 14px;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-md);
  background: var(--sts-surface-subtle);
}

.license-points strong {
  color: var(--sts-ink-primary);
}

.license-points span {
  color: var(--sts-ink-secondary);
  font-size: 13px;
}

@media (max-width: 767px) {
  .license-points {
    grid-template-columns: 1fr;
  }
}
</style>
