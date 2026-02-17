<script setup>
import { ref } from 'vue';
import { Button, Card } from '@finggu/vue';
import '@finggu/core/tokens.css';

const mode = ref('dev');
const theme = ref('light');

const mapping = {
  'ff-btn': 'ff-vz1',
  'ff-btn-primary': 'ff-vp1',
  'ff-card': 'ff-vc1'
};
</script>

<template>
  <FingguProvider 
    :mapping="mode === 'ext' ? mapping : null" 
    :mode="mode" 
    :theme="theme"
    version="0.9.0"
  >
    <div style="padding: 2rem;">
      <Card padding="lg" variant="default">
        <h1>Vue Minimal Example</h1>
        <p>Current Mode: <strong>{{ mode }}</strong> | Theme: <strong>{{ theme }}</strong></p>
        
        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
          <Button variant="primary" @click="mode = mode === 'dev' ? 'ext' : 'dev'">
            Toggle Mode
          </Button>
          <Button variant="secondary" @click="theme = theme === 'light' ? 'dark' : 'light'">
            Toggle Theme
          </Button>
        </div>
      </Card>
    </div>
  </FingguProvider>
</template>
