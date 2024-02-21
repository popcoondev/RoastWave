<template>
    <div>
        <Line
          id="my-chart-id"
          :options="chartOptions"
          :data="chartData"
        />
    </div>
</template>
  
<script>
  import { Line } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js'
  
  ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale)
  
  export default {
    name: 'AreaChart',
    components: { Line },
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
                responsive: true,
                //maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 0, // Y軸の最小値
                        max: 230, // Y軸の最大値を230度に設定
                        title: {
                        display: true,
                        text: 'Temperature (°C)'
                        }
                    },
                    x: {
                        max: 900, // X軸の設定はChart.jsのバージョンや種類によって異なる場合があります
                        title: {
                        display: true,
                        text: 'Time (secounds)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false, // 凡例を表示
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Roast curve'
                    }
                }
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

<style>
#my-chart-id {
    min-width: 80%;
    min-height: 600px;
}
</style>