<template>
  <div
    class="relative hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-zinc-700 dark:active:bg-zinc-600 p-0.5 leading rounded ease-in duration-100"
    :class="active ? 'border-2 border-blue-500' : ''"
  >
    <div v-if="video.type == 'file'" class="cursor-pointer">
      <!-- 集数
      <n-tag class="absolute bottom-0 right-0 z-10 bg-opacity-50" v-if="video.episode" size="small" type="warning">
        {{ video.episode }}
      </n-tag> -->
      <!-- 普通标签 -->
      <span v-for="tag in video.parseResult.tagedName" class="inline-flex">
        <span v-if="typeof tag == 'string'" class="mx-0.5">{{ tag }}</span>
        <n-tag
          v-else-if="typeof tag == 'object'"
          class="mx-0.5 my-0.5"
          :type="tagType[tag.type]"
          size="small"
          :bordered="false"
        >
          {{ tag.result }}
        </n-tag>
      </span>
      <!-- 资源格式 -->
      <n-tag
        class="mx-0.5 my-0.5 inline-flex bg-gray-400 dark:bg-zinc-700 text-white font-medium"
        size="small"
        :bordered="false"
      >
        {{ video.parseResult.extensionName.result }}
      </n-tag>
    </div>
  </div>
</template>

<script setup>
defineProps({
  video: Object,
  active: Boolean,
});

const tagType = {
  group: "info",
  source: "success",
  quality: "",
  language: "info",
  other: "warning",
};
</script>
