<script setup lang="ts">
import { useToast } from "@/components/ui/toast/use-toast";
const { toast } = useToast();
const password = ref("");
const decryptedData = ref("");
const salt = ref("");
const iv = ref("");
const ciphertext = ref("");
const tag = ref("");
const checkPastedContent = (field: string) => {
    console.log(field);
    try {
        const pastedData = JSON.parse(field);

        if (
            typeof pastedData === "object" &&
            "iv" in pastedData &&
            "salt" in pastedData &&
            "ciphertext" in pastedData &&
            "tag" in pastedData
        ) {
            iv.value = pastedData.iv;
            salt.value = pastedData.salt;
            ciphertext.value = pastedData.ciphertext;
            tag.value = pastedData.tag;
            toast({
                title: "🔗 Pasted",
                description:
                    "The pasted content has been successfully parsed and filled into the respective fields.",
            });
        }
    } catch (error) {
        console.warn(
            "Pasted content is not valid JSON or does not match the expected structure.",
        );
    }
};

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
                    @input="checkPastedContent($event.target.value)"
                />
            </div>
            <div class="space-y-1">
                <Label for="iv">Initialization Vector (IV)</Label>
                <Input
                    id="iv"
                    v-model="iv"
                    placeholder="Enter IV (hex)"
                    @input="checkPastedContent($event.target.value)"
                />
            </div>
            <div class="space-y-1">
                <Label for="ciphertext">Ciphertext</Label>
                <Input
                    id="ciphertext"
                    v-model="ciphertext"
                    placeholder="Enter ciphertext (hex)"
                    @input="checkPastedContent($event.target.value)"
                />
            </div>
            <div class="space-y-1">
                <Label for="tag">Authentication Tag</Label>
                <Input
                    id="tag"
                    v-model="tag"
                    placeholder="Enter tag (hex)"
                    @input="checkPastedContent($event.target.value)"
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
