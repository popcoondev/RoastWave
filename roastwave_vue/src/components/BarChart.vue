<template>
    <Bar
      id="my-chart-id"
      :options="chartOptions"
      :data="chartData"
    />
</template>
  
<script>
  import { Bar } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
  
  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)
  
  export default {
    name: 'BarChart',
    components: { Bar },
    props: {
        // 親コンポーネントから渡されるデータを受け取るprops
        chartDataProp: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            chartOptions: {
                responsive: true
            },
            chartData: this.chartDataProp // 初期データとしてpropsを使用
        }
    },
    watch: {
        chartDataProp: {
            handler(newData) {
                this.chartData = newData;
            },
            deep: true
        }

    },
    mounted() {
      this.initChart(); // グラフの初期化メソッド
    },
    methods: {
        initChart() {
            // グラフの初期化ロジック
            console.log('initChart');
        }
    }
}
</script>