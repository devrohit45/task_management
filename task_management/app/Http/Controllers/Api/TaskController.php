<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $tasks = $this->visibleTasks($request->user())
            ->with(['creator:id,name', 'assignee:id,name', 'project:id,name,status'])
            ->latest()
            ->get()
            ->map(fn (Task $task) => $this->taskData($task));

        return response()->json(['status' => true, 'tasks' => $tasks]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate($this->taskRules($user));
        $this->assertProjectAccess($user, $validated['project_id'] ?? null);

        $task = Task::create([
            ...$validated,
            'user_id' => $user->id,
            'assignee_id' => $this->assigneeId($user, $validated['assignee_id'] ?? null),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Task created successfully',
            'task' => $this->taskData($task->load(['creator:id,name', 'assignee:id,name', 'project:id,name,status'])),
        ], 201);
    }

    public function update(Request $request, Task $task)
    {
        $user = $request->user();
        abort_unless($this->canManage($user, $task), 403, 'You cannot update this task.');

        $validated = $request->validate($this->taskRules($user));
        $this->assertProjectAccess($user, $validated['project_id'] ?? null, $task->project_id);
        $task->update([
            ...$validated,
            'assignee_id' => $this->assigneeId($user, $validated['assignee_id'] ?? null),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Task updated successfully',
            'task' => $this->taskData($task->refresh()->load(['creator:id,name', 'assignee:id,name', 'project:id,name,status'])),
        ]);
    }

    public function destroy(Request $request, Task $task)
    {
        abort_unless($this->canManage($request->user(), $task), 403, 'You cannot delete this task.');
        $task->delete();

        return response()->json(['status' => true, 'message' => 'Task deleted successfully']);
    }

    private function visibleTasks(User $user): Builder
    {
        $query = Task::query();
        if (! $this->isManager($user)) {
            $query->where(fn (Builder $tasks) => $tasks
                ->where('user_id', $user->id)
                ->orWhere('assignee_id', $user->id));
        }

        return $query;
    }

    private function canManage(User $user, Task $task): bool
    {
        return $this->isManager($user)
            || $task->user_id === $user->id
            || $task->assignee_id === $user->id;
    }

    private function isManager(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    private function taskRules(User $user): array
    {
        $assigneeRule = ['nullable', 'integer', Rule::exists('users', 'id')->where('is_active', true)];
        if (! $this->isManager($user)) {
            $assigneeRule[] = Rule::in([$user->id]);
        }

        return [
            'project_id' => 'nullable|integer|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:10000',
            'status' => ['required', Rule::in(['To do', 'In progress', 'In review', 'Done'])],
            'priority' => ['required', Rule::in(['Low', 'Medium', 'High'])],
            'due_date' => 'required|date',
            'assignee_id' => $assigneeRule,
        ];
    }

    private function assigneeId(User $user, ?int $assigneeId): int
    {
        return $this->isManager($user) ? ($assigneeId ?? $user->id) : $user->id;
    }

    private function assertProjectAccess(User $user, ?int $projectId, ?int $existingProjectId = null): void
    {
        if ($projectId === null) {
            return;
        }

        $project = \App\Models\Project::query()->findOrFail($projectId);
        if (! $this->isManager($user)) {
            abort_unless(
                $project->created_by_id === $user->id || $project->assigned_to_id === $user->id,
                403,
                'You cannot add tasks to this project.',
            );
        }

        abort_if(
            $project->status === 'Completed' && $existingProjectId !== $project->id,
            422,
            'Tasks cannot be added to a completed project.',
        );
    }

    private function taskData(Task $task): array
    {
        return [
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description ?? '',
            'status' => $task->status,
            'priority' => $task->priority,
            'dueDate' => $task->due_date->format('Y-m-d'),
            'projectId' => $task->project_id,
            'projectName' => $task->project?->name ?? 'No project',
            'projectStatus' => $task->project?->status,
            'assigneeId' => $task->assignee_id,
            'assignee' => $task->assignee?->name ?? 'Unassigned',
            'createdById' => $task->user_id,
            'createdBy' => $task->creator?->name ?? 'Unknown',
            'createdAt' => $task->created_at->toISOString(),
        ];
    }
}
