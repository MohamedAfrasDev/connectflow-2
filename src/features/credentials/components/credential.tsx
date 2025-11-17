"use client";

import { CredentialType } from "@/generated/prisma/enums";
import { useRouter } from "next/navigation";
import {
  useCreateCredential,
  useSuspenseCredential,
  useUpdateCredential,
} from "../hooks/use-credentials";
import { useUpdgradeModal } from "@/hooks/use-updgrade-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/* ---------------- ZOD SCHEMA ---------------- */
/* ---------------- ZOD SCHEMA ---------------- */
const formSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(CredentialType),
    value: z.string().optional(),
    // FIX: Allow empty strings so hidden fields don't block validation
    email: z.union([z.string().email(), z.literal("")]).optional(), 
    appPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === CredentialType.GMAIL) {
      // FIX: Explicitly check for valid email logic here since we relaxed the base rule
      if (!data.email || data.email === "") {
        ctx.addIssue({ path: ["email"], message: "Email is required for Gmail", code: "custom" });
      }
      
      if (!data.appPassword || data.appPassword.length < 10) {
        ctx.addIssue({
          path: ["appPassword"],
          message: "App password is required and must be at least 10 characters",
          code: "custom",
        });
      }
    } else {
      if (!data.value || data.value.trim().length < 1) {
        ctx.addIssue({ path: ["value"], message: "API key is required for this type", code: "custom" });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

/* ---------------- CREDENTIAL OPTIONS ---------------- */
const credentialTypeOptions = [
  { value: CredentialType.OPENAI, label: "OpenAI", logo: "/logos/openai.svg" },
  { value: CredentialType.GEMINI, label: "Gemini", logo: "/logos/gemini.svg" },
  { value: CredentialType.ANTHROPIC, label: "Anthropic", logo: "/logos/anthropic.svg" },
  { value: CredentialType.DEEPSEEK, label: "DeepSeek", logo: "/logos/deepseek.svg" },
  { value: CredentialType.PERPLEXITY, label: "Perplexity", logo: "/logos/perplexity.svg" },
  { value: CredentialType.GMAIL, label: "Gmail", logo: "/logos/gmail.svg" },
];

/* ---------------- CREDENTIAL FORM ---------------- */
interface CredentialFormProps {
  initialData?: {
    id?: string;
    name: string;
    type: CredentialType;
    value?: string;
    email?: string;
    appPassword?: string;
  };
}

export const CredentialForm = ({ initialData }: CredentialFormProps) => {
  const router = useRouter();
  const createCredential = useCreateCredential();
  const updateCredential = useUpdateCredential();
  const { handleError, modal } = useUpdgradeModal();
  const isEdit = !!initialData?.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      type: CredentialType.OPENAI,
      value: "",
      email: "",
      appPassword: "",
    },
  });

  const selectedType = form.watch("type");

  const onSubmit = async (values: FormValues) => {
    try {
      const payload =
        values.type === CredentialType.GMAIL
          ? { name: values.name, type: values.type, email: values.email, appPassword: values.appPassword }
          : { name: values.name, type: values.type, value: values.value?.trim() || "" };

      if (isEdit && initialData?.id) {
        await updateCredential.mutateAsync({ id: initialData.id, ...payload });
      } else {
        const result = await createCredential.mutateAsync(payload);
        router.push(`/credentials/${result.id}`);
      }
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <>
      {modal}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Credential" : "Create Credential"}</CardTitle>
          <CardDescription>
            {isEdit ? "Update your credential details" : "Add a new credential to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My API key" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {credentialTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <Image src={option.logo} alt={option.label} width={16} height={16} />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* API Key */}
              {selectedType !== CredentialType.GMAIL && (
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="sk-..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Gmail */}
              {selectedType === CredentialType.GMAIL && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gmail Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your@gmail.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="appPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>App Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="16-digit app password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createCredential.isPending || updateCredential.isPending}
                >
                  {isEdit
                    ? updateCredential.isPending
                      ? "Updating..."
                      : "Update"
                    : createCredential.isPending
                    ? "Creating..."
                    : "Create"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/credentials" prefetch>
                    Cancel
                  </Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

/* ---------------- CREDENTIAL VIEW ---------------- */
interface CredentialViewProps {
  credentialId: string;
}

export const CredentialView = ({ credentialId }: CredentialViewProps) => {
  const { data: credential } = useSuspenseCredential(credentialId);

  if (!credential) return <p>Loading...</p>;

  const initialData = {
    id: credential.id,
    name: credential.name,
    type: credential.type,
    value: credential.value ?? "",
    email: credential.email ?? "",
    appPassword: credential.appPassword ?? "",
  };

  return <CredentialForm initialData={initialData} />;
};
