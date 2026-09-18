import type {
  DailyMinutes,
  Mission,
  MissionTask,
  Program,
  ProgramDay,
  Task,
  UserLearningState,
} from "@/domain/types";

/**
 * Deterministic mission generation (docs/spec/01-PRD.md §6).
 *
 * Pure: no database calls, no `new Date()` reads from global state. This is the
 * extension point where an AI-personalised planner could later be swapped in
 * behind the same signature.
 */

/** Tasks are never trimmed below this count — a mission must stay meaningful. */
const MIN_TASKS = 3;
const MAX_TASKS = 5;

/** Synthetic task id for the overdue-review block. Not a program task. */
export const BACKLOG_TASK_ID = "backlog-review";

export interface BuildMissionInput {
  program: Program;
  day: ProgramDay;
  state: UserLearningState;
}

/**
 * Where a task's CTA leads. The originating task id travels in the query string
 * so the activity can mark it complete when the learner actually finishes it.
 */
function taskHref(task: Task): string {
  const from = `task=${encodeURIComponent(task.id)}`;
  switch (task.taskType) {
    case "listening":
      return task.contentRef
        ? `/listen/${task.contentRef}?${from}`
        : `/review?${from}`;
    case "review":
      return `/review?${from}`;
    case "vocabulary":
      return task.contentRef
        ? `/review?set=${encodeURIComponent(task.contentRef)}&${from}`
        : `/review?${from}`;
    case "reading":
      return `/today`;
  }
}

/**
 * Chooses how many program tasks fit the learner's daily budget.
 * Always keeps at least one review task and one new-content task when both exist.
 */
export function selectTasksForBudget(
  tasks: Task[],
  dailyMinutes: DailyMinutes,
): Task[] {
  const ordered = [...tasks].sort((a, b) => a.sortOrder - b.sortOrder);
  if (ordered.length <= MIN_TASKS) return ordered.slice(0, MAX_TASKS);

  // Reserve the load-bearing slots before spending the budget, rather than
  // appending them afterwards — otherwise a greedy pass in program order eats
  // the minutes on early tasks and the day's retrieval practice or listening
  // silently drops out.
  const review = ordered.find((task) => task.taskType === "review") ?? null;
  const listening = ordered.find((task) => task.taskType === "listening") ?? null;

  const reserved: Task[] = review ? [review] : [];
  // Listening only earns a reserved slot when the pair actually fits; a
  // 10-minute learner should not be handed an 18-minute mission by default.
  if (
    listening &&
    (review?.estimatedMinutes ?? 0) + listening.estimatedMinutes <= dailyMinutes
  ) {
    reserved.push(listening);
  }

  const selected: Task[] = [...reserved];
  let budget =
    dailyMinutes - reserved.reduce((sum, t) => sum + t.estimatedMinutes, 0);

  for (const task of ordered) {
    if (reserved.includes(task)) continue;
    if (selected.length >= MAX_TASKS) break;
    if (task.estimatedMinutes <= budget) {
      selected.push(task);
      budget -= task.estimatedMinutes;
    }
  }

  // A mission below MIN_TASKS is not a mission: top it up in program order even
  // when that overshoots a very small budget.
  for (const task of ordered) {
    if (selected.length >= MIN_TASKS) break;
    if (!selected.includes(task)) selected.push(task);
  }

  return selected.sort((a, b) => a.sortOrder - b.sortOrder);
}

/** A completed task and the UTC calendar day (yyyy-mm-dd) it was finished. */
export interface TaskCompletion {
  taskId: string;
  completedOn: string;
}

/**
 * Resolves which program day the learner is on.
 *
 * 1. The earliest day with an incomplete task, so a learner who misses a day
 *    is never silently skipped past content.
 * 2. Paced to one new day per calendar day: if the previous day was finished
 *    *today* and the next has not been started, the learner stays on the
 *    finished day ("done for today") until tomorrow. The loop is "complete
 *    today's mission, return tomorrow", not "binge the program in one sitting".
 *
 * Falls back to the final day once everything is complete.
 */
export function resolveCurrentDay(
  days: ProgramDay[],
  completions: TaskCompletion[],
  today: string,
): number {
  const completedOn = new Map(completions.map((c) => [c.taskId, c.completedOn]));
  const ordered = [...days].sort((a, b) => a.dayNumber - b.dayNumber);
  if (ordered.length === 0) return 1;

  const index = ordered.findIndex((day) =>
    day.tasks.some((task) => !completedOn.has(task.id)),
  );
  if (index === -1) return ordered[ordered.length - 1].dayNumber;
  if (index === 0) return ordered[0].dayNumber;

  const current = ordered[index];
  const previous = ordered[index - 1];
  const started = current.tasks.some((task) => completedOn.has(task.id));
  const previousFinishedOn = previous.tasks
    .map((task) => completedOn.get(task.id) ?? "")
    .sort()
    .at(-1);

  return !started && previousFinishedOn === today
    ? previous.dayNumber
    : current.dayNumber;
}

export function buildTodayMission({
  program,
  day,
  state,
}: BuildMissionInput): Mission {
  const completed = new Set(state.completedTaskIds);
  const selected = selectTasksForBudget(day.tasks, state.profile.dailyMinutes);

  const tasks: MissionTask[] = selected.map((task) => ({
    id: task.id,
    taskType: task.taskType,
    title: task.title,
    description: task.description,
    estimatedMinutes: task.estimatedMinutes,
    contentRef: task.contentRef,
    completed: completed.has(task.id),
    href: taskHref(task),
  }));

  // Overdue cards earn a small block at the front of the mission.
  if (state.dueReviewCount > 0) {
    const backlogMinutes = state.dueReviewCount >= 15 ? 6 : 4;
    tasks.unshift({
      id: BACKLOG_TASK_ID,
      taskType: "review",
      title: "Clear your review backlog",
      description: `${state.dueReviewCount} ${
        state.dueReviewCount === 1 ? "card is" : "cards are"
      } due. Start here so today's new material lands on solid ground.`,
      estimatedMinutes: backlogMinutes,
      contentRef: null,
      completed: false,
      href: "/review",
      isBacklog: true,
    });
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const estimatedMinutes = tasks
    .filter((t) => !t.completed)
    .reduce((sum, t) => sum + t.estimatedMinutes, 0);

  return {
    program: {
      id: program.id,
      title: program.title,
      dayNumber: day.dayNumber,
    },
    dayLabel: day.label,
    title: day.title,
    objective: day.objective,
    estimatedMinutes,
    tasks,
    completedCount,
    percentComplete:
      tasks.length === 0
        ? 0
        : Math.round((completedCount / tasks.length) * 100),
    dueReviewCount: state.dueReviewCount,
  };
}

/** The single next action the Today screen should point at. */
export function nextMissionTask(mission: Mission): MissionTask | null {
  return mission.tasks.find((task) => !task.completed) ?? null;
}
