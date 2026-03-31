<template>
  <div class="login-wrapper">
    <div class="login-left">
      <div class="login-brand">
        <div class="login-logo">
          <span class="material-symbols-outlined ms-filled" style="font-size: 1.5rem;">inventory_2</span>
        </div>
        <span class="brand-text">PT Sedjahtera Boga Kreasi</span>
      </div>
      
      <div class="login-content">
        <h1>Welcome Back.</h1>
        <p>Login to <b>Outlet Maintenance System V3.0</b> to manage ticketing, procurement, and outlet databases.</p>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label class="form-label">Username</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined icon">person</span>
              <input type="text" v-model="username" class="form-input with-icon" placeholder="Enter username" required />
            </div>
          </div>
          
          <div class="form-group" style="margin-top: 1.25rem;">
            <label class="form-label">Password</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined icon">lock</span>
              <input type="password" v-model="password" class="form-input with-icon" placeholder="Enter password" required />
            </div>
          </div>
          
          <div class="error-msg" v-if="error">{{ error }}</div>
          
          <button type="submit" class="btn-primary login-btn">
            Login to Dashboard
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
        </form>
      </div>
      
      <div class="login-footer">
        &copy; 2026 PT Sedjahtera Boga Kreasi.<br />
        Created by Business Development Team.
      </div>
    </div>
    
    <div class="login-right">
      <div class="abstract-dashboard">
        <!-- Decoration background elements -->
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        
        <!-- Abstract Dashboard UI -->
        <div class="mock-ui">
          <div class="mock-sidebar">
            <div class="mock-nav-item active"></div>
            <div class="mock-nav-item"></div>
            <div class="mock-nav-item"></div>
            <div class="mock-nav-item"></div>
          </div>
          <div class="mock-main">
            <div class="mock-header">
              <div class="mock-title"></div>
              <div class="mock-avatar"></div>
            </div>
            <div class="mock-kpi-grid">
              <div class="mock-kpi-card" v-for="i in 3" :key="i">
                <div class="mock-circle"></div>
                <div class="mock-lines">
                  <div class="line short"></div>
                  <div class="line"></div>
                </div>
              </div>
            </div>
            <div class="mock-table">
              <div class="mock-row header"></div>
              <div class="mock-row" v-for="i in 4" :key="i+10">
                <div class="mock-cell w-20"></div>
                <div class="mock-cell w-40"></div>
                <div class="mock-cell w-30"></div>
                <div class="mock-cell badge"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')

function handleLogin() {
  if (username.value === 'adminbizdev' && password.value === 'sedjahtera2026') {
    localStorage.setItem('oms_auth_token', 'sedjahtera2026')
    router.push('/')
  } else {
    error.value = 'Invalid username or password.'
  }
}
</script>

<style scoped>
.login-wrapper {
  display: flex;
  min-height: 100vh;
  background: var(--color-surface-container-lowest);
}

