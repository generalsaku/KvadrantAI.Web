<script setup lang="ts">
import AdministrationListings from "./AdministrationListings.vue";
import AdministrationUsers from "./AdministrationUsers.vue";
</script>

<template>
    <section class="container py-16">
        <div class="mx-auto flex max-w-3xl flex-col gap-6">
            <div>
                <p class="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
                    Administration
                </p>
                <h1 class="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                    Restricted control surface
                </h1>
                <p class="mt-3 max-w-2xl text-muted-foreground">
                    Review collected listings and the users behind them. Expand a user to see their orders. Deletes are
                    immediate and apply against the API.
                </p>
            </div>

            <AdministrationListings />
            <AdministrationUsers />
        </div>
    </section>
</template>
