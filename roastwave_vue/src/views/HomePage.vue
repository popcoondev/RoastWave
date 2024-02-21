<template>
  <div class="home-page">
    <!-- <ControlView @start="startWebSocket" @stop="stopWebSocket" />
    <button @click="addData(Math.round(Math.random() * 100),2)">Add Data</button> -->
    <div class="port-list">
      <!-- シリアルポートをプルダウンで選択 -->
      <select v-model="selectedPort"
        @change="startSerialPort">
        <option v-for="port in serialPortList" :key="port" :value="port">{{ port }}</option>
      </select>      
    </div>
  <!-- <BarChart :chartDataProp="chartData" /> -->
  <div class="current-data">{{ chartData.datasets[0].data[chartData.datasets[0].data.length - 1] }}</div>
  <AreaChart :chartDataProp="chartData" />

    <!-- <ul>
      <li v-for="data in chartData.datasets[0].data" :key="data">{{ data }}</li>
    </ul> -->
  </div>
</template>
  
<script>
  
  // import ControlView from '@/components/ControlView.vue';
  // import BarChart from '@/components/BarChart.vue';
  import AreaChart from '@/components/AreaChart.vue';
  
  export default {
    components: {
      // ControlView,
      // BarChart,
      AreaChart
    },
    data() {
      return {
        chartData: {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: 'rgba(255, 99, 132, 0.2)', // 背景色（透明度を持たせる）
              borderColor: 'rgba(255, 99, 132, 1)', // 線の色
              pointBackgroundColor: '',
              borderWidth: 2,
              pointBorderColor: '#249EBF',
              pointRadius: 0,
              fill: true, 
            }
          ]
        },
        webSocket: null,
        serialPortList: [],
        selectedPort: null
      };
    },
    created() {
      this.startWebSocket();
    },
    methods: {
      startWebSocket() {
        this.webSocket = new WebSocket('ws://localhost:8080');
        this.webSocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('WebSocket message:', data);

          // イベントtype別で処理を分岐
          if(data.type === 'serial_port_list') {
            // シリアルポートリストを受信した場合の処理
            // console.log('Serial port list:', data);            
            this.serialPortList = data.data.map(port => port.path);
            
          } else if(data.type === 'serial_port_data') {
            // シリアルデータを受信した場合の処理
            // chartData: {
            //   labels: [ '1', '2', '3' ],
            //   datasets: [ { data: [40, 20, 12] } ]
            // },
            
            
            this.addData(new Date().toLocaleTimeString(), data.data);
           } 

    
        };
        this.webSocket.onopen = () => {
          console.log('WebSocket connected');
          // ポートリスト取得のためのコマンドを送信
          this.webSocket.send(JSON.stringify({ type: 'get_serial_port' }));
        };
        this.webSocket.onclose = () => {
          console.log('WebSocket closed');
          this.webSocket.send(JSON.stringify({ type: 'close_serial_port' }));
          this.webSocket.close();
          this.webSocket = null;
        };
        this.webSocket.onerror = (error) => {
          console.error('WebSocket Error:', error);
        };
      },
      stopWebSocket() {
        if (this.webSocket) {
          this.webSocket.close();
          this.webSocket = null;
          
        }
      },
      startSerialPort() {
        // シリアルポートを開く処理
        this.webSocket.send(JSON.stringify({ type: 'open_serial_port', port: this.selectedPort }));
        
      },
      addData(time, value) {
        const newChartData = {
          labels: [ ...this.chartData.labels, this.chartData.labels.length + 1],
          datasets: [
            {
              data: [
                ...this.chartData.datasets[0].data,
                value
              ]
            }
          ] 
        };

        this.chartData = newChartData;

      } 
    }
  };
</script>

<style>
  .home-page {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .port-list {
    margin-bottom: 20px;
  }
  .current-data {
    font-size: 24px;
    margin-bottom: 20px;
    
    font-family: 'Noto Sans JP', sans-serif;
  }
</style>