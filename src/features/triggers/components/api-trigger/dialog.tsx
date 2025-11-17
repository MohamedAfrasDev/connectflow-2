"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Terminal, Key } from "lucide-react";
import { useParams } from "next/navigation"; 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAPITriggerKey } from "./action"; 

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
}

export const APITriggerDialog = ({ open, onOpenChange, nodeId }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const [apiKey, setApiKey] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch the key when dialog opens
  useEffect(() => {
    if (open && workflowId && nodeId) {
      setLoading(true);
      getAPITriggerKey(workflowId, nodeId)
        .then((key) => setApiKey(key))
        .catch((err) => console.error("Failed to get key", err))
        .finally(() => setLoading(false));
    }
  }, [open, workflowId, nodeId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ⚠️ STANDARD cURL FORMAT (Clean & Vertical)
  // We use a placeholder for the key to keep the code box small.
  const apiUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/trigger` : '/api/trigger';
  
  const curlCode = `curl -X POST "${apiUrl}" \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "payload": {
      "email": "hello@example.com", // PASS YOUR DATA HERE
      "message": "This is data sent to the workflow" // PASS YOUR MESSAGE HERE
    }
  }'`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            API Trigger
          </DialogTitle>
          <DialogDescription>
            Trigger this workflow from any application using cURL or HTTP POST.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="apikey" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="apikey">Credentials</TabsTrigger>
            <TabsTrigger value="code">cURL Example</TabsTrigger>
          </TabsList>

          {/* --- TAB 1: CREDENTIALS --- */}
          <TabsContent value="apikey" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Your Secret API Key</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  value={loading ? "Generating..." : apiKey} 
                  readOnly 
                  className="font-mono text-xs bg-slate-50" 
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => handleCopy(apiKey)}
                  disabled={loading}
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[0.8rem] text-muted-foreground">
                This key authenticates your request and identifies this specific workflow node.
              </p>
            </div>
          </TabsContent>

          {/* --- TAB 2: cURL CODE --- */}
          <TabsContent value="code" className="py-4">
            <div className="relative rounded-md bg-slate-950 p-4 group">
              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                  onClick={() => handleCopy(curlCode)}
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              
              {/* This displays the clean vertical cURL command */}
              <pre className="whitespace-pre-wrap break-all text-xs text-slate-50 font-mono leading-relaxed">
                <code>{curlCode}</code>
              </pre>
            </div>
            <div className="mt-2 text-[0.8rem] text-muted-foreground">
               Run this command in your terminal to test the trigger immediately.
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};