<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowRightOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import { DEFAULT_PASSWORD, DEFAULT_USERNAME, login, resolvePostLoginPath } from '@/services/auth'
import logoUrl from '@/assets/logo.jpg'

defineOptions({ name: 'SystemLogin' })

const route = useRoute()
const router = useRouter()
const username = ref('')
const password = ref('')
const passwordVisible = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''

  if (!login(username.value, password.value)) {
    errorMessage.value = '账号或密码错误，请检查后重新输入。'
    return
  }

  await router.replace(resolvePostLoginPath(route.query.redirect))
}
</script>

<template>
  <section class="login-page" aria-labelledby="login-title">
    <div class="login-shell">
      <aside class="login-identity">
        <img :src="logoUrl" alt="" class="login-identity__logo" />
        <div>
          <p class="login-identity__organization">华中科技大学管理系统工程研究中心</p>
          <h1>航天任务调度工具</h1>
          <p class="login-identity__summary">规划建模、可行时间窗计算与调度结果分析</p>
        </div>
        <div class="login-identity__status">
          <SafetyCertificateOutlined aria-hidden="true" />
          <span>系统访问验证</span>
        </div>
      </aside>

      <main class="login-panel">
        <header class="login-panel__header">
          <span class="login-panel__eyebrow">WELCOME</span>
          <h2 id="login-title">登录系统</h2>
          <p>请输入账号和密码进入工作台</p>
        </header>

        <form class="login-form" novalidate @submit.prevent="handleSubmit">
          <label class="login-field">
            <span>账号</span>
            <span class="login-input">
              <UserOutlined aria-hidden="true" />
              <input
                v-model="username"
                name="username"
                type="text"
                autocomplete="username"
                placeholder="请输入账号"
                required
                autofocus
                @input="errorMessage = ''"
              />
            </span>
          </label>

          <label class="login-field">
            <span>密码</span>
            <span class="login-input">
              <LockOutlined aria-hidden="true" />
              <input
                v-model="password"
                name="password"
                :type="passwordVisible ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="请输入密码"
                required
                @input="errorMessage = ''"
                @keydown.enter.prevent="handleSubmit"
              />
              <button
                class="password-toggle"
                type="button"
                :aria-label="passwordVisible ? '隐藏密码' : '显示密码'"
                :title="passwordVisible ? '隐藏密码' : '显示密码'"
                @click="passwordVisible = !passwordVisible"
              >
                <EyeInvisibleOutlined v-if="passwordVisible" aria-hidden="true" />
                <EyeOutlined v-else aria-hidden="true" />
              </button>
            </span>
          </label>

          <p v-if="errorMessage" class="login-error" role="alert">{{ errorMessage }}</p>

          <button class="login-submit" type="submit">
            <span>登录</span>
            <ArrowRightOutlined aria-hidden="true" />
          </button>
        </form>

        <section class="credential-hint" aria-labelledby="credential-title">
          <strong id="credential-title">默认体验账号</strong>
          <dl>
            <div>
              <dt>账号</dt>
              <dd>{{ DEFAULT_USERNAME }}</dd>
            </div>
            <div>
              <dt>密码</dt>
              <dd>{{ DEFAULT_PASSWORD }}</dd>
            </div>
          </dl>
          <p>当前为演示环境，请使用以上账号登录。</p>
        </section>
      </main>
    </div>
  </section>
</template>

<style scoped>
.login-page {
  display: grid;
  min-height: 100vh;
  padding: 32px;
  place-items: center;
  background:
    linear-gradient(90deg, rgba(23, 107, 135, 0.05) 1px, transparent 1px),
    linear-gradient(rgba(23, 107, 135, 0.05) 1px, transparent 1px),
    var(--sts-surface-base);
  background-size: 36px 36px;
}

.login-shell {
  display: grid;
  width: min(100%, 920px);
  min-height: 560px;
  grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
  overflow: hidden;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-lg);
  background: var(--sts-surface-raised);
  box-shadow: var(--sts-shadow-md);
}

