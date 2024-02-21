<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
  
  <HomePage />
</template>

<script>
//import HelloWorld from './components/HelloWorld.vue'
import HomePage from './views/HomePage.vue'

export default {
  name: 'App',
  components: {
    HomePage,
    // BarChart
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
