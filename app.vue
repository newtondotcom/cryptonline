<template>
    <div class="flex flex-col min-h-screen items-center justify-center">
        <Tabs default-value="crypt" class="w-[500px]">
            <TabsList class="grid w-full grid-cols-2">
                <TabsTrigger value="crypt">Crypt</TabsTrigger>
                <TabsTrigger value="decrypt">Decrypt</TabsTrigger>
            </TabsList>

            <TabsContent value="crypt"><TabCrypt /> </TabsContent>

            <TabsContent value="decrypt">
                <TabDecrypt />
            </TabsContent>
        </Tabs>
    </div>
    <Toaster />
</template>

<script setup lang="ts">
import Toaster from "@/components/ui/toast/Toaster.vue";
</script>
