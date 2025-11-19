"use client";

import { CredentialType } from "@/generated/prisma";
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
const formSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(CredentialType),
    value: z.string().optional(),
    email: z.string().optional(),
    appPassword: z.string().optional(),
    // SMTP fields
    smtpHost: z.string().optional(),
    smtpPort: z.number().optional(),
    smtpUser: z.string().optional(),
    smtpPassword: z.string().optional(),
    secure: z.boolean().optional(),
    instagramBusinessId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === CredentialType.GMAIL) {
      if (!data.email) ctx.addIssue({ path: ["email"], message: "Email is required for Gmail", code: "custom" });
      if (!data.appPassword || data.appPassword.length < 10) {
        ctx.addIssue({ path: ["appPassword"], message: "App password required (min 10 chars)", code: "custom" });
      }
    } else if (data.type === CredentialType.CustomMail) {
      if (!data.smtpHost) ctx.addIssue({ path: ["smtpHost"], message: "SMTP host required", code: "custom" });
      if (!data.smtpPort) ctx.addIssue({ path: ["smtpPort"], message: "SMTP port required", code: "custom" });
      if (!data.smtpUser) ctx.addIssue({ path: ["smtpUser"], message: "SMTP username required", code: "custom" });
      if (!data.smtpPassword) ctx.addIssue({ path: ["smtpPassword"], message: "SMTP password required", code: "custom" });
    } else {
      // Only API-type credentials
      if (!data.value || data.value.trim().length < 1) {
        ctx.addIssue({ path: ["value"], message: "API key required", code: "custom" });
      }
    }
    if (data.type === CredentialType.INSTAGRAM) {
      if (!data.value) ctx.addIssue({ path: ["value"], message: "Access token is required for Instagram", code: "custom" });
      if (!data.instagramBusinessId) ctx.addIssue({ path: ["instagramBusinessId"], message: "Instagram Business ID is required", code: "custom" });
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
  { value: CredentialType.CustomMail, label: "Custom Mail", logo: "/logos/email.svg" },
  { value: CredentialType.INSTAGRAM, label: "Instagram (Business)", logo: "/logos/instagram.svg" },

];

/* ---------------- CREDENTIAL FORM ---------------- */
interface CredentialFormProps {
  initialData?: Partial<FormValues> & { id?: string }; // Use Partial<FormValues> to accept all fields
}

export const CredentialForm = ({ initialData }: CredentialFormProps) => {
  const router = useRouter();
  const createCredential = useCreateCredential();
  const updateCredential = useUpdateCredential();
  const { handleError, modal } = useUpdgradeModal();
  const isEdit = !!initialData?.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    // --- UPDATED ---
    // Pass all fields from initialData
    // AND provide default values for all fields in the schema
    defaultValues: initialData || {
      name: "",
      type: CredentialType.OPENAI,
      value: "",
      email: "",
      appPassword: "",
      smtpHost: "",
      smtpPort: 587,
      smtpUser: "",
      smtpPassword: "",
      secure: true,
      instagramBusinessId: "",
    },
  });

  const selectedType = form.watch("type");

  const onSubmit = async (values: FormValues) => {
    try {
      let payload: any;

      if (values.type === CredentialType.GMAIL) {
        payload = {
          name: values.name,
          type: values.type,
          email: values.email,
          appPassword: values.appPassword,
        };
      } else if (values.type === CredentialType.CustomMail) {
        payload = {
          name: values.name,
          type: values.type,
          smtpHost: values.smtpHost,
          smtpPort: values.smtpPort,
          smtpUser: values.smtpUser,
          smtpPassword: values.smtpPassword,
          secure: values.secure,
        };
      }else if (values.type === CredentialType.INSTAGRAM) {
        payload = {
          name: values.name,
          type: values.type,
          value: JSON.stringify({
            accessToken: values.value?.trim() || "",
            instagramBusinessId: values.instagramBusinessId?.trim() || "",
          }),
        };
      }
       else {
        payload = {
          name: values.name,
          type: values.type,
          value: values.value?.trim() || "",
        };
      }


      if (isEdit && initialData?.id) {
        await updateCredential.mutateAsync({ id: initialData.id, ...payload });
        // Optionally, show a success toast or message here
        router.push("/credentials"); // Go back to list after update
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
              {/* Type */}
           
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isEdit}>
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

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Personal Key" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
   {selectedType === CredentialType.INSTAGRAM && (
                <>
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Token</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter long-lived access token" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="instagramBusinessId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram Business ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Instagram Business Account ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* API Key Fields */}
              {selectedType !== CredentialType.GMAIL && selectedType !== CredentialType.CustomMail && selectedType !== CredentialType.INSTAGRAM && (
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="sk-..." {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Gmail Fields */}
              {selectedType === CredentialType.GMAIL && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gmail Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your@gmail.com" {...field} value={field.value ?? ""} />
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
                          <Input type="password" placeholder="16-digit app password" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* CustomMail SMTP Fields */}
              {selectedType === CredentialType.CustomMail && (
                <>
                  <FormField
                    control={form.control}
                    name="smtpHost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Host</FormLabel>
                        <FormControl>
                          <Input placeholder="smtp.example.com" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="smtpPort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Port</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="587"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(Number(e.target.value))} // convert string to number
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="smtpUser"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Username</FormLabel>
                        <FormControl>
                          <Input placeholder="user@example.com" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="smtpPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Use TLS/SSL</FormLabel>
                        <FormControl>
                          <Select value={field.value ? "true" : "false"} onValueChange={v => field.onChange(v === "true")}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
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

  // --- UPDATED ---
  // We must map ALL fields from the query to the form,
  // otherwise they will be "undefined" when editing.
  const initialData = {
    id: credential.id,
    name: credential.name,
    type: credential.type,
    email: credential.email ?? "",
    appPassword: credential.appPassword ?? "",

    // Pass the SMTP fields to the form
    smtpHost: credential.smtpHost ?? "",
    smtpPort: credential.smtpPort ?? 587,
    smtpUser: credential.smtpUser ?? "",
    smtpPassword: credential.smtpPassword ?? "",
    secure: credential.secure ?? true,
    value: credential.type === CredentialType.INSTAGRAM && credential.value
    ? JSON.parse(credential.value).accessToken
    : credential.value ?? "",
  instagramBusinessId: credential.type === CredentialType.INSTAGRAM && credential.value
    ? JSON.parse(credential.value).instagramBusinessId
    : "",
  };

  return <CredentialForm initialData={initialData} />;
};