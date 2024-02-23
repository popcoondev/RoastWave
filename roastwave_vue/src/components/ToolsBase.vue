<template>
    <div class="tools-base">
      <slot></slot>
    </div>
</template>
  
<script>
// デザイン
// ミニマリズムデザインでのデザイン
// ガラスのような透明感と光沢感を持たせる
// 角はつるつるに丸くする

  export default {
    name: 'ToolsBase'
  }
  </script>
  
  <style>
  .tools-base {
    width: 200px; /* 固定幅 */
    height: 160px; /* 固定高さ */
    border-radius: 10%; /* 角を丸くする */
    background-color: rgba(255, 255, 255, 0.5); /* 背景色を半透明にする */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* 影をつける */
    display: flex;
    justify-content: center;
    align-items: center;
    
  }
</style>
  