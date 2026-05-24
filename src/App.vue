<script setup lang="ts">
import { RouterView } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <AppHeader />
    <main>
      <RouterView />
    </main>
  </div>
</template>
