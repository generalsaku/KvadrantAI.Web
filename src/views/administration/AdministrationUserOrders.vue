<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Loader2, Trash2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { requestGet, requestDelete, type Order } from "@/api/request";
import { formatDate } from "@/lib/utils";

const props = defineProps<{ userId: string }>();

const orders = ref<Order[]>([]);
const error = ref("");
const isLoading = ref(true);
const deletingId = ref<string | null>(null);

const orderTitle = (order: Order) => order.property?.address || order.property?.url || order.url;

const statusClass = (status: Order["status"]) => {
    switch (status) {
        case "Completed":
            return "bg-emerald-500/10 text-emerald-600";
        case "Failed":
            return "bg-destructive/10 text-destructive";
        default:
            return "bg-amber-500/10 text-amber-600";
    }
};

const load = async () => {
    isLoading.value = true;
    error.value = "";
    try {
        const response = await requestGet(`/administration/users/${props.userId}/orders`);
        if (typeof response === "string") {
            throw new Error(response || "Could not load orders.");
        }
        orders.value = response as Order[];
    } catch (err) {
        error.value = err instanceof Error ? err.message : "Could not load orders.";
    } finally {
        isLoading.value = false;
    }
};

const remove = async (order: Order) => {
    if (deletingId.value) {
        return;
    }

    deletingId.value = order.id;
    error.value = "";
    try {
        if (await requestDelete(`/administration/users/${props.userId}/orders/${order.id}`)) {
            orders.value = orders.value.filter((o) => o.id !== order.id);
        } else {
            error.value = "Could not delete that order.";
        }
    } finally {
        deletingId.value = null;
    }
};

onMounted(load);
</script>

<template>
    <div class="border-t bg-muted/30 px-4 py-3">
        <p v-if="isLoading" class="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 class="size-4 animate-spin" /> Loading orders…
        </p>

        <p v-else-if="error" class="text-sm text-destructive">{{ error }}</p>

        <p v-else-if="!orders.length" class="text-sm text-muted-foreground">
            This user has no orders.
        </p>

        <ul v-else class="divide-y divide-border/60">
            <li v-for="order in orders" :key="order.id" class="flex items-center gap-3 py-2.5">
                <span class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium" :class="statusClass(order.status)">
                    {{ order.status }}
                </span>
                <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium text-foreground">{{ orderTitle(order) }}</p>
                    <p class="mt-0.5 truncate text-xs text-muted-foreground">
                        {{ formatDate(order.createdAt) }}<span v-if="order.error"> · {{ order.error }}</span>
                    </p>
                </div>
                <Button variant="ghost" size="icon" class="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                    :disabled="deletingId === order.id" aria-label="Delete order" @click="remove(order)">
                    <Loader2 v-if="deletingId === order.id" class="animate-spin" />
                    <Trash2 v-else />
                </Button>
            </li>
        </ul>
    </div>
</template>
