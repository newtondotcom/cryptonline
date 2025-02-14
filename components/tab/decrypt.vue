<script setup lang="ts">
import { useToast } from "@/components/ui/toast/use-toast";
import { Copy, Check } from "lucide-vue-next";
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

const { toast } = useToast();

const formSchema = toTypedSchema(
    z.object({
        salt: z.string().nonempty("Salt is required"),
        iv: z.string().nonempty("IV is required"),
        ciphertext: z.string().nonempty("Ciphertext is required"),
        tag: z.string().nonempty("Tag is required"),
        password: z.string().min(4, "Password must be at least 4 characters"),
    }),
);
const form = useForm({
    validationSchema: formSchema,
});

const { value: salt, errorMessage: saltError } = useField("salt");
const { value: iv, errorMessage: ivError } = useField("iv");
const { value: ciphertext, errorMessage: ciphertextError } =
    useField("ciphertext");
const { value: tag, errorMessage: tagError } = useField("tag");
const { value: password, errorMessage: passwordError } = useField("password");

const decryptedData = ref("");
const valueCopied = ref(false);

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
            salt.value = pastedData.salt;
            iv.value = pastedData.iv;
            ciphertext.value = pastedData.ciphertext;
            tag.value = pastedData.tag;

            toast({
                title: "🔗 Pasted",
                description:
                    "The pasted content has been successfully parsed and filled into the respective fields.",
            });
        }
    } catch {
        console.warn("Invalid JSON structure.");
    }
};

const checkStringIsJsonAndExtract = (str: string, valueToExtract: string) => {
    try {
        const dictionnay = JSON.parse(str);
        return dictionnay[valueToExtract];
    } catch (e) {
        return str;
    }
};

const onSubmit = form.handleSubmit(async (values) => {
    try {
        const data = await $fetch("/api/decrypt", {
            method: "POST",
            body: {
                encryptedData: {
                    salt: checkStringIsJsonAndExtract(values.salt, "salt"),
                    iv: checkStringIsJsonAndExtract(values.iv, "iv"),
                    ciphertext: checkStringIsJsonAndExtract(
                        values.ciphertext,
                        "ciphertext",
                    ),
                    tag: checkStringIsJsonAndExtract(values.tag, "tag"),
                },
                password: values.password,
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
});
</script>

<template>
    <Card class="h-[600px]">
        <CardHeader>
            <CardTitle>Decrypt</CardTitle>
            <CardDescription
                >Manually enter the decryption parameters to retrieve the
                original critical data.</CardDescription
            >
        </CardHeader>
        <form @submit="onSubmit">
            <CardContent class="space-y-2">
                <div class="space-y-1">
                    <Label for="salt">Salt</Label>
                    <Input
                        id="salt"
                        v-model="salt"
                        placeholder="Enter salt (hex)"
                        @input="checkPastedContent($event.target.value)"
                    />
                    <p class="text-red-500 text-sm" v-if="saltError">
                        {{ saltError }}
                    </p>
                </div>
                <div class="space-y-1">
                    <Label for="iv">Initialization Vector (IV)</Label>
                    <Input
                        id="iv"
                        v-model="iv"
                        placeholder="Enter IV (hex)"
                        @input="checkPastedContent($event.target.value)"
                    />
                    <p class="text-red-500 text-sm" v-if="ivError">
                        {{ ivError }}
                    </p>
                </div>
                <div class="space-y-1">
                    <Label for="ciphertext">Ciphertext</Label>
                    <Input
                        id="ciphertext"
                        v-model="ciphertext"
                        placeholder="Enter ciphertext (hex)"
                        @input="checkPastedContent($event.target.value)"
                    />
                    <p class="text-red-500 text-sm" v-if="ciphertextError">
                        {{ ciphertextError }}
                    </p>
                </div>
                <div class="space-y-1">
                    <Label for="tag">Authentication Tag</Label>
                    <Input
                        id="tag"
                        v-model="tag"
                        placeholder="Enter tag (hex)"
                        @input="checkPastedContent($event.target.value)"
                    />
                    <p class="text-red-500 text-sm" v-if="tagError">
                        {{ tagError }}
                    </p>
                </div>
                <div class="space-y-1">
                    <Label for="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        v-model="password"
                        placeholder="Enter password"
                    />
                    <p class="text-red-500 text-sm" v-if="passwordError">
                        {{ passwordError }}
                    </p>
                </div>
            </CardContent>
            <CardFooter class="mt-4">
                <Button v-if="!decryptedData" type="submit">Decrypt</Button>
                <div
                    v-else
                    class="flex flex-row justify-between items-center w-full"
                >
                    <Badge variant="secondary"> Decrypted </Badge>
                    <Button
                        type="button"
                        @click="copy"
                        :class="{ 'shadow-green-200 ': valueCopied }"
                    >
                        <Copy v-if="!valueCopied" />
                        <Check v-else />
                    </Button>
                </div>
            </CardFooter>
        </form>
    </Card>
</template>
