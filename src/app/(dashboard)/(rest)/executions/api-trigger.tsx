"use client";
import { Button } from "@/components/ui/button";

export const APITriggerButton = () => {
  const handleTrigger = async () => {
    try {
      const res = await fetch("/api/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "123",
          action: "run-task",
          payload: { foo: "bar" },
          // 👇 ADD THIS LINE (Must match the 'if' check in your Inngest function)
          workflowId: "cmi2qm7g40001eutkupjnmix8", 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Trigger sent! Check Inngest dashboard.");
        console.log("Inngest result:", data.result);
      } else {
        alert("Trigger failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Unexpected error");
    }
  };

  return <Button onClick={handleTrigger}>Run API Trigger</Button>;
};