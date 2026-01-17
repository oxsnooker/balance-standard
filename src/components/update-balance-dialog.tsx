"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useFirestore,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from "@/firebase";
import { doc, collection, increment } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  type: z.enum(["balance", "payment"], {
    required_error: "You need to select a transaction type.",
  }),
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  description: z.string().min(1, { message: "Description is required." }),
});

interface UpdateBalanceDialogProps {
  userId: string;
  userEmail: string;
}

export function UpdateBalanceDialog({
  userId,
  userEmail,
}: UpdateBalanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "balance",
      amount: 0,
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const { type, amount, description } = values;
    const amountToUpdate = type === "balance" ? amount : -amount;

    const userDocRef = doc(firestore, "users", userId);
    const transactionColRef = collection(firestore, "users", userId, "transactions");

    try {
      // Update balance
      updateDocumentNonBlocking(userDocRef, {
        balance: increment(amountToUpdate),
      });

      // Add transaction record
      addDocumentNonBlocking(transactionColRef, {
        type,
        amount,
        description,
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: `Balance for ${userEmail} updated successfully.`,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error updating balance: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update balance.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Update Balance</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Balance for {userEmail}</DialogTitle>
          <DialogDescription>
            Add a balance or record a payment. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Transaction Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="balance" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Balance (Add)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="payment" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Payment (Subtract)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Monthly subscription" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
