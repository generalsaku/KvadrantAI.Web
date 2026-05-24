<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/user";

const { user } = storeToRefs(useUserStore());
</script>

<template>
  <section class="container py-16">
    <template v-if="user.isAuthorized">
      <h1 class="text-2xl font-semibold tracking-tight">
        You're signed in{{ user.name ? `, ${user.name}` : "" }}.
      </h1>
      <p class="mt-2 text-muted-foreground">
        Welcome to KvadrantAI.
      </p>
    </template>
    <template v-else>
      <h1 class="text-2xl font-semibold tracking-tight">
        Welcome to KvadrantAI.
      </h1>
      <p class="mt-2 text-muted-foreground">
        Sign in with the button in the top-right to get started.
      </p>
    </template>
  </section>
</template>
