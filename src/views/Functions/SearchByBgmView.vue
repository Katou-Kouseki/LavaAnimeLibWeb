<template>
  <Container>
    <TopNav />
    <LeftMenuRightContent class="mt-4">
      <template #left>
        <div class="text-lg mb-4 mx-0.5 font-medium">使用 Bangumi ID 搜索</div>
        <n-input-group>
          <n-input
            v-model:value="bgmID"
            type="text"
            placeholder="ID"
            :allow-input="onlyAllowNumber"
            @keyup.enter="doSearch"
          >
            <template #prefix>Bgm</template>
          </n-input>
          <n-button type="primary" ghost @click="doSearch"> 搜索 </n-button>
        </n-input-group>
        <n-alert
          title="Bangumi 是什么？"
          type="default"
          class="mt-4 select-text"
        >
          <template #icon>
            <n-icon>
              <InfoFilled />
            </n-icon>
          </template>
          <a href="https://bgm.tv/" target="_blank" rel="noopener noreferrer">
            Bangumi
          </a>
          是由
          <a
            href="https://bgm.tv/user/Sai"
            target="_blank"
            ref="noopener noreferrer"
          >
            Sai
          </a>
          于桂林发起的 ACG 分享与交流项目。目前已是中文最全 ACGN
          资料库。番剧库中的番剧几乎均关联了 Bangumi 的相关条目。<br /><br />
          如果您正在使用 czy0729 开发的第三方 Bangumi 客户端，您可以在客户端的
          设置 -> 其他 -> 源头 中添加动画源头，网址为：
          <n-text code>
            {{ origin + "/search-bgm/[ID]" }}
          </n-text>
        </n-alert>
      </template>
      <template #right>
        <AnimeCardContainer :animes="searchResults" size="large" />
      </template>
    </LeftMenuRightContent>
  </Container>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { InfoFilled } from "@vicons/material";
import { LavaAnimeAPI } from "../../common/api";

document.title = "使用 Bangumi ID 搜索 | 熔岩番剧库 LavaAnimeLib";

const bgmID = ref(null);
const searchResults = ref([]);

const router = useRouter();
const route = useRoute();

bgmID.value = route.params?.value;
doSearch();

const origin = window.location.origin;

function onlyAllowNumber(value) {
  return !value || /^\d+$/.test(value);
}

async function doSearch() {
  if (!bgmID.value) return;

  router.push({ params: { value: bgmID.value } });

  try {
    let result = await LavaAnimeAPI.get("/v2/anime/bangumi/get", {
      params: { bgmid: bgmID.value },
    });
    if (result.status == 200 && Array.isArray(result.data.data)) {
      searchResults.value = result.data.data;
      if (result.data.data.length == 0) {
        $message.info("没有找到任何结果...");
      }
    }
  } catch (error) {}
}
</script>