.login-identity {
  display: flex;
  padding: 52px;
  justify-content: space-between;
  flex-direction: column;
  gap: 36px;
  background: #123947;
  color: #ffffff;
}

.login-identity__logo {
  width: 72px;
  height: 72px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: var(--sts-radius-lg);
  object-fit: cover;
}

.login-identity__organization {
  margin: 0 0 16px;
  color: #b9d8e1;
  font-size: 13px;
}

.login-identity h1 {
  max-width: 340px;
  margin: 0;
  color: #ffffff;
  font-size: 36px;
  font-weight: 650;
  line-height: 1.3;
  letter-spacing: 0;
}

.login-identity__summary {
  max-width: 360px;
  margin: 18px 0 0;
  color: #d5e6eb;
  font-size: 15px;
}

.login-identity__status {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #b9d8e1;
  font-size: 13px;
}

.login-panel {
  display: flex;
  padding: 52px 48px;
  justify-content: center;
  flex-direction: column;
}

.login-panel__header {
  margin-bottom: 28px;
}

.login-panel__eyebrow {
  color: var(--sts-primary);
  font-size: 12px;
  font-weight: 700;
}

.login-panel__header h2 {
  margin: 5px 0 4px;
  color: var(--sts-ink-primary);
  font-size: 26px;
  font-weight: 650;
  letter-spacing: 0;
}

.login-panel__header p,
.credential-hint p {
  margin: 0;
  color: var(--sts-ink-muted);
  font-size: 13px;
}

.login-form {
  display: grid;
  gap: 18px;
}

.login-field {
  display: grid;
  gap: 7px;
  color: var(--sts-ink-secondary);
  font-size: 13px;
  font-weight: 600;
}

.login-input {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border: 1px solid var(--sts-border-strong);
  border-radius: var(--sts-radius-md);
  background: #ffffff;
  color: var(--sts-ink-muted);
}

.login-input:focus-within {
  border-color: var(--sts-primary);
  box-shadow: 0 0 0 3px rgba(23, 107, 135, 0.14);
}

.login-input input {
  min-width: 0;
  height: 42px;
  flex: 1;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--sts-ink-primary);
}

.login-input input::placeholder {
  color: #96a5ae;
}

.password-toggle {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--sts-ink-muted);
  cursor: pointer;
}

.password-toggle:hover {
  color: var(--sts-primary);
}

.login-error {
  margin: -6px 0 0;
  color: var(--sts-danger);
  font-size: 13px;
}

.login-submit {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 0 18px;
  border: 1px solid var(--sts-primary);
  border-radius: var(--sts-radius-md);
  background: var(--sts-primary);
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
}

.login-submit:hover {
  border-color: var(--sts-primary-hover);
  background: var(--sts-primary-hover);
}

.credential-hint {
  margin-top: 26px;
  padding: 16px;
  border: 1px solid #c9dfe6;
  border-radius: var(--sts-radius-md);
  background: var(--sts-primary-soft);
}

.credential-hint strong {
  color: var(--sts-ink-primary);
  font-size: 13px;
}

.credential-hint dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 10px 0 6px;
  gap: 8px;
}

.credential-hint dl > div {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.credential-hint dt {
  color: var(--sts-ink-muted);
  font-size: 12px;
}

.credential-hint dd {
  margin: 0;
  color: var(--sts-primary-hover);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-weight: 700;
}

@media (max-width: 760px) {
  .login-page {
    padding: 16px;
    place-items: start center;
  }

  .login-shell {
    min-height: 0;
    grid-template-columns: 1fr;
  }

  .login-identity {
    padding: 26px 24px;
    gap: 22px;
  }

  .login-identity__logo {
    width: 56px;
    height: 56px;
  }

  .login-identity h1 {
    font-size: 28px;
  }

  .login-identity__status {
    display: none;
  }

  .login-panel {
    padding: 30px 24px;
  }
}

@media (max-width: 420px) {
  .login-page {
    padding: 0;
  }

  .login-shell {
    min-height: 100vh;
    border: 0;
    border-radius: 0;
  }

  .credential-hint dl {
    grid-template-columns: 1fr;
  }
}
</style>
