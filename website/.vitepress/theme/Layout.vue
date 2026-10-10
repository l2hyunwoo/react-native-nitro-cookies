<script setup>
import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";

const { lang } = useData();
</script>

<template>
  <DefaultTheme.Layout>
    <template #doc-before>
      <div class="release-notice" v-if="lang === 'ko'">
        <strong>1.3.0 문서</strong> · List API, scope를 지정하는 삭제 API, error
        normalization은 1.3.0부터 지원합니다.
        <a
          href="https://github.com/l2hyunwoo/react-native-nitro-cookies/releases"
          >릴리스 이력 확인 ↗</a
        >
      </div>
      <div class="release-notice" v-else>
        <strong>1.3.0 documentation</strong> · List APIs, scoped deletion, and
        normalized errors are available from 1.3.0.
        <a
          href="https://github.com/l2hyunwoo/react-native-nitro-cookies/releases"
          >View release history ↗</a
        >
      </div>
    </template>
  </DefaultTheme.Layout>
</template>
