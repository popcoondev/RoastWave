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
    <temperature-display :temperature="ringBuffer[ringBuffer.length - 1]?.value" />
    <roast-control :toggleRoastProp="toggleRoast" :roastStateProp="roastState" />    
  </div>


</template>
  
<script>
  
  // import ControlView from '@/components/ControlView.vue';
  // import BarChart from '@/components/BarChart.vue';
  import AreaChart from '@/components/AreaChart.vue';
  import TemperatureDisplay from '../components/TemperatureDisplay.vue';
  import RoastControl from '../components/RoastControl.vue';
  // import SerialportControl from '../components/SerialportControl.vue';
  
  const ringBufferLength = 100;

  export default {
    components: {
      // ControlView,
      // BarChart,
      AreaChart,
      TemperatureDisplay,
      RoastControl,
      // SerialportControl
    },
    data() {
      return {
        chartData: this.initChartData(),
        webSocket: null,
        serialPortList: [],
        selectedPort: null,
        ringBuffer: [], // 温度データを常時保存するリングバッファ
        rorIndexTime: null, // ROR計算の機転時間を保存
        roastData: [], // ハゼのタイミングや温度などのデータを格納
        roastState: 'idle', // idle, roasting, cooling
        serialState: 'closed', // closed, opened
        roastStartTime : null,
        roastEndTime : null,
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
        if(this.roastState === 'roasting') {
          this.addCharData(time, value);
        }

      },
      initChartData() {
        return {
          labels: [],
          datasets: [
            { // 温度データ
              type: 'line',
              data: [],
              backgroundColor: 'rgba(255, 99, 132, 0.2)', // 背景色（透明度を持たせる）
              borderColor: 'rgba(255, 99, 132, 1)', // 線の色
              pointBackgroundColor: '',
              borderWidth: 4,
              pointBorderColor: '#249EBF',
              pointRadius: 0,
              fill: 'origin',
              elements: {
                line: {
                  tension: 0.4
                }
              },
              y: 'y1',
              
            },
            { // RORデータ
              type: 'line',
              data: [],
              backgroundColor: 'rgba(132, 99, 255, 0.2)', // 背景色（透明度を持たせる）
              borderColor: 'rgba(132, 99, 255, 1)', // 線の色
              pointBackgroundColor: '',
              borderWidth: 4,
              pointBorderColor: '#249EBF',
              pointRadius: 0,
              fill: 'origin',
              elements: {
                line: {
                  tension: 0.4
                }
              },
              y: 'y2'
            }
          ]
        };
      },
      addCharData(time, value) {
        // Y2軸のRORデータを追加の対応をしたい
        // ROR計算
        // let ror = 0;
        // const currentTime = new Date().getTime();
        // if(this.roastStartTime !== null && this.roastEndTime === null) {
        //   if(currentTime - this.roastStartTime > 60000) {
        //     // リングバッファから過去60秒間のデータからの平均RORを計算
        //     const rorData = this.ringBuffer.filter(data => {
        //       return currentTime - new Date(data.time).getTime() < 60000;
        //     });
        //     ror = rorData.length > 1 ? 
        //       (rorData[rorData.length - 1].value - rorData[0].value) / (rorData.length - 1) : 0;

        //   }          
        // }

        // TODO: X軸ラベルを00:00にしたい
        // let newLabel = 0;
        // // roastStartTimeからの経過時間を算出してラベルに追加
        // if(this.chartData.labels.length > 0) {
        //   const lastLabel = this.chartData.labels[this.chartData.labels.length - 1];
        //   const lastTime = new Date(lastLabel).getTime();
        //   const currentTime = new Date(time).getTime();
        //   const diff = currentTime - lastTime;
        //   const newTime = new Date(lastTime + diff);
        //   newLabel = newTime.toLocaleTimeString();
        // }

        const newChartData = {
          // ラベルは00:00:00のような形式で、初回を0秒として、以降は取得したtimeから算出


          labels: [ ...this.chartData.labels, time],
          datasets: [
            { // 温度データの追加
              type: 'line',
              data: [
                ...this.chartData.datasets[0].data,
                value
              ],
              yAxisID: 'y1'
            },
            // ror === 0 ? '' :
            { // RORデータの追加
              type: 'line',
              data: [
                ...this.chartData.datasets[1].data,
                this.chartData.datasets[0].data.length > 1 ? 
                  (this.chartData.datasets[0].data[this.chartData.datasets[0].data.length - 1] - 
                  this.chartData.datasets[0].data[this.chartData.datasets[0].data.length - 2]) : 0
              ],
              yAxisID: 'y2'
            }
            
          ] 
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
        this.roastEndTime = null;
        this.roastStartTime = new Date().getTime();
        this.webSocket.send(JSON.stringify({ type: 'start_roast' }));


      },
      stopRoast() {
        // ロースト終了処理
        // ロースト状態として、データ蓄積停止        
        this.webSocket.send(JSON.stringify({ type: 'stop_roast' }));
        this.roastState = 'idle';
        this.roastEndTime = new Date().getTime();
      },
      toggleRoast() {
        // ローストのトグル処理
        console.log('toggleRoast');
        if(this.roastState === 'roasting') {
          this.stopRoast();
        } else {
          this.startRoast();
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
