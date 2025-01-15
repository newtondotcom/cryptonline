<script setup lang="ts">
import { createKeybindingsHandler } from "tinykeys";

let handler = createKeybindingsHandler({
    "$mod+KeyD": (event: InputEvent) => {
        event.preventDefault();
        const pastedContent = navigator.clipboard.readText();
        console.log(pastedContent);
    },
});

onMounted(() => {
    window.addEventListener("keydown", handler);
});

const password = ref("");
const decryptedData = ref("");
const salt = ref("");
const iv = ref("");
const ciphertext = ref("");
const tag = ref("");

const decrypt = async () => {
    if (
        !salt.value ||
        !iv.value ||
        !ciphertext.value ||
        !tag.value ||
        !password.value
    ) {
        alert("All fields are required for decryption.");
        return;
    }

    try {
        const data = await $fetch("/api/decrypt", {
            method: "POST",
            body: {
                encryptedData: {
                    salt: salt.value,
                    iv: iv.value,
                    ciphertext: ciphertext.value,
                    tag: tag.value,
                },
                password: password.value,
            },
        });

        decryptedData.value = data?.decryptedData;
    } catch (error) {
        console.error("Decryption failed:", error);
        alert("Decryption failed. Check the console for details.");
    }
};
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle>Decrypt</CardTitle>
            <CardDescription>
                Manually enter the decryption parameters to retrieve the
                original critical data.
            </CardDescription>
        </CardHeader>
        <CardContent class="space-y-2">
            <div class="space-y-1">
                <Label for="salt">Salt</Label>
                <Input
                    id="salt"
                    v-model="salt"
                    placeholder="Enter salt (hex)"
                />
            </div>
            <div class="space-y-1">
                <Label for="iv">Initialization Vector (IV)</Label>
                <Input id="iv" v-model="iv" placeholder="Enter IV (hex)" />
            </div>
            <div class="space-y-1">
                <Label for="ciphertext">Ciphertext</Label>
                <Input
                    id="ciphertext"
                    v-model="ciphertext"
                    placeholder="Enter ciphertext (hex)"
                />
            </div>
            <div class="space-y-1">
                <Label for="tag">Authentication Tag</Label>
                <Input id="tag" v-model="tag" placeholder="Enter tag (hex)" />
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
            <Button @click="decrypt">Decrypt</Button>
        </CardFooter>
        <CardContent v-if="decryptedData" class="mt-4">
            <p class="text-sm">Decrypted Mnemonic:</p>
            <pre class="text-xs bg-gray-100 p-2 rounded">{{
                decryptedData
            }}</pre>
        </CardContent>
    </Card>
</template>
