<script setup lang="ts">
import { Loader2, CheckCircle2, XCircle } from "lucide-vue-next";
import type { AnalysisStep } from "@/api/request";

defineProps<{ steps: AnalysisStep[] }>();
</script>

<template>
  <ul class="space-y-3 text-left">
    <li v-for="step in steps" :key="step.id" class="flex items-center gap-3">
      <Loader2
        v-if="step.status === 'running'"
        class="size-5 shrink-0 animate-spin text-muted-foreground"
      />
      <CheckCircle2
        v-else-if="step.status === 'success'"
        class="size-5 shrink-0 text-emerald-500"
      />
      <XCircle v-else class="size-5 shrink-0 text-destructive" />
      <span
        class="text-sm"
        :class="{
          'text-foreground': step.status === 'success',
          'text-muted-foreground': step.status === 'running',
          'text-destructive': step.status === 'error',
        }"
      >
        {{ step.label }}
      </span>
    </li>
  </ul>
</template>
