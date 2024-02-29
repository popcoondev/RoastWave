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
      <button @click="startWebSocket">Reload</button>
    </div>
  <!-- <BarChart :chartDataProp="chartData" /> -->
  <AreaChart :chartDataProp="chartData" />
  

  </div>
  <div class="tools">
    <!-- <serialport-control :serialStateProp="serialState" :serialPortListProp="serialPortList" :selectedPortProp="selectedPort" :startSerialPortProp="startSerialPort" /> -->
    <temperature-display :temperature="Number(ringBuffer[ringBuffer.length - 1]?.value)" />
    <roast-control :toggleRoastProp="toggleRoast" :roastStateProp="roastState" />    
    <roast-time :roastElapsedMillisProp="formatElapseTimeToString(roastElapsedMillis)" />
  </div>


</template>
  
<script>
  
  // import ControlView from '@/components/ControlView.vue';
  // import BarChart from '@/components/BarChart.vue';
  import AreaChart from '@/components/AreaChart.vue';
  import TemperatureDisplay from '../components/TemperatureDisplay.vue';
  import RoastControl from '../components/RoastControl.vue';
  import RoastTime from '../components/RoastTime.vue';
  // import SerialportControl from '../components/SerialportControl.vue';
  
  const ringBufferLength = 100;

  export default {
    components: {
      // ControlView,
      // BarChart,
      AreaChart,
      TemperatureDisplay,
      RoastControl,
      RoastTime,
      // SerialportControl
    },
    data() {
      return {
        chartData: this.initChartData(),
        webSocket: null,
        serialPortList: [],
        selectedPort: null,
        ringBuffer: [], // 温度データを常時保存するリングバッファ
        rorIndexMillis: null, // ROR計算の機転時間を保存
        rorIndexTemperature: null, // ROR計算の機転温度を保存
        roastElapsedMillis: null, // ロースト経過時間
        roastData: [], // ハゼのタイミングや温度などのデータを格納
        roastState: 'idle', // idle, roasting, cooling
        serialState: 'closed', // closed, opened
        roastStartMillis : null,
        roastEndMillis : null,
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
            
            
            this.addData(new Date().getTime(), data.data);
           } else if(data.type === 'serial_port_opened') {
            // シリアルポートを開いた場合の処理
            console.log('Serial port opened:', data);
            this.serialState = 'opened';
            // TODO: 今回接続したポートをキャッシし、次回の起動時に選択されるようにする


           } else if(data.type === 'serial_port_closed') {
            // シリアルポートを閉じた場合の処理
            console.log('Serial port closed:', data);
            this.serialState = 'closed';
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
        // データをリングバッファに追加
        this.ringBuffer.push({ time: time, value: value });

        // リングバッファの長さが100を超えたら先頭のデータを削除
        if(this.ringBuffer.length > ringBufferLength) {
          this.ringBuffer.shift();
        }

        // ロースト中の場合は、ローストデータとして追加
        // if(this.roastState === 'roasting') {
        //   this.addChartData(time, value);
        // }

      },
      initChartData() {
        return {
          labels: [],
          datasets: [
            {
              label: 'Temperature',
              data: [],
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              yAxisID: 'y1',
              type: 'line'
            },
            {
              label: 'ROR',
              data: [],
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              yAxisID: 'y2',
              type: 'line'
            }
          ]
        };
      },
      addChartData(time, value) {

        const newChartData = {
          labels: [ ...this.chartData.labels, time ],
          datasets: [
            {
              label: 'Temperature',
              data: [
                ...this.chartData.datasets[0].data, value
              ],
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              yAxisID: 'y1',
              type: 'line'
            },
            {
              label: 'ROR',
              data: [
                ...this.chartData.datasets[1].data, this.calcROR(value, 30)
              ],
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              yAxisID: 'y2',
              type: 'line'
            }
          ]

          // labels: [ ...this.chartData.labels, time ],
          // datasets: [
          //   {
          //     // 温度データの追加
          //     type: 'line',
          //     data: [ ...this.chartData.datasets[0].data, value ],
                
          //     yAxisID: 'y1'
          //   },
          //   {
          //     // RORデータの追加
          //     type: 'line',
          //     data: [ ...this.chartData.datasets[1].data, value ],
          //     yAxisID: 'y2'

          //   } 
          // ]
        };

        this.chartData = newChartData;
      },  
      startRoast() {
        // ロースト開始処理
        // ロースト状態として、グラフの初期化、データの初期化、データ蓄積開始
        
        // シリアルが開いていない場合はエラー
        if(this.serialState !== 'opened') {
          console.error('Serial port is not opened');
          return;
        }

        // グラフの初期化
        this.chartData = this.initChartData();

        // データの初期化
        this.roastData = [];
        this.roastState = 'roasting';
        
        // ROR計算の機転時間を保存
        this.roastEndMillis = null;
        this.roastStartMillis = new Date().getTime();
        this.webSocket.send(JSON.stringify({ type: 'start_roast' }));
        this.rorIndexMillis = this.roastStartMillis;
        this.rorIndexTemperature = this.ringBuffer[this.ringBuffer.length - 1].value;
        
        this.roastLoop = setInterval(() => {
          // ロースト中のデータを追加
          this.roastElapsedMillis = new Date().getTime() - this.roastStartMillis
          const currentTime = this.formatElapseTimeToString(this.roastElapsedMillis);
          const lastData = this.ringBuffer[this.ringBuffer.length - 1];
          if(lastData) {
            this.addChartData(currentTime, lastData.value);
          }
        }, 1000);


      },
      stopRoast() {
        // ロースト終了処理
        // ロースト状態として、データ蓄積停止        
        this.webSocket.send(JSON.stringify({ type: 'stop_roast' }));
        this.roastState = 'idle';
        this.roastEndMillis = new Date().getTime();
        clearInterval(this.roastLoop);

      },
      toggleRoast() {
        // ローストのトグル処理
        console.log('toggleRoast');
        if(this.roastState === 'roasting') {
          this.stopRoast();
        } else {
          this.startRoast();
        }
      },
      formatElapseTimeToString(elapsedMillis) {
        // 経過時間を文字列に変換
        // 12:34の場合のミリ秒は 12 * 60 * 1000 + 34 * 1000 = 754000
        const seconds = Math.floor(elapsedMillis / 1000); // 754000 -> 754 % 60 = 34
        const minutes = Math.floor(seconds / 60); // 754 -> 12 -> 12 % 60 = 12
        
        // 00:00の形式に変換
        return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
      },
      calcROR(value, seconds) {
        if(this.rorIndexMillis === null) {
          this.rorIndexMillis = new Date().getTime();
          return undefined;
        }
        if(this.rorIndexMillis - this.roastElapsedMillis > seconds * 1000) {
          const ror = value - this.rorIndexTemperature;
          this.rorIndexMillis = new Date().getTime();
          this.rorIndexTemperature = value;
          return ror;
        }
        else {
          return undefined;
        }
      }
    },
  };
</script>

<style>
  .home-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  .port-list {
    margin-bottom: 20px;
  }
  .current-data {
    font-size: 24px;
    margin-bottom: 20px;
    
    font-family: 'Noto Sans JP', sans-serif;
  }

  .tools {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
  }
</style>
