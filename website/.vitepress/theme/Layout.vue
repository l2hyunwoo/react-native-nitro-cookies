<script setup>
import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";

const { lang } = useData();
</script>

<template>
  <DefaultTheme.Layout>
    <template #nav-bar-title-after>
      <span class="version-label">Next</span>
    </template>
    <template #doc-before>
      <div class="release-notice" v-if="lang === 'ko'">
        <strong>Next 문서</strong> · 목록·범위 삭제 API와 오류 정규화는 미출시
        변경입니다.
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
