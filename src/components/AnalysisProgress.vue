<script setup lang="ts">
import { Loader2, CheckCircle2, XCircle, FileText } from "lucide-vue-next";
import type { AnalysisStep } from "@/api/request";

defineProps<{ steps: AnalysisStep[] }>();
</script>

<template>
  <ul class="space-y-3 text-left">
    <li v-for="step in steps" :key="step.id">
      <div class="flex items-center gap-3">
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
      </div>

      <ul v-if="step.items?.length" class="ml-8 mt-2 space-y-1.5">
        <li
          v-for="(item, index) in step.items"
          :key="index"
          class="flex items-start gap-2 text-sm"
        >
          <FileText class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <span class="min-w-0">
            <a
              v-if="item.url"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              class="break-words text-foreground hover:underline"
            >
              {{ item.label }}
            </a>
            <span v-else class="break-words text-foreground">{{ item.label }}</span>
            <span v-if="item.detail" class="ml-2 text-xs text-muted-foreground">
              {{ item.detail }}
            </span>
          </span>
        </li>
      </ul>
    </li>
  </ul>
</template>
