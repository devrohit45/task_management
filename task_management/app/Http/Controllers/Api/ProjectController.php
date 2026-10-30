<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $projects = $this->visibleProjects($request->user())
            ->with(['creator:id,name', 'assignee:id,name'])
            ->withCount('tasks')
            ->latest()
            ->get()
            ->map(fn (Project $project) => $this->projectData($project));

        return response()->json(['status' => true, 'projects' => $projects]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        abort_unless($this->isManager($user), 403, 'Only workspace managers can create projects.');
        $validated = $request->validate($this->projectRules());

        $project = Project::create([
            ...$validated,
            'created_by_id' => $user->id,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Project created successfully',
            'project' => $this->projectData($project->load(['creator:id,name', 'assignee:id,name'])->loadCount('tasks')),
        ], 201);
    }

    public function update(Request $request, Project $project)
    {
        abort_unless($this->isManager($request->user()), 403, 'Only workspace managers can update projects.');
        $validated = $request->validate($this->projectRules());
        $project->update($validated);

        return response()->json([
            'status' => true,
            'message' => 'Project updated successfully',
            'project' => $this->projectData($project->refresh()->load(['creator:id,name', 'assignee:id,name'])->loadCount('tasks')),
        ]);
    }

    public function destroy(Request $request, Project $project)
    {
        abort_unless($this->isManager($request->user()), 403, 'Only workspace managers can delete projects.');
        if ($project->tasks()->exists()) {
            return response()->json([
                'status' => false,
                'message' => 'Move or delete this project’s tasks before deleting the project.',
            ], 422);
        }

        $project->delete();

        return response()->json(['status' => true, 'message' => 'Project deleted successfully']);
    }

    public function options(Request $request)
    {
        $projects = $this->visibleProjects($request->user())
            ->whereIn('status', ['Pending', 'In progress'])
            ->orderBy('name')
            ->get(['id', 'name', 'status']);

        return response()->json(['status' => true, 'projects' => $projects]);
    }

    private function visibleProjects(User $user): Builder
    {
        $query = Project::query();
        if (! $this->isManager($user)) {
            $query->where(fn (Builder $projects) => $projects
                ->where('created_by_id', $user->id)
                ->orWhere('assigned_to_id', $user->id));
        }

        return $query;
    }

    private function isManager(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager'], true);
    }

    private function projectRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:10000',
            'status' => ['required', Rule::in(['Pending', 'In progress', 'Completed', 'On hold'])],
            'due_date' => 'nullable|date',
            'assigned_to_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where(
                    fn ($users) => $users
                        ->where('is_active', true)
                        ->whereIn('role', ['manager', 'employee']),
                ),
            ],
        ];
    }

    private function projectData(Project $project): array
    {
        return [
            'id' => $project->id,
            'name' => $project->name,
            'description' => $project->description ?? '',
            'status' => $project->status,
            'dueDate' => $project->due_date?->format('Y-m-d'),
            'assignedToId' => $project->assigned_to_id,
            'assignee' => $project->assignee?->name ?? 'Unassigned',
            'createdById' => $project->created_by_id,
            'createdBy' => $project->creator?->name ?? 'Unknown',
            'taskCount' => $project->tasks_count ?? 0,
            'createdAt' => $project->created_at->toISOString(),
        ];
    }
}
