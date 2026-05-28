<script setup lang="ts">
import { computed, ref } from "vue";
import { Search, Loader2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { analyzeListing } from "@/api/request";

const allowedPrefixes = ["https://www.booli.se/", "https://www.hemnet.se/"];

const url = ref("");
const loading = ref(false);
const error = ref("");
const result = ref("");

const isValid = (value: string) => {
  const trimmed = value.trim();
  return allowedPrefixes.some(
    (prefix) => trimmed.startsWith(prefix) && trimmed.length > prefix.length
  );
};

const canSubmit = computed(() => isValid(url.value) && !loading.value);

const submit = async () => {
  error.value = "";
  result.value = "";

  const trimmed = url.value.trim();
  if (!isValid(trimmed)) {
    error.value =
      "Enter a Booli or Hemnet listing link, e.g. https://www.booli.se/bostad/608994";
    return;
  }

  loading.value = true;
  try {
    const response = await analyzeListing(trimmed);
    result.value = response?.message ?? "Analysis started.";
  } catch {
    error.value = "Something went wrong while analyzing the listing. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="mx-auto w-full max-w-2xl text-center">
    <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
      Analyze a property listing
    </h1>
    <p class="mx-auto mt-3 max-w-prose text-muted-foreground">
      Paste a link to a listing on
      <span class="font-medium text-foreground">booli.se</span> or
      <span class="font-medium text-foreground">hemnet.se</span> for example a
      specific apartment or house and we'll pull together the details for you.
    </p>

    <form class="mt-8" @submit.prevent="submit">
      <div
        class="flex items-center gap-3 rounded-full border border-input bg-background px-5 py-2 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
        <Search class="size-5 shrink-0 text-muted-foreground" />
        <input v-model="url" type="url" inputmode="url" :disabled="loading"
          placeholder="https://www.booli.se/bostad/608994" aria-label="Listing link"
          class="h-10 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground disabled:opacity-60" />
        <Loader2 v-if="loading" class="size-5 shrink-0 animate-spin text-muted-foreground" />
      </div>

      <div class="mt-4 flex justify-center">
        <Button type="submit" size="lg" :disabled="!canSubmit">
          <Loader2 v-if="loading" class="animate-spin" />
          {{ loading ? "Analyzing…" : "Analyze" }}
        </Button>
      </div>
    </form>

    <p v-if="error" class="mt-4 text-sm text-destructive">{{ error }}</p>
    <p v-else-if="result" class="mt-4 text-sm text-muted-foreground">{{ result }}</p>
  </div>
</template>
