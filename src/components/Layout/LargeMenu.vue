<!-- 本组件是一个适配手机和宽屏的菜单模板 -->
<!-- 在手机上, 内容将以底部抽屉的形态打开 -->
<!-- 在宽屏上, 内容将浮层显示到按钮的周围 -->
<template>
  <div>
    <!-- 宽屏 -->
    <n-popover
      v-if="isWide"
      trigger="manual"
      :show="showMe"
      :on-clickoutside="clickOutside"
      placement="top"
    >
      <template #trigger>
        <div @click="showMe = !showMe" ref="trigger">
          <slot name="trigger"></slot>
        </div>
      </template>
      <div>
        <slot></slot>
      </div>
    </n-popover>
    <!-- 手机 -->
    <div v-if="!isWide">
      <!-- 触发按钮 -->
      <div @click="showMe = !showMe">
        <slot name="trigger"></slot>
      </div>
      <!-- 抽屉 -->
      <n-drawer
        v-model:show="showMe"
        height="auto"
        placement="bottom"
        class="px-4 py-2"
      >
        <slot></slot>
      </n-drawer>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

// 受控模式需要的 props 和 emits
const props = defineProps(["show"]);
const emits = defineEmits(["update:show"]);

// 非受控模式的自有 show ref
const showLocal = ref(false);
// Proxy
const showMe = computed({
  get: () => props.show ?? showLocal.value,
  set: (value) => {
    emits("update:show", value); // 受控模式
    showLocal.value = value; // 非受控模式
  },
});
const isWide = window.innerWidth >= 640 ? true : false;

const trigger = ref(null);
const clickOutside = (event) => {
  // 避免在点击 trigger 时触发
  if (trigger.value.contains(event.target)) return;
  showMe.value = false;
};
</script>
