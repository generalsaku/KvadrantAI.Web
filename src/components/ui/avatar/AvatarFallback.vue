<script setup lang="ts">
import { AvatarFallback, type AvatarFallbackProps } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<AvatarFallbackProps & { class?: string }>();
</script>

<template>
  <AvatarFallback
    v-bind="props"
    :class="cn('h-full w-full flex items-center justify-center', props.class)"
  >
    <slot />
  </AvatarFallback>
</template>
