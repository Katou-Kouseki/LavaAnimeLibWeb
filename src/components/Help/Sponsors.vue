<template>
  <div>
    <div class="text-lg font-medium">赞助致谢</div>
    <div class="grid place-content-center z-0">
      <div
        class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 gap-4"
      >
        <template v-for="sponsor in sponsors">
          <SponsorCard :sponsor="sponsor" @click="sponsor.showModal = true" />

          <n-modal v-model:show="sponsor.showModal">
            <n-card
              style="max-width: 400px"
              :title="sponsor.name"
              :bordered="false"
              closable
              @close="sponsor.showModal = false"
              role="dialog"
            >
              <template #header-extra>
                <div class="dark:text-zinc-100">
                  {{ sponsor.support }}
                </div>
              </template>
              <p v-html="sponsor.message"></p>
              <template #action>
                <n-a v-if="sponsor.link" :href="sponsor.link" target="_blank"
                  >查看附加的链接</n-a
                >
              </template>
            </n-card>
          </n-modal>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import SponsorCard from "./SponsorCard.vue";

export default {
  data() {
    return {
      sponsors: [],
      sponsorsRaw: [
        {
          name: "Arthals",
          support: "￥1111.00",
          message: "111 大哥真给看吗 <br> (包含非番剧库赞助)",
          link: "https://arthals.ink/",
        },
        {
          name: "czy0729",
          support: "￥367.98",
          message: "(包含非番剧库赞助)",
          link: "https://github.com/czy0729",
        },
        { name: "小林", support: "￥300.00" },
        { name: "Longtianmu", support: "￥240", link: "https://ltm.ink/" },
        {
          name: "MicTimo",
          support: "￥66.00",
        },
        {
          name: "纯之",
          support: "其他",
          message: "提供部分网页和视频的加速服务节点",
          link: "https://moe.tips/",
        },
        {
          name: "林恩 Lynn.",
          support: "其他",
          message: "提供（CloudFlare自选）视频加速节点",
          link: "https://blog.lynn6.cn/",
        },
        {
          name: "若葉",
          support: "其他",
          message: "提供新域名等支持",
          link: "https://loliloli.moe/",
        },
        {
          name: "XJH_Jorhai",
          support: "￥35.00",
          message: "麦老师是我的神明呜呜呜",
        },
        {
          name: "Arthals",
          support: "其他",
          message: "提供了数月的下载节点支持",
          link: "https://arthals.ink/",
        },
        { name: "Loliy", support: "￥23.00", message: "喝快乐水" },
        { name: "射命墨瑟", support: "￥9.00", message: "(包含非番剧库赞助)" },
      ],
    };
  },
  mounted() {
    this.sponsorsRaw.forEach((sponsor) => {
      this.sponsors.push({
        name: "",
        support: "",
        link: "",
        message: "",
        ...sponsor,
        showModal: ref(false),
      });
    });
  },
  components: { SponsorCard },
};
</script>
