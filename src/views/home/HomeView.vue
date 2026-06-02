<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user";
import ListingSearch from "@/components/ListingSearch.vue";

const { user } = storeToRefs(useUserStore());
</script>

<template>
  <section
    v-if="user.isAuthorized"
    class="container flex min-h-[70vh] items-center justify-center py-16"
  >
    <ListingSearch />
  </section>
  <section v-else class="container py-16">
    <h1 class="text-2xl font-semibold tracking-tight">
      Welcome to KvadrantAI.
    </h1>
    <p class="mt-2 text-muted-foreground">
      Sign in with the button in the top-right to get started.
    </p>
  </section>
</template>
