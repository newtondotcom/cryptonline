<template>
    <div class="absolute top-0 right-0">
        <label
            class="relative cursor-pointer py-2 px-6"
            for="light-switch"
            @click="toggleMode"
        >
            <Sun class="w-5 h-5 dark:hidden" />
            <Moon class="w-5 h-5 hidden dark:block" />
            <span class="sr-only">Switch to light / dark version</span>
        </label>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Sun, Moon } from "lucide-vue-next";

const colorMode = ref<boolean>(
    window.matchMedia("(prefers-color-scheme: dark)").matches,
);

const toggleMode = () => {
    document.documentElement.classList.toggle("dark");
};
</script>

<style scoped>
html {
    transition:
        background-color 0.3s,
        color 0.3s;
}
</style>
