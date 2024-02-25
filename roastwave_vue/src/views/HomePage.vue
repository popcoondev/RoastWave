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
    <p>Elapsed: {{ formatTime((rorIndexTime - roastStartTime) / 1000) }}</p>
    
  

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
  
  const ringBufferLength = 120;

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
        rorTemperture: 0, // ROR計算の温度を保存
        roastData: [], // ハゼのタイミングや温度などのデータを格納
        roastState: 'idle', // idle, roasting, cooling
        serialState: 'closed', // closed, opened
        roastStartTime : null,
        roastEndTime : null,
        roastLoop: null
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
        this.ringBuffer.push({ time: time, value: // 少数一桁までのデータに変換
          parseFloat(value).toFixed(1) });

        // リングバッファの長さが100を超えたら先頭のデータを削除
        if(this.ringBuffer.length > ringBufferLength) {
          this.ringBuffer.shift();
        }

        // ロースト中の場合は、ローストデータとして追加
        // if(this.roastState === 'roasting') {
        //   this.addCharData(time, value);
        // }

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
              yAxisID: 'y1',
              
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
              yAxisID: 'y2'
            }
          ]
        };
      },
      addCharData(time, value) {
        // ROR計算
        let ror = NaN;
        // 60秒前のデータを探して取得
        ror = this.chartData.datasets[0].data[this.chartData.datasets[0].data.length - 1] - value;

        console.log('addCharData-2:', time, value, ror);
        
        const newChartData = {
          
          datasets: [
            {
              // 温度データの追加
              type: 'line',
              data: [ { x: time, y: value } ],
              yAxisID: 'y1'
            },
            {
              // RORデータの追加
              type: 'line',
              data: [ { x: time, y: ror } ],
              yAxisID: 'y2'

            } 
          ]

          // labels: [ ...this.chartData.labels, new Date(time).toISOString() ],
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
          //     data: [ ...this.chartData.datasets[1].data, ror ],
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
        this.roastEndTime = null;
        this.roastStartTime = new Date().getTime();
        this.webSocket.send(JSON.stringify({ type: 'start_roast' }));
        this.startRoastLoop();
        this.rorIndexTime = this.roastStartTime;
        this.pastRorTemperture = this.ringBuffer[this.ringBuffer.length - 1].value;
      },
      stopRoast() {
        // ロースト終了処理
        // ロースト状態として、データ蓄積停止        
        this.webSocket.send(JSON.stringify({ type: 'stop_roast' }));
        this.roastState = 'idle';
        this.roastEndTime = new Date().getTime();
        this.rorIndexTime = null;
        this.stopRoastLoop();
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
      // Roasting中だけ1秒間隔でポーリングするループを実装する
      // バックグラウンドで並列処理を行う
      startRoastLoop() {
        // ループを開始する
        this.roastLoop = setInterval(() => {
          // ロースト中の場合のみ、データを取得する
          if(this.roastState === 'roasting') {
            // リングバッファから最新のデータを取得
            const latestData = this.ringBuffer[this.ringBuffer.length - 1];
            this.addCharData(
              this.formatNumber((new Date().getTime() - this.roastStartTime) / 1000),
              latestData.value
            );
            this.rorIndexTime = new Date().getTime();
          }
        }, 1 * 1000);
      },
      stopRoastLoop() {
        // ループを停止する
        clearInterval(this.roastLoop);
      },
      formatTime(time) { // timeはミリ秒単位
        console.log('formatTime:', time);
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' + seconds.toFixed(0) : seconds.toFixed(0)}`;
      },
      formatNumber(time) { // mm.ssで表示
        console.log('formatNumber:', time);
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}.${seconds.toFixed(0)}`;

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
