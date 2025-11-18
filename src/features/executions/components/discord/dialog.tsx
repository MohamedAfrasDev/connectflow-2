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
  FormDescription,
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
import { CredentialType } from "@/generated/prisma/";
import Image from "next/image";




const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, {
      message: 
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  username: z.string().optional(),
  content: z
  .string()
  .min(1, "Message content is required")
  .max(2000, "Discord messages cannot exceed 2000 characters"),
  webhookUrl: z.string().min(1, "Webhook URL is required"),
});

export type DiscordFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: DiscordFormValues) => void;
  defaultValues?: Partial<DiscordFormValues>;
}

export const DiscordDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {

  const {

    data: credentials,
    isLoading: isLoadingCredentials,
  } = useCredentialsByType(CredentialType.GEMINI);
  const form = useForm<DiscordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      username: defaultValues.username || "",
      content: defaultValues.content || "",
      webhookUrl: defaultValues.webhookUrl || "",
    },
  });

  // Reset when dialog opens (edit mode)
  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
      username: defaultValues.username || "",
      content: defaultValues.content || "",
      webhookUrl: defaultValues.webhookUrl || "",

      });
    }
  }, [open, defaultValues]);

  const varPreview = form.watch("variableName") || "myDiscord";


  const handleSubmit = (values: DiscordFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Discord Configuration</DialogTitle>
          <DialogDescription>
            Configure the Discord webhook setting for this node
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
                    <Input placeholder="myDiscord" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use this name to reference the result in other nodes:
                    <span className="font-mono ml-1 text-sm text-primary">
                      {`{{${varPreview}.text}}`}
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => <FormItem>
                <FormLabel>
                  Webhook URL
                </FormLabel>
                <FormControl>
                  <Input
                  placeholder="https://discord.com/api/webhooks/..."
                  {...field}
                  />
                </FormControl>
                <FormMessage />
                <FormDescription>
                Get this from Discrod: Channel Settings ⮕ Integrations ⮕ Webhooks

                </FormDescription>
              </FormItem>}
            />


            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="You are a helpful assistant."
                      className="font-mono min-h-[80px]"
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Set the behaviour of the assistant. Use {"{{variables}}"} for simple values or {"{{json variables}}"} to stringify objects.
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />
     <FormField
              control={form.control}
              name="username"
              render={({ field }) => <FormItem>
                <FormLabel>
                  Bot Username (Optional)
                </FormLabel>
                <FormControl>
                  <Input
                  placeholder="Workflow Bot"
                  {...field}
                  />
                </FormControl>
                <FormMessage />
                <FormDescription>
                Override the webhook's default username

                </FormDescription>
              </FormItem>}
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
