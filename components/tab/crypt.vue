<script setup lang="ts">
import { Copy, Check } from "lucide-vue-next";
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

const formSchema = toTypedSchema(
    z.object({
        data: z.string().nonempty("Data is required"),
        password: z.string().min(4, "Password must be at least 4 characters"),
    }),
);
const form = useForm({
    validationSchema: formSchema,
});

const { value: criticalData, errorMessage: dataError } = useField("data");
const { value: password, errorMessage: passwordError } = useField("password");

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

const onSubmit = form.handleSubmit(async (values) => {
    try {
        const data = await $fetch("/api/encrypt", {
            method: "POST",
            body: {
                criticalData: values.data,
                password: values.password,
            },
        });
        encryptedData.value = data?.encryptedData;
    } catch (error) {
        console.error("Encryption failed:", error);
        alert("Encryption failed. Check the console for details.");
    }
});
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle>Crypt</CardTitle>
            <CardDescription>
                Encrypt your critical data using a password.
            </CardDescription>
        </CardHeader>
        <form @submit="onSubmit">
            <CardContent class="space-y-2">
                <div class="space-y-1">
                    <Label for="data">Data</Label>
                    <Input
                        id="data"
                        v-model="criticalData"
                        placeholder="Enter data"
                    />
                    <p class="text-red-500 text-sm" v-if="dataError">
                        {{ dataError }}
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
            <CardFooter>
                <div
                    v-if="encryptedData.ciphertext"
                    class="flex flex-row justify-between items-center w-full"
                >
                    <Badge variant="secondary"> Encrypted </Badge>
                    <Button
                        type="button"
                        @click="copy"
                        :class="{ 'shadow-green-200 ': valueCopied }"
                    >
                        <Copy v-if="!valueCopied" />
                        <Check v-else />
                    </Button>
                </div>
                <Button type="submit" v-else>Encrypt</Button>
            </CardFooter>
        </form>
    </Card>
</template>
