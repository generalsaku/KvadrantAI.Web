<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ChevronDown, Loader2 } from "lucide-vue-next";
import { requestGet, type AdminUser } from "@/api/request";
import { formatDate } from "@/lib/utils";
import AdministrationUserOrders from "./AdministrationUserOrders.vue";

const users = ref<AdminUser[]>([]);
const error = ref("");
const isLoading = ref(true);
const expandedId = ref<string | null>(null);

const toggle = (user: AdminUser) => {
    expandedId.value = expandedId.value === user.id ? null : user.id;
};

const load = async () => {
    isLoading.value = true;
    error.value = "";
    try {
        const response = await requestGet("/administration/users");
        if (typeof response === "string") {
            throw new Error(response || "Could not load users.");
        }
        users.value = response as AdminUser[];
    } catch (err) {
        error.value = err instanceof Error ? err.message : "Could not load users.";
    } finally {
        isLoading.value = false;
    }
};

onMounted(load);
</script>

<template>
    <div class="rounded-2xl border bg-card p-6 shadow-sm">
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-foreground">Users</h2>
            <span class="text-sm text-muted-foreground">{{ users.length }} total</span>
        </div>

        <p v-if="isLoading" class="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 class="size-4 animate-spin" /> Loading users…
        </p>

        <p v-else-if="error" class="mt-4 text-sm text-destructive">{{ error }}</p>

        <p v-else-if="!users.length" class="mt-4 text-sm text-muted-foreground">
            No users have signed in yet.
        </p>

        <ul v-else class="mt-4 space-y-2">
            <li v-for="user in users" :key="user.id" class="overflow-hidden rounded-xl border">
                <button type="button"
                    class="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-accent/50"
                    :aria-expanded="expandedId === user.id" @click="toggle(user)">
                    <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform"
                        :class="{ '-rotate-90': expandedId !== user.id }" />
                    <div class="min-w-0 flex-1">
                        <p class="truncate font-medium text-foreground">
                            {{ user.provider }} · <span class="font-mono text-sm">{{ user.providerId }}</span>
                        </p>
                        <p class="mt-0.5 truncate text-xs text-muted-foreground">
                            Joined {{ formatDate(user.createdAt) }}
                        </p>
                    </div>
                    <span class="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {{ user.orderCount }} {{ user.orderCount === 1 ? "order" : "orders" }}
                    </span>
                </button>

                <AdministrationUserOrders v-if="expandedId === user.id" :user-id="user.id" />
            </li>
        </ul>
    </div>
</template>
