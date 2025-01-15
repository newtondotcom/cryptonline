<script setup lang="ts">
import { Copy, Check } from "lucide-vue-next";
const criticalData = ref("");
const password = ref("");
const encryptedData = ref<{
    iv: string;
    salt: string;
    ciphertext: string;
    tag: string;
}>({
    iv: "",
    salt: "",
    ciphertext: "",
    tag: "",
});
const valueCopied = ref(false);

const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(encryptedData.value));
    valueCopied.value = true;
    setTimeout(() => {
        valueCopied.value = false;
    }, 200);
};

const encrypt = async () => {
    if (!criticalData.value || !password.value) {
        alert("data and password are required.");
        return;
    }

    try {
        const data = await $fetch("/api/encrypt", {
            method: "POST",
            body: {
                criticalData: criticalData.value,
                password: password.value,
            },
        });
        encryptedData.value = data?.encryptedData;
    } catch (error) {
        console.error("Encryption failed:", error);
        alert("Encryption failed. Check the console for details.");
    }
};
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle>Crypt</CardTitle>
            <CardDescription>
                Encrypt your critical data using a password.
            </CardDescription>
        </CardHeader>
        <CardContent class="space-y-2">
            <div class="space-y-1">
                <Label for="data">Data</Label>
                <Input
                    id="data"
                    v-model="criticalData"
                    placeholder="Enter data"
                />
            </div>
            <div class="space-y-1">
                <Label for="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    v-model="password"
                    placeholder="Enter password"
                />
            </div>
        </CardContent>
        <CardFooter>
            <Button @click="encrypt">Encrypt</Button>
        </CardFooter>
        <CardContent v-if="encryptedData.ciphertext" class="mt-4">
            <pre
                class="text-xs bg-gray-100 dark:bg-gray-500 dark:text-black p-2 rounded-md flex flex-row justify-between items-center"
            >
                <p>{{ encryptedData }}</p>
                <Button @click="copy"
                :class="{ 'shadow-green-200 ': valueCopied }">
                <Copy v-if="!valueCopied" />
                <Check v-else/>
                </Button>
            </pre>
        </CardContent>
    </Card>
</template>
