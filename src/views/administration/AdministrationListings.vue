<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Loader2, Trash2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { requestGet, requestDelete, type AdminListing } from "@/api/request";
import { formatDate } from "@/lib/utils";

const listings = ref<AdminListing[]>([]);
const error = ref("");
const isLoading = ref(true);
const deletingId = ref<string | null>(null);

const load = async () => {
    isLoading.value = true;
    error.value = "";
    try {
        const response = await requestGet("/administration/listings");
        if (typeof response === "string") {
            throw new Error(response || "Could not load listings.");
        }
        listings.value = response as AdminListing[];
    } catch (err) {
        error.value = err instanceof Error ? err.message : "Could not load listings.";
    } finally {
        isLoading.value = false;
    }
};

const remove = async (listing: AdminListing) => {
    if (deletingId.value) {
        return;
    }

    deletingId.value = listing.id;
    error.value = "";
    try {
        if (await requestDelete(`/administration/listings/${listing.id}`)) {
            listings.value = listings.value.filter((l) => l.id !== listing.id);
        } else {
            error.value = "Could not delete that listing.";
        }
    } finally {
        deletingId.value = null;
    }
};

onMounted(load);
</script>

<template>
    <div class="rounded-2xl border bg-card p-6 shadow-sm">
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-foreground">Listings</h2>
            <span class="text-sm text-muted-foreground">{{ listings.length }} total</span>
        </div>

        <p v-if="isLoading" class="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 class="size-4 animate-spin" /> Loading listings…
        </p>

        <p v-else-if="error" class="mt-4 text-sm text-destructive">{{ error }}</p>

        <p v-else-if="!listings.length" class="mt-4 text-sm text-muted-foreground">
            No listings have been collected yet.
        </p>

        <ul v-else class="mt-4 divide-y">
            <li v-for="listing in listings" :key="listing.id" class="flex items-center gap-4 py-3">
                <div class="min-w-0 flex-1">
                    <a :href="listing.url" target="_blank" rel="noopener noreferrer"
                        class="block truncate font-medium text-foreground hover:underline">
                        {{ listing.name }}
                    </a>
                    <p class="mt-0.5 truncate text-xs text-muted-foreground">
                        <span v-if="listing.city">{{ listing.city }} · </span>{{ formatDate(listing.createdAt) }}
                    </p>
                    <p class="mt-0.5 break-all font-mono text-[11px] text-muted-foreground/70">{{ listing.id }}</p>
                </div>
                <Button variant="ghost" size="icon" class="shrink-0 text-muted-foreground hover:text-destructive"
                    :disabled="deletingId === listing.id" :aria-label="`Delete ${listing.name}`"
                    @click="remove(listing)">
                    <Loader2 v-if="deletingId === listing.id" class="animate-spin" />
                    <Trash2 v-else />
                </Button>
            </li>
        </ul>
    </div>
</template>
