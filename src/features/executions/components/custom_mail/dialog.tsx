"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { CredentialType } from "@/generated/prisma/";

/* ---------------- FORM VALIDATION ---------------- */
const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  credentialId: z.string().min(1, "Credential is required"),
  to: z
    .string()
    .min(1, "Recipient is required")
    .refine(
      (val) => val.includes("@") || (val.includes("{{") && val.includes("}}")),
      {
        message:
          "Must be a valid email or a Handlebars variable (e.g., {{api.email}})",
      }
    ),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
});

export type CustomMailFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: CustomMailFormValues) => void;
  defaultValues?: Partial<CustomMailFormValues>;
}

export const CustomMailDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialsByType(CredentialType.CustomMail);

  const form = useForm<CustomMailFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      credentialId: defaultValues.credentialId || "",
      to: defaultValues.to || "",
      cc: defaultValues.cc || "",
      bcc: defaultValues.bcc || "",
      subject: defaultValues.subject || "",
      body: defaultValues.body || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        credentialId: defaultValues.credentialId || "",
        to: defaultValues.to || "",
        cc: defaultValues.cc || "",
        bcc: defaultValues.bcc || "",
        subject: defaultValues.subject || "",
        body: defaultValues.body || "",
      });
    }
  }, [open, defaultValues, form]);

  const varPreview = form.watch("variableName") || "CustomMailResult";

  const handleSubmit = (values: CustomMailFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Custom Email Node</DialogTitle>
          <DialogDescription>
            Configure the CustomMail node to send emails via your SMTP or API.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Variable Name */}
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="CustomMailResult" {...field} />
                  </FormControl>
                  <FormDescription>
                    Reference this output: <code>{`{{${varPreview}.success}}`}</code>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Credential Selector */}
            <FormField
              control={form.control}
              name="credentialId"
              render={() => (
                <FormItem>
                  <FormLabel>CustomMail Credential</FormLabel>
                  <FormControl>
                    <Controller
                      control={form.control}
                      name="credentialId"
                      render={({ field: controllerField }) => (
                        <Select
                          value={controllerField.value || undefined}
                          onValueChange={controllerField.onChange}
                          disabled={isLoadingCredentials || !credentials?.length}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a Credential" />
                          </SelectTrigger>
                          <SelectContent>
                            {credentials?.length ? (
                              credentials.map((cred) => (
                                <SelectItem key={cred.id} value={cred.id}>
                                  <div className="flex items-center gap-2">
                                    <Image
                                      src="/logos/email.svg"
                                      alt="CustomMail"
                                      width={16}
                                      height={16}
                                    />
                                    {cred.name}
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-credentials" disabled>
                                No saved credentials
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* To */}
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To</FormLabel>
                  <FormControl>
                    <Input placeholder="receiver@example.com or {{api.email}}" {...field} />
                  </FormControl>
                  <FormDescription>
                    Supports Handlebars variables
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CC */}
            <FormField
              control={form.control}
              name="cc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CC</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
                  </FormControl>
                  <FormDescription>Optional, supports Handlebars variables</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* BCC */}
            <FormField
              control={form.control}
              name="bcc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BCC</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
                  </FormControl>
                  <FormDescription>Optional, supports Handlebars variables</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subject */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Your order is confirmed" {...field} />
                  </FormControl>
                  <FormDescription>
                    Supports Handlebars variables
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Body */}
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Textarea rows={6} {...field} />
                  </FormControl>
                  <FormDescription>
                    Supports Handlebars variables
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="md:col-span-2">
              <Button type="submit" className="w-full">
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
