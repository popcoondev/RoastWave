<template>
    <div class="control-view">
      <button @click="startWebSocket">Start WebSocket</button>
      <button @click="stopWebSocket">Stop WebSocket</button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ControlView',
    methods: {
      startWebSocket() {
        this.$emit('start'); // 親コンポーネントに開始イベントを通知
      },
      stopWebSocket() {
        this.$emit('stop'); // 親コンポーネントに停止イベントを通知
      }
    }
  }
  </script>
  
  <style scoped>
  .control-view {
    display: flex;
    justify-content: center;
    gap: 20px; /* ボタン間のスペース */
  }
  </style>
  