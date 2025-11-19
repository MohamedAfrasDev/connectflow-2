// dialog.tsx
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

/* --------------- Schema --------------- */
const formSchema = z.object({
  variableName: z
    .string()
    .min(1, "Variable name is required")
    .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  credentialId: z.string().min(1, "Credential is required"),
  // caption can be a handlebars template
  caption: z.string().min(1, "Caption is required"),
  // imageUrl may be a remote URL or a Handlebars variable
  imageUrl: z.string().min(1, "Image URL is required"),
  publishType: z.enum(["IMAGE", "VIDEO"]).optional(), // keep for future
});

export type InstagramFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: InstagramFormValues) => void;
  defaultValues?: Partial<InstagramFormValues>;
}

export const InstagramDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  // register credential type for Instagram — adjust enum name if different
  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialsByType(CredentialType.INSTAGRAM /* replace with CredentialType.INSTAGRAM if present */);

  const form = useForm<InstagramFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "instagramPost",
      credentialId: defaultValues.credentialId || "",
      caption: defaultValues.caption || "",
      imageUrl: defaultValues.imageUrl || "",
      publishType: defaultValues.publishType || "IMAGE",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "instagramPost",
        credentialId: defaultValues.credentialId || "",
        caption: defaultValues.caption || "",
        imageUrl: defaultValues.imageUrl || "",
        publishType: defaultValues.publishType || "IMAGE",
      });
    }
  }, [open, defaultValues, form]);

  const varPreview = form.watch("variableName") || "instagramPost";

  const handleSubmit = (values: InstagramFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Instagram (Business) Node</DialogTitle>
          <DialogDescription>
            Post an image or video to an Instagram Business account via the Graph API.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="instagramPost" />
                  </FormControl>
                  <FormDescription>
                    Access the result later with <code>{`{{${varPreview}.postId}}`}</code>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram Credential</FormLabel>
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
                            <SelectValue placeholder="Select credential" />
                          </SelectTrigger>
                          <SelectContent>
                            {credentials?.length ? (
                              credentials.map((cred) => (
                                <SelectItem key={cred.id} value={cred.id}>
                                  <div className="flex items-center gap-2">
                                    <Image src="/logos/instagram.svg" alt="IG" width={16} height={16} />
                                    {cred.name}
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-creds" disabled>
                                No credentials
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

            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caption</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} placeholder="Caption or Handlebars template (e.g. {{api.title}})" />
                  </FormControl>
                  <FormDescription>Supports Handlebars templating.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://example.com/image.jpg or {{api.imageUrl}}" />
                  </FormControl>
                  <FormDescription>
                    Must be a publicly accessible image URL (or a Handlebars variable that resolves to one).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="publishType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publish Type</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IMAGE">Image</SelectItem>
                        <SelectItem value="VIDEO">Video (not implemented)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
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
