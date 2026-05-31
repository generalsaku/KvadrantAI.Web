<script setup lang="ts">
import { computed, ref } from "vue";
import { Search, Loader2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import CollectionProgress from "@/components/CollectionProgress.vue";
import {
  collectListingStream,
  type ProgressStep,
  type OrderResultData,
} from "@/api/request";

const allowedPrefixes = ["https://www.booli.se/", "https://www.hemnet.se/"];

const url = ref("");
const loading = ref(false);
const error = ref("");
const steps = ref<ProgressStep[]>([]);
const result = ref<OrderResultData | null>(null);

const isValid = (value: string) => {
  const trimmed = value.trim();
  return allowedPrefixes.some(
    (prefix) => trimmed.startsWith(prefix) && trimmed.length > prefix.length
  );
};

const canSubmit = computed(() => isValid(url.value) && !loading.value);

const upsertStep = (step: ProgressStep) => {
  const index = steps.value.findIndex((s) => s.id === step.id);
  if (index === -1) {
    steps.value.push(step);
  } else {
    steps.value[index] = step;
  }
};

const submit = async () => {
  error.value = "";
  result.value = null;
  steps.value = [];

  const trimmed = url.value.trim();
  if (!isValid(trimmed)) {
    error.value =
      "Enter a Booli or Hemnet listing link, e.g. https://www.booli.se/bostad/608994";
    return;
  }

  loading.value = true;
  try {
    await collectListingStream(trimmed, (message) => {
      if (message.type === "step") {
        upsertStep(message);
      } else if (message.type === "result") {
        result.value = message.data;
      }
    });
  } catch {
    error.value =
      "Something went wrong while collecting the listing. Please try again.";
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
        class="flex items-center gap-3 rounded-full border border-input bg-background py-2 pl-5 pr-2 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
        <Search class="size-5 shrink-0 text-muted-foreground" />
        <input v-model="url" type="url" inputmode="url" :disabled="loading"
          placeholder="https://www.booli.se/bostad/608994" aria-label="Listing link"
          class="h-10 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground disabled:opacity-60" />
        <Button type="submit" :disabled="!canSubmit" class="shrink-0 rounded-full">
          <Loader2 v-if="loading" class="animate-spin" />
          {{ loading ? "Analyzing…" : "Analyze" }}
        </Button>
      </div>
    </form>

    <p v-if="error" class="mt-4 text-sm text-destructive">{{ error }}</p>

    <div
      v-if="steps.length"
      class="mt-8 w-full rounded-3xl border border-input bg-muted/30 px-6 py-5 shadow-sm">
      <CollectionProgress :steps="steps" />
    </div>

    <div
      v-if="result"
      class="mx-auto mt-6 w-full max-w-md rounded-lg border border-input bg-muted/30 p-4 text-left">
      <p class="text-sm font-medium text-foreground">
        {{ result.status === "Completed" ? "Listing collected" : `Order ${result.status}` }}
      </p>
      <dl class="mt-2 space-y-1 text-sm text-muted-foreground">
        <div v-if="result.property.brfName">
          BRF: <span class="text-foreground">{{ result.property.brfName }}</span>
        </div>
        <div v-if="result.property.brokerCompany">
          Broker: <span class="text-foreground">{{ result.property.brokerCompany }}</span>
        </div>
        <div>
          {{ result.property.documents.length }}
          {{ result.property.documents.length === 1 ? "document" : "documents" }}
          collected
        </div>
      </dl>
    </div>
  </div>
</template>
