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
import { CredentialType } from "@/generated/prisma/enums";

/* ------------------------- FORM VALIDATION ------------------------- */
const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  credentialId: z.string().min(1, "Credential is required"),
  to: z.string().email("Must be a valid email"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
});

export type GmailFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: GmailFormValues) => void;
  defaultValues?: Partial<GmailFormValues>;
}

export const GmailDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialsByType(CredentialType.GMAIL);

  const form = useForm<GmailFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      credentialId: defaultValues.credentialId || "",
      to: defaultValues.to || "",
      subject: defaultValues.subject || "",
      body: defaultValues.body || "",
    },
  });

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        credentialId: defaultValues.credentialId || "",
        to: defaultValues.to || "",
        subject: defaultValues.subject || "",
        body: defaultValues.body || "",
      });
    }
  }, [open, defaultValues]);

  const varPreview = form.watch("variableName") || "gmailResult";

  const handleSubmit = (values: GmailFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gmail Configuration</DialogTitle>
          <DialogDescription>
            Select a Gmail credential and configure the email
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* VARIABLE NAME */}
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="gmailResult" {...field} />
                  </FormControl>
                  <FormDescription>
                    Reference this output in other nodes:{" "}
                    <code>{`{{${varPreview}.success}}`}</code>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CREDENTIAL SELECT */}
            <FormField
              control={form.control}
              name="credentialId"
              render={() => (
                <FormItem>
                  <FormLabel>Gmail Credential</FormLabel>
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
                            {credentials && credentials.length > 0 ? (
                              credentials.map((credential) => (
                                <SelectItem key={credential.id} value={credential.id}>
                                  <div className="flex items-center gap-2">
                                    <Image
                                      src="/logos/gmail.svg"
                                      alt="Gmail"
                                      width={16}
                                      height={16}
                                    />
                                    {credential.name}
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

            {/* TO */}
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Email</FormLabel>
                  <FormControl>
                    <Input placeholder="receiver@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SUBJECT */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Your order is confirmed" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* BODY */}
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Textarea rows={6} {...field} />
                  </FormControl>
                  <FormDescription>
                    Supports Handlebars variables: {"{{variableName.property}}"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
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
