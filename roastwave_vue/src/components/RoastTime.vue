<template>
    <ToolsBase>
        <div class="roast-time">
            <p class="roast-time-label">Roast Time:</p>
            <span class="roast-time-value">{{ roastElapsedMillisProp }}</span>
        </div>
    </ToolsBase>
</template>

<script>
import ToolsBase from './ToolsBase.vue';

export default {
  components: { ToolsBase },
    name: 'RoastTime',
    extends: ToolsBase,
    props: {
        roastElapsedMillisProp: {
            type: String,
            default: '00:00'
        }
    },

}
</script>

<style>
.roast-time {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    gap: 20px; /* ボタン間のスペース */
}

.roast-time-label {
    font-size: 16px; /* フォントサイズを16pxに設定 */
    text-align: left; /* 中央揃えにする */
    margin: 0; /* マージンを0にする */
    font-family: 'Courier New', Courier, monospace; /* フォントをCourier Newに設定 */
}

</style>
