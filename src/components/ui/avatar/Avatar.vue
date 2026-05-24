<script setup lang="ts">
import { AvatarRoot } from "reka-ui";
import { cn } from "@/lib/utils";
import { avatarVariants, type AvatarVariants } from ".";

interface Props {
  size?: AvatarVariants["size"];
  shape?: AvatarVariants["shape"];
  class?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <AvatarRoot :class="cn(avatarVariants({ size, shape }), props.class)">
    <slot />
  </AvatarRoot>
</template>
