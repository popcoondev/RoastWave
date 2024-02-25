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
  import 'chartjs-adapter-date-fns'
  import 'chartjs-adapter-moment'
  
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
                    y1: {
                            min: 0, // Y軸の最小値
                            max: 300, // Y軸の最大値を230度に設定
                            title: {
                            display: true,
                            text: 'Temperature (°C)'
                            },
                            position: 'left',
                            
                            
                        },
                    y2: {
                            min: -20,
                            max: 20, 
                            title: {
                            display: true,
                            text: 'Delta (°C)'
                            },
                            // ticks: {
                            //     stepSize: 5
                            // },
                            position: 'right',
                            beginAtZero: true,
                        },
                    x: {
                        // id: 'x1',
                        // type: 'time', // X軸のタイプをtimeに設定
                        // max: //開始時刻から30分後の時刻を設定
                        // new Date(new Date().getTime() + 30 * 60 * 1000),
                        title: {
                            display: true,
                            text: 'Time (secounds)'
                        },
                        // time: {
                        //     unit: 'second', // X軸の単位を秒に設定
                        //     displayFormats: {
                        //         second: 'mm:ss', // X軸の表示フォーマットを「分:秒」に設定
                        //         // beginAtZero: true
                        //     }
                        // },
                    }

                },
                plugins: {
                    legend: {
                        display: true, // 凡例を表示
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Roast curve'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    },
                    filler: {
                        propagate: true
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