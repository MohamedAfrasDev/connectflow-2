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
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
@/generated/prisma"

// LUMA IMAGE-ONLY SCHEMA
const formSchema = z.object({
  variableName: z
    .string()
    .min(1, "Variable name is required")
    .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, {
      message: "Variable name must start with a letter or underscore",
    }),
  apiCredentialId: z.string().optional(),
  imagePrompt: z.string().min(1, "Image prompt is required"),
  imageCount: z.string().optional(),
  imageSize: z.string().optional(),
});

export type LumaFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: LumaFormValues) => void;
  defaultValues?: Partial<LumaFormValues>;
}

export const LumaDialog = ({ open, onOpenChange, onSubmit, defaultValues = {} }: Props) => {
  const { data: credentials, isLoading: isLoadingCredentials } = useCredentialsByType(CredentialType.LUMA);

  const form = useForm<LumaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      apiCredentialId: defaultValues.apiCredentialId || "",
      imagePrompt: defaultValues.imagePrompt || "",
      imageCount: defaultValues.imageCount || "1",
      imageSize: defaultValues.imageSize || "1024x1024",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        apiCredentialId: defaultValues.apiCredentialId || "",
        imagePrompt: defaultValues.imagePrompt || "",
        imageCount: defaultValues.imageCount || "1",
        imageSize: defaultValues.imageSize || "1024x1024",
      });
    }
  }, [open, defaultValues]);

  const varPreview = form.watch("variableName") || "myLuma";

  const handleSubmit = (values: LumaFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Luma Image Generation</DialogTitle>
          <DialogDescription>
            Configure image generation settings for Luma.
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
                    <Input placeholder="myLuma" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* LUMA API CREDENTIAL */}
            <FormField
              control={form.control}
              name="apiCredentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Luma API Credential</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingCredentials || !credentials?.length}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a Credential" />
                      </SelectTrigger>
                      <SelectContent>
                        {credentials?.map((cred) => (
                          <SelectItem key={cred.id} value={cred.id}>
                            {cred.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* IMAGE PROMPT */}
            <FormField
              control={form.control}
              name="imagePrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Prompt</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A cinematic landscape with neon lights..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

           
            {/* IMAGE SIZE */}
            <FormField
              control={form.control}
              name="imageSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Size</FormLabel>
                  <FormControl>
                    <Input placeholder="1024x1024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="w-full">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
