<script>
import AnimeCardMenu from "./AnimeCardMenu.vue";
import LargeMenu from "../Layout/LargeMenu.vue";
import { SmartDisplayOutlined, MenuFilled } from "@vicons/material";

export default {
  props: {
    anime: { type: Object },
  },
  data() {
    return {
      showMenu: false,
    };
  },
  methods: {
    handleMenu(event) {
      event.preventDefault();
      if (!this.showMenu) {
        this.showMenu = true;
      }
    },
  },
  components: { AnimeCardMenu, LargeMenu, SmartDisplayOutlined, MenuFilled },
};
</script>

<template>
  <!-- 卡片 -->
  <div
    class="relative box-content overflow-hidden select-none rounded-md border-2 border-white/0 transition-all ease-out hover:lg:scale-[1.03] hover:border-2 hover:border-blue-600 hover:shadow-lg"
    @contextmenu="handleMenu"
  >
    <div class="absolute h-full w-full bg-gray-100 dark:bg-gray-500"></div>

    <!-- 上半：海报 + 标题 -->
    <div class="relative cursor-pointer overflow-hidden">
      <RouterLink :to="{ name: 'Anime', params: { la: anime?.id } }">
        <!-- 图片容器 -->
        <div class="aspect-w-2 aspect-h-3 overflow-hidden">
          <img
            v-lazy="{
              src: anime?.deleted
                ? 'https://bangumi-app-img.5t5.top/assets/PosterLoading.jpg'
                : anime?.images?.poster ?? anime?.images?.medium,
              loading:
                'https://bangumi-app-img.5t5.top/assets/PosterLoading.jpg',
              error: 'https://bangumi-app-img.5t5.top/assets/noposter.png',
            }"
            class="absolute object-cover"
            alt="封面图片"
          />
        </div>
        <!-- 标题 -->
        <div
          class="absolute inset-x-0 bottom-0 grid h-24 items-end break-all bg-gradient-to-b from-transparent to-black/75 px-3 py-3 text-[13px] text-white font-semibold"
        >
          <n-ellipsis :line-clamp="2" expand-trigger="hover">
            {{ anime?.title || "..." }}
            <!-- Special Tags -->
            <div
              v-if="anime?.type?.bdrip"
              class="ml-0.5 inline-block rounded-sm px-1.5 text-xs font-medium bg-blue-400 bg-opacity-50 backdrop-blur-sm"
            >
              BD
            </div>
            <div
              v-if="anime?.type?.nsfw"
              class="ml-0.5 inline-block rounded-sm px-1.5 text-xs font-medium bg-yellow-300 bg-opacity-50 backdrop-blur-sm"
            >
              NSFW
            </div>
          </n-ellipsis>
        </div>
        <!-- 额外 Tag -->
        <span
          class="absolute top-1 right-1 bg-blue-600 backdrop-blur bg-opacity-60 text-white text-xs font-semibold rounded-sm px-1.5 py-0.5"
          v-if="anime?.relation"
        >
          {{ anime.relation }}
        </span>
      </RouterLink>
    </div>

    <!-- 信息区 -->
    <div class="relative h-8 dark:bg-zinc-700">
      <div class="flex h-full">
        <div class="grid basis-3/4 content-center pl-3">
          <div class="flex items-center gap-x-0.5">
            <n-icon size="15">
              <SmartDisplayOutlined />
            </n-icon>
            {{
              anime?.views > 9999
                ? (anime.views / 10000).toFixed(2) + "万"
                : anime?.views
            }}
          </div>
        </div>
        <div class="grid basis-1/4 place-items-center">
          <!-- 菜单 -->
          <LargeMenu v-model:show="showMenu">
            <template #trigger>
              <div
                class="grid place-items-center cursor-pointer rounded p-1.5 hover:bg-black/20"
              >
                <n-icon><MenuFilled /></n-icon>
                <!-- <i class="bi bi-list text-zinc-700 dark:text-gray-50"></i> -->
              </div>
            </template>
            <AnimeCardMenu :anime="anime" />
          </LargeMenu>
        </div>
      </div>
    </div>
  </div>
</template>
