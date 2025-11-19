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
@/generated/prisma"
import Image from "next/image";




const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  credentialId: z.string().min(1, "Credential is required"),

  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
});

export type OpenAIFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: OpenAIFormValues) => void;
  defaultValues?: Partial<OpenAIFormValues>;
}

export const OpenAIDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const {

    data: credentials,
    isLoading: isLoadingCredentials,
  } = useCredentialsByType(CredentialType.OPENAI);
  const form = useForm<OpenAIFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      systemPrompt: defaultValues.systemPrompt || "",
      userPrompt: defaultValues.userPrompt || "",
      credentialId: defaultValues.credentialId || "",

    },
  });

  // Reset when dialog opens (edit mode)
  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        systemPrompt: defaultValues.systemPrompt || "",
        userPrompt: defaultValues.userPrompt || "",
        credentialId: defaultValues.credentialId || "",

      });
    }
  }, [open, defaultValues]);

  const varPreview = form.watch("variableName") || "myOpenAI";


  const handleSubmit = (values: OpenAIFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>OpenAI Configuration</DialogTitle>
          <DialogDescription>
            Configure the AI model and prompt for this node.
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
                    <Input placeholder="myOpenAI" {...field} />
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
              name="credentialId"
              render={({ field }) => <FormItem>
                <FormLabel>
                  OpenAI Credential
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoadingCredentials || !credentials?.length}
                >

                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a Credential" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {credentials?.map((credential) => (
                      <SelectItem
                        key={credential.id}
                        value={credential.id}
                      >
                        <div className="flex items-center gap-2">
                          <Image src='/logos/openai.svg' alt="OpenAI" width={16} height={16} />
                          {credential.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>}
            />

            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt (Optional)</FormLabel>
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
              name="userPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Summarize this Text: {{json httpResponse.data}}"
                      className="font-mono min-h-[120px]"
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
