<template>
  <!-- 深色模式弹窗设置 -->
  <n-modal
    :show="show"
    @update:show="$emit('update:show', false)"
    class="select-none"
  >
    <n-card
      class="max-w-xl"
      title="深色模式设置"
      :bordered="false"
      size="small"
      role="dialog"
      aria-modal="true"
    >
      <template #header-extra>
        <i
          class="bi bi-x-lg hover:text-blue-600 cursor-pointer ml-2"
          @click="$emit('update:show', false)"
        ></i>
      </template>
      <n-list hoverable clickable>
        <n-list-item
          @click="settings.darkMode.enable = !settings.darkMode.enable"
        >
          深色模式
          <n-switch :value="settings.darkMode.enable" class="float-right" />
        </n-list-item>
        <n-list-item
          @click="
            settings.darkMode.autoDarkMode = !settings.darkMode.autoDarkMode
          "
        >
          自动启用深色模式
          <n-switch
            :value="settings.darkMode.autoDarkMode"
            class="float-right"
          />
        </n-list-item>
      </n-list>
      <n-collapse-transition :show="settings.darkMode.autoDarkMode">
        <n-space class="px-5 py-3">
          <n-radio
            :checked="settings.darkMode.autoMode == 'system'"
            @click="settings.darkMode.autoMode = 'system'"
          >
            跟随系统设定
          </n-radio>
          <n-radio
            :checked="settings.darkMode.autoMode == 'time'"
            @click="settings.darkMode.autoMode = 'time'"
          >
            根据时间
          </n-radio>
        </n-space>
        <n-collapse-transition :show="settings.darkMode.autoMode == 'system'">
          <div class="px-5 pb-2 text-xs text-gray-400">
            若您正在使用部分<strong>手机</strong>国产浏览器，<strong>此功能可能无法使用</strong>。<br />
            手机端目前确定支持: Chrome、Edge、FireFox、Via、X浏览器、Safari。<br />
            夸克、360、QQ浏览器等已确定无法支持。
          </div>
        </n-collapse-transition>
        <!-- 跟随的时间设置面版 -->
        <n-collapse-transition :show="settings.darkMode.autoMode == 'time'">
          <div class="px-5 py-3">
            <n-space vertical>
              <!-- <n-slider v-model:value="settings.darkMode.now" :step="1" :min="0" :max="23" /> -->
              <div>
                深色开始时间 / 晚上 (24小时制)
                <n-slider
                  v-model:value="settings.darkMode.darkTime"
                  :step="1"
                  :min="0"
                  :max="23"
                />
              </div>
              <div>
                浅色开始时间 / 早晨 (24小时制)
                <n-slider
                  v-model:value="settings.darkMode.lightTime"
                  :step="1"
                  :min="0"
                  :max="23"
                />
              </div>
              <n-space>
                <n-input-number
                  v-model:value="settings.darkMode.darkTime"
                  size="small"
                />
                <n-input-number
                  v-model:value="settings.darkMode.lightTime"
                  size="small"
                />
              </n-space>
            </n-space>
          </div>
        </n-collapse-transition>
      </n-collapse-transition>
    </n-card>
  </n-modal>
</template>

<script setup>
import { useSettingsStore } from "../../../store/Settings.js";

const settings = useSettingsStore();
defineProps({
  show: Boolean,
});
defineEmits(["update:show"]);
</script>
