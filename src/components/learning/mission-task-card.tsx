import Link from "next/link";
import {
  Check,
  ChevronRight,
  Headphones,
  Layers,
  RotateCcw,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import type { MissionTask, TaskType } from "@/domain/types";
import { cn } from "@/lib/utils/cn";

const TASK_ICON: Record<TaskType, LucideIcon> = {
  vocabulary: Layers,
  listening: Headphones,
  review: RotateCcw,
  reading: BookOpen,
};

const TASK_LABEL: Record<TaskType, string> = {
  vocabulary: "Vocabulary",
  listening: "Listening",
  review: "Review",
  reading: "Reading",
};

interface MissionTaskCardProps {
  task: MissionTask;
  /** The single task the learner should do next, highlighted accordingly. */
  isNext: boolean;
}

/**
 * One row of the mission. Completion is shown with an icon and a label, never
 * by colour alone, and the whole row is one tap target.
 */
export function MissionTaskCard({ task, isNext }: MissionTaskCardProps) {
  const Icon = TASK_ICON[task.taskType];

  return (
    <li>
      <Link
        href={task.href}
        className={cn(
          "group flex min-h-[72px] items-center gap-4 rounded-xl border bg-white px-4 py-3.5",
          "transition-colors duration-150",
          isNext
            ? "border-emerald-muted ring-1 ring-emerald-muted/70"
            : "border-line hover:border-line-strong",
          task.completed && "bg-sand-50",
        )}
      >
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            task.completed
              ? "bg-emerald-soft text-brand-deep"
              : isNext
                ? "bg-brand text-white"
                : "bg-sand-200 text-ink-600",
          )}
        >
          {task.completed ? (
            <Check className="size-5" aria-hidden="true" />
          ) : (
            <Icon className="size-5" aria-hidden="true" strokeWidth={1.9} />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[11px] font-semibold tracking-[0.1em] text-ink-400 uppercase">
              {TASK_LABEL[task.taskType]}
            </span>
            <span className="text-[11px] text-ink-400">
              · {task.estimatedMinutes} min
            </span>
            {task.completed ? (
              <span className="text-[11px] font-semibold text-brand-deep">
                · Completed
              </span>
            ) : null}
          </span>
          <span
            className={cn(
              "mt-0.5 block text-[15px] font-medium",
              task.completed ? "text-ink-500" : "text-ink-900",
            )}
          >
            {task.title}
          </span>
          <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-ink-500">
            {task.description}
          </span>
        </span>

        <ChevronRight
          className="size-5 shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}
