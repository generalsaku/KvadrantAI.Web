<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { LogOut } from "lucide-vue-next";
import { useUserStore } from "@/stores/user";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const initials = computed(() => {
  const name = user.value.name?.trim();
  if (!name) return "?";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
});
</script>

<template>
  <header class="border-b bg-background">
    <div class="container flex h-14 items-center justify-between">
      <RouterLink
        to="/"
        class="font-semibold tracking-tight text-foreground hover:opacity-80"
      >
        KvadrantAI
      </RouterLink>

      <div>
        <Button v-if="!user.isAuthorized" @click="userStore.signIn">
          Sign in
        </Button>

        <DropdownMenu v-else>
          <DropdownMenuTrigger as-child>
            <button
              class="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="User menu"
            >
              <Avatar>
                <AvatarImage v-if="user.image" :src="user.image" :alt="user.name" />
                <AvatarFallback>{{ initials }}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuLabel>
              <div class="flex flex-col">
                <span class="text-sm font-medium">{{ user.name || "Signed in" }}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem @select="userStore.signOut">
              <LogOut />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>
