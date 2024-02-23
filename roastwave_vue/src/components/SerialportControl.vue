<template>
    <ToolsBase>
        <div class="serialport-control">
        </div>
    </ToolsBase>
</template>

<script>
import ToolsBase from './ToolsBase.vue';

export default {
  components: { ToolsBase },
    name: 'SerialportControl',
    extends: ToolsBase,
    props: {
        serialportStateProp: {
            type: String,
            default: 'idle'
        },
        startSerialPortProp: {
            type: Function,
            default: () => {}
        }
    },
}
</script>

<style>
.serialport-control {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    gap: 20px; /* ボタン間のスペース */
}

.serialport-control button {
    width: 100px; /* 幅を100pxに設定 */
    height: 40px; /* 高さを40pxに設定 */
    border: none; /* 枠線をなくす */
    border-radius: 5px; /* 角を丸くする */
    background-color: #4CAF50; /* 背景色を緑にする */
    color: white; /* 文字色を白にする */
    font-size: 16px; /* フォントサイズを16pxに設定 */
    cursor: pointer; /* マウスカーソルをポインターにする */
}

.serialport-control button:hover {
    background-color: #45a049; /* マウスオーバー時の背景色を濃い緑にする */
}

.serialport-control button:active {
    background-color: #3e8e41; /* クリック時の背景色を濃い緑にする */
}

.serialport-control-label {
    font-size: 16px; /* フォントサイズを16pxに設定 */
    text-align: left; /* 中央揃えにする */
    margin: 0; /* マージンを0にする */
    font-family: 'Courier New', Courier, monospace; /* フォントをCourier Newに設定 */
}



</style>
