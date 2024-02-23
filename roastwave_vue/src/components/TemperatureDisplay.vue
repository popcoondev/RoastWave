<template>
    <ToolsBase>
        <div class="temperature-display">
            <p class="temperature-display-label">Temperature:</p>
            <span class="temperature-display-value">{{ temperature < 0 ? '--' : temperature }}</span>
            <span class="temperature-display-label">°C</span>
        </div>
    </ToolsBase>
</template>

<script>
import ToolsBase from './ToolsBase.vue';

export default {
  components: { ToolsBase },
    name: 'TemperatureDisplay',
    extends: ToolsBase,
    props: {
        temperature: {
            type: Number,
            default: -1
        }
    }
}
</script>

<style>
.temperature-display {
    

}

.temperature-display-label {
    font-size: 16px; /* フォントサイズを16pxに設定 */
    text-align: left; /* 中央揃えにする */
    margin: 0; /* マージンを0にする */
    font-family: 'Courier New', Courier, monospace; /* フォントをCourier Newに設定 */
}

.temperature-display-value {
    font-size: 48px; /* フォントサイズを24pxに設定 */
    font-weight: bold; /* 太字にする */
    text-align: center; /* 中央揃えにする */
    margin: 0; /* マージンを0にする */
    font-family: 'Courier New', Courier, monospace; /* フォントをCourier Newに設定 */
}

</style>
