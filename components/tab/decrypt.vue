<script setup lang="ts">
import { useToast } from "@/components/ui/toast/use-toast";
import { ref } from "vue";
import { Copy, Check } from "lucide-vue-next";

const { toast } = useToast();

const password = ref("");
const decryptedData = ref("");
const salt = ref("");
const iv = ref("");
const ciphertext = ref("");
const tag = ref("");

let saltStored: string;
let ivStored: string;
let ciphertextStored: string;
let tagStored: string;

const valueCopied = ref<boolean>(false);
const copy = () => {
    navigator.clipboard.writeText(decryptedData.value);
    valueCopied.value = true;
    setTimeout(() => {
        valueCopied.value = false;
    }, 200);
};

const checkPastedContent = (field: string) => {
    try {
        const pastedData = JSON.parse(field);

        if (
            typeof pastedData === "object" &&
            "iv" in pastedData &&
            "salt" in pastedData &&
            "ciphertext" in pastedData &&
            "tag" in pastedData
        ) {
            // Update reactive refs
            iv.value = pastedData.iv;
            salt.value = pastedData.salt;
            ciphertext.value = pastedData.ciphertext;
            tag.value = pastedData.tag;

            ivStored = pastedData.iv;
            saltStored = pastedData.salt;
            ciphertextStored = pastedData.ciphertext;
            tagStored = pastedData.tag;

            toast({
                title: "🔗 Pasted",
                description:
                    "The pasted content has been successfully parsed and filled into the respective fields.",
            });
        } else {
            console.warn("Invalid JSON structure for decryption fields.");
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
        toast({
            title: "🚨 Missing Fields",
            description: "All fields are required for decryption.",
            variant: "destructive",
        });
        return;
    }

    try {
        const data = await $fetch("/api/decrypt", {
            method: "POST",
            body: {
                encryptedData: {
                    salt: saltStored || salt.value,
                    iv: ivStored || iv.value,
                    ciphertext: ciphertextStored || ciphertext.value,
                    tag: tagStored || tag.value,
                },
                password: password.value,
            },
        });

        decryptedData.value = data?.decryptedMnemonic;

        toast({
            title: "🔓 Decrypted",
            description: "The data has been successfully decrypted.",
        });
    } catch (error) {
        toast({
            title: "🚨 Decryption Failed",
            description: "Decryption failed on the server side.",
            variant: "destructive",
        });
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
                    v-on:keyup.enter="decrypt"
                />
            </div>
        </CardContent>
        <CardFooter>
            <Button @click="decrypt">Decrypt</Button>
        </CardFooter>
        <CardContent v-if="decryptedData" class="mt-4">
            <div
                v-if="decryptedData"
                class="flex flex-row justify-between items-center w-full"
            >
                <Badge variant="secondary"> Decrypted </Badge>
                <Button
                    @click="copy"
                    :class="{ 'shadow-green-200 ': valueCopied }"
                >
                    <Copy v-if="!valueCopied" />
                    <Check v-else />
                </Button>
            </div>
            <Button v-else @click="decrypt">Decrypt</Button>
        </CardContent>
    </Card>
</template>
