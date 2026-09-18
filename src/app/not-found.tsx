import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-20">
      <EmptyState
        icon={<Compass className="size-6" aria-hidden="true" />}
        title="We could not find that"
        description="The page or lesson you were looking for is not here."
        action={
          <Link href="/today" className={buttonClasses()}>
            Back to today&rsquo;s mission
          </Link>
        }
      />
    </div>
  );
}