.login-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2.5rem;
  max-width: 500px;
  background: var(--color-surface-container-lowest);
  z-index: 10;
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 0.875rem;
  color: var(--color-on-surface);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.login-logo {
  width: 40px;
  height: 40px;
  border-radius: 0.625rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.login-content {
  margin: auto 0;
  padding-bottom: 2rem;
}

.login-content h1 {
  font-size: 2.5rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: var(--color-on-surface);
  margin-bottom: 0.5rem;
  line-height: 1.1;
}

.login-content p {
  color: var(--color-on-surface-variant);
  font-size: 0.9375rem;
  line-height: 1.5;
  margin-bottom: 2.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper .icon {
  position: absolute;
  left: 1rem;
  color: var(--color-on-surface-variant);
  font-size: 1.25rem;
  pointer-events: none;
}

.with-icon {
  padding-left: 3rem !important;
  height: 3rem;
  font-size: 1rem;
  border-radius: 0.75rem;
  background: var(--color-surface-container);
  border: 1px solid rgba(171,173,175, 0.1);
  transition: all 0.2s ease;
}

.with-icon:focus {
  background: var(--color-surface-container-lowest);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(0,87,190, 0.1);
}

.login-btn {
  margin-top: 2rem;
  height: 3.25rem;
  font-size: 1rem;
  border-radius: 0.75rem;
  width: 100%;
  justify-content: space-between;
  padding: 0 1.5rem;
}

.error-msg {
  color: var(--color-error);
  font-size: 0.8125rem;
  margin-top: 0.75rem;
  padding: 0.625rem 1rem;
  background: rgba(179,27,37,0.1);
  border-radius: 0.5rem;
  font-weight: 600;
}

.login-footer {
  font-size: 0.75rem;
  color: var(--color-on-surface-variant);
  line-height: 1.5;
}

/* Right Side - Abstract Dashboard */
.login-right {
  flex: 1.2;
  background: var(--color-surface-container-low);
  position: relative;
  display: none;
  overflow: hidden;
  border-left: 1px solid rgba(171,173,175,0.1);
}

@media (min-width: 900px) {
  .login-right { display: block; }
}

.abstract-dashboard {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  z-index: 1;
  animation: float 10s ease-in-out infinite alternate;
}

.blob-1 {
  width: 400px;
  height: 400px;
  background: rgba(0,87,190, 0.3);
  top: 10%;
  left: 20%;
}

.blob-2 {
  width: 350px;
  height: 350px;
  background: rgba(106,55,212, 0.3);
  bottom: 10%;
  right: 15%;
  animation-delay: -5s;
}

@keyframes float {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(30px) scale(1.05); }
}

.mock-ui {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 650px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transform: perspective(1000px) rotateY(-8deg) rotateX(4deg) translateZ(0);
  transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
  display: flex;
  overflow: hidden;
  min-height: 400px;
}

.mock-ui:hover {
  transform: perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0);
}

.mock-sidebar {
  width: 80px;
  background: rgba(0,0,0,0.2);
  border-right: 1px solid rgba(255,255,255,0.03);
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mock-nav-item {
  height: 12px;
  border-radius: 4px;
  background: rgba(255,255,255,0.1);
}

.mock-nav-item.active {
  background: var(--color-primary);
  opacity: 0.8;
}

.mock-main {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.mock-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.mock-title {
  width: 120px;
  height: 24px;
  background: var(--color-surface-container);
  border-radius: 4px;
}

.mock-avatar {
  width: 36px;
  height: 36px;
  background: var(--color-surface-container);
  border-radius: 50%;
}

.mock-kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.mock-kpi-card {
  background: rgba(0,0,0,0.15);
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255,255,255,0.03);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mock-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 4px solid rgba(255,255,255,0.1);
  border-top-color: var(--color-primary);
}

.mock-lines { flex: 1; }
.mock-lines .line { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-bottom: 6px; }
.mock-lines .line.short { width: 60%; background: rgba(255,255,255,0.2); }

.mock-table {
  background: rgba(0,0,0,0.15);
  border-radius: 0.75rem;
  border: 1px solid rgba(255,255,255,0.03);
  overflow: hidden;
  flex: 1;
}

.mock-row {
  height: 40px;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  display: flex;
  align-items: center;
  padding: 0 1rem;
  gap: 1rem;
}

.mock-row.header {
  background: rgba(255,255,255,0.02);
  height: 36px;
}

.mock-cell {
  height: 8px;
  background: rgba(255,255,255,0.08);
  border-radius: 4px;
}

.mock-cell.w-20 { width: 20%; }
.mock-cell.w-30 { width: 30%; }
.mock-cell.w-40 { width: 40%; }
.mock-cell.badge { width: 40px; height: 16px; border-radius: 8px; background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.3); }

.hero-text {
  position: absolute;
  z-index: 3;
  bottom: 8%;
  left: 8%;
  pointer-events: none;
}

.hero-text h2 {
  font-family: var(--font-family-mono);
  font-size: 2.25rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
  text-shadow: 0 4px 16px rgba(0,0,0,0.6);
  line-height: 1.2;
}

.hero-text p {
  font-size: 1.125rem;
  color: rgba(255,255,255,0.85);
  font-weight: 500;
  text-shadow: 0 2px 8px rgba(0,0,0,0.6);
}
</style>
