<script setup lang="ts">
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { requestGet } from "@/api/request";
import { useUserStore } from "@/stores/user";

interface AdministrationResponse {
  message: string;
  id: string;
  name: string;
  email: string;
}

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const administration = ref<AdministrationResponse | null>(null);
const error = ref("");
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await requestGet("/administration");
    if (typeof response === "string") {
      throw new Error(response || "Could not load administration data.");
    }

    administration.value = response as AdministrationResponse;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Could not load administration data.";
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <section class="container py-16">
    <div class="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <p class="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Administration
        </p>
        <h1 class="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Restricted control surface
        </h1>
        <p class="mt-3 max-w-2xl text-muted-foreground">
          This page is only available to the configured administrator account and verifies access against the API.
        </p>
      </div>

      <div class="rounded-2xl border bg-card p-6 shadow-sm">
        <p v-if="isLoading" class="text-sm text-muted-foreground">
          Loading administration status...
        </p>

        <div v-else-if="error" class="space-y-2">
          <p class="text-sm font-medium text-destructive">Access check failed.</p>
          <p class="text-sm text-muted-foreground">{{ error }}</p>
        </div>

        <div v-else-if="administration" class="space-y-4">
          <p class="text-sm font-medium text-foreground">{{ administration.message }}</p>
          <dl class="grid gap-3 text-sm sm:grid-cols-2">
            <div class="rounded-xl border bg-background p-4">
              <dt class="text-xs uppercase tracking-[0.2em] text-muted-foreground">Name</dt>
              <dd class="mt-2 font-medium text-foreground">{{ administration.name || user.name }}</dd>
            </div>
            <div class="rounded-xl border bg-background p-4">
              <dt class="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</dt>
              <dd class="mt-2 font-medium text-foreground">{{ administration.email || user.email }}</dd>
            </div>
            <div class="rounded-xl border bg-background p-4 sm:col-span-2">
              <dt class="text-xs uppercase tracking-[0.2em] text-muted-foreground">User ID</dt>
              <dd class="mt-2 break-all font-medium text-foreground">{{ administration.id }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </section>
</template>