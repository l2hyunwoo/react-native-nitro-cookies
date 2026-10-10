<script setup>
import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";

const { lang } = useData();
</script>

<template>
  <DefaultTheme.Layout>
    <template #doc-before>
      <div class="release-notice" v-if="lang === 'ko'">
        <strong>Next 문서</strong> · List API, scope를 지정하는 삭제 API, error
        normalization은 아직 출시하지 않았습니다.
        <a
          href="https://github.com/l2hyunwoo/react-native-nitro-cookies/pull/24"
          >변경 사항 확인 ↗</a
        >
      </div>
      <div class="release-notice" v-else>
        <strong>Next documentation</strong> · List APIs, scoped deletion, and
        normalized errors are unreleased.
        <a
          href="https://github.com/l2hyunwoo/react-native-nitro-cookies/pull/24"
          >Track changes ↗</a
        >
      </div>
    </template>
  </DefaultTheme.Layout>
</template>
