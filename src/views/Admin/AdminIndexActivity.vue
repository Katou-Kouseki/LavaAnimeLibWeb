<template>
  <LeftMenuRightContent>
    <template #left>
      <NH2>样式预览</NH2>
      <IndexActivityCard></IndexActivityCard>
    </template>
    <template #right>
      <NForm>
        <NFormItem label="开启活动卡片">
          <NSwitch v-model:value="store.activityCard.enable"></NSwitch>
        </NFormItem>
        <NFormItem label="是否含有可点击的链接">
          <NSwitch v-model:value="store.activityCard.link.enable"></NSwitch>
        </NFormItem>
        <NFormItem label="URL 地址">
          <NInput v-model:value="store.activityCard.link.url"></NInput>
        </NFormItem>
        <NFormItem label="海报图片 URL">
          <NInput v-model:value="store.activityCard.image"></NInput>
        </NFormItem>
        <NFormItem>
          <NButton @click="submitUpdate">提交更新</NButton>
        </NFormItem>
      </NForm>
    </template>
  </LeftMenuRightContent>
</template>

<script setup>
import { LavaAnimeAPI } from "../../common/api";
import IndexActivityCard from "../../components/Index/IndexActivityCard.vue";
import LeftMenuRightContent from "../../components/Layout/PageLayout/LeftMenuRightContent.vue";
import { useIndexStore } from "../../store/Index";
import { useMessage } from "naive-ui";

const store = useIndexStore();
const message = useMessage();

const submitUpdate = async () => {
  try {
    let request = await LavaAnimeAPI.post("/v2/site/setting/set", {
      key: "indexActivityCard",
      value: store.activityCard,
    });
    if (request.data?.code == 200) {
      message.success("成功");
    }
  } catch (error) {
    console.error(error);
    message.error("提交失败");
  }
};
</script>
