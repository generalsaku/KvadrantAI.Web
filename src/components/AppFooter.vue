<script setup lang="ts">
const year = new Date().getFullYear();
const version = __APP_VERSION__;
const commit = __BUILD_COMMIT__;
</script>

<template>
  <footer class="border-t bg-background">
    <div
      class="container flex h-12 items-center justify-between text-xs text-muted-foreground"
    >
      <span>&copy; {{ year }} Kvadrant AI</span>
      <span>Build {{ version }} ({{ commit }})</span>
    </div>
  </footer>
</template>
