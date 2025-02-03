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

const valueCopied = ref<boolean>(false);
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
                    v-on:keyup.enter="encrypt"
                />
            </div>
        </CardContent>
        <CardFooter>
            <div
                v-if="encryptedData.ciphertext"
                class="flex flex-row justify-between items-center w-full"
            >
                <Badge variant="secondary"> Encrypted </Badge>
                <Button
                    @click="copy"
                    :class="{ 'shadow-green-200 ': valueCopied }"
                >
                    <Copy v-if="!valueCopied" />
                    <Check v-else />
                </Button>
            </div>
            <Button v-else @click="encrypt">Encrypt</Button>
        </CardFooter>
    </Card>
</template>
