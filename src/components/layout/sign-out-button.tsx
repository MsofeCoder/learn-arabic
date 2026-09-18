"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/actions";

export function SignOutButton() {
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="secondary"
      size="md"
      loading={pending}
      onClick={() => {
        setPending(true);
        void signOut();
      }}
    >
      <LogOut className="size-4" aria-hidden="true" />
      Sign out
    </Button>
  );
}
