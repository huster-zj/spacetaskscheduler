<template>
  <DocumentationPage title="许可证" description="本项目采用 MIT License。">
    <section class="license-summary">
      <h2>MIT License</h2>
      <p>Copyright (c) 2026 华中科技大学管理系统工程研究中心祁超团队</p>
      <p>在保留版权声明和许可声明的前提下，可使用、复制、修改、合并、发布、分发、再许可及销售本软件副本。</p>
    </section>

    <section>
      <h2>许可原文</h2>
      <pre class="license-text">MIT License

Copyright (c) 2026 QI Chao's Team, Research Center for Management Systems Engineering, Huazhong University of Science and Technology

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.</pre>
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

.license-text {
  overflow-x: auto;
  margin: 0;
  padding: 20px;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-md);
  background: var(--sts-surface-subtle);
  color: var(--sts-ink-secondary);
  font-family: Consolas, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
