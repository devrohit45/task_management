<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TaskManagementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_can_sign_in_and_receive_role_specific_accounts(): void
    {
        $user = $this->makeUser('employee');

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123',
        ])->assertOk()
            ->assertJsonPath('status', true)
            ->assertJsonPath('user.role', 'employee')
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);
    }

    public function test_employee_only_sees_tasks_assigned_to_or_created_by_them(): void
    {
        $employee = $this->makeUser('employee');
        $admin = $this->makeUser('admin');
        $this->makeTask($employee, $employee);
        $this->makeTask($admin, $admin);

        $this->actingAs($employee, 'sanctum')
            ->getJson('/api/tasks')
            ->assertOk()
            ->assertJsonCount(1, 'tasks')
            ->assertJsonPath('tasks.0.assignee', $employee->name);
    }

    public function test_only_managers_can_list_all_task_assignees(): void
    {
        $manager = $this->makeUser('admin');
        $employee = $this->makeUser('employee');

        $this->actingAs($manager, 'sanctum')
            ->getJson('/api/users')
            ->assertOk()
            ->assertJsonCount(2, 'users');

        $this->actingAs($employee, 'sanctum')
            ->getJson('/api/users')
            ->assertOk()
            ->assertJsonCount(1, 'users')
            ->assertJsonPath('users.0.id', $employee->id);
    }

    public function test_only_admins_can_create_team_accounts_with_allowed_roles(): void
    {
        $admin = $this->makeUser('admin');
        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/users', [
                'name' => 'New Employee',
                'email' => 'new.employee@example.test',
                'password' => 'new-password-123',
                'role' => 'employee',
            ])
            ->assertCreated()
            ->assertJsonPath('user.role', 'employee')
            ->assertJsonPath('user.email', 'new.employee@example.test');

        $employee = User::findOrFail($response->json('user.id'));
        $this->assertTrue(Hash::check('new-password-123', $employee->password));
        $this->assertDatabaseHas('users', [
            'id' => $employee->id,
            'role' => 'employee',
            'is_active' => true,
        ]);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/users', [
                'name' => 'New Manager',
                'email' => 'new.manager@example.test',
                'password' => 'new-password-123',
                'role' => 'manager',
            ])
            ->assertCreated()
            ->assertJsonPath('user.role', 'manager');

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/users', [
                'name' => 'Unauthorized Admin',
                'email' => 'new.admin@example.test',
                'password' => 'new-password-123',
                'role' => 'admin',
            ])
            ->assertUnprocessable();

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/users', [
                'name' => 'Unsupported Customer',
                'email' => 'customer@example.test',
                'password' => 'new-password-123',
                'role' => 'customer',
            ])
            ->assertUnprocessable();

        $manager = $this->makeUser('manager');
        $this->actingAs($manager, 'sanctum')
            ->postJson('/api/users', [
                'name' => 'Not Allowed',
                'email' => 'not.allowed@example.test',
                'password' => 'new-password-123',
                'role' => 'employee',
            ])
            ->assertForbidden();
    }

    public function test_admin_can_update_team_member_details_and_role(): void
    {
        $admin = $this->makeUser('admin');
        $employee = $this->makeUser('employee');
        $otherUser = $this->makeUser('employee');
        $originalPassword = $employee->password;

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/users/{$employee->id}", [
                'name' => 'Updated Team Member',
                'email' => 'updated.member@example.test',
                'role' => 'manager',
            ])
            ->assertOk()
            ->assertJsonPath('user.name', 'Updated Team Member')
            ->assertJsonPath('user.email', 'updated.member@example.test')
            ->assertJsonPath('user.role', 'manager');

        $this->assertDatabaseHas('users', [
            'id' => $employee->id,
            'name' => 'Updated Team Member',
            'email' => 'updated.member@example.test',
            'role' => 'manager',
        ]);
        $this->assertSame($originalPassword, $employee->fresh()->password);

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/users/{$employee->id}", [
                'name' => 'Updated Team Member',
                'email' => $otherUser->email,
                'role' => 'employee',
            ])
            ->assertUnprocessable();

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/users/{$admin->id}", [
                'name' => 'Changed Admin',
                'email' => $admin->email,
                'role' => 'employee',
            ])
            ->assertNotFound();

        $this->actingAs($otherUser, 'sanctum')
            ->putJson("/api/users/{$employee->id}", [
                'name' => 'Unauthorized Update',
                'email' => 'unauthorized@example.test',
                'role' => 'manager',
            ])
            ->assertForbidden();
    }

    public function test_manager_can_create_assign_update_and_delete_tasks(): void
    {
        $manager = $this->makeUser('manager');
        $employee = $this->makeUser('employee');
        $project = $this->makeProject($manager, $employee);
        $payload = [
            'project_id' => $project->id,
            'title' => 'Prepare release',
            'description' => 'Finalize release checklist',
            'status' => 'To do',
            'priority' => 'High',
            'due_date' => '2026-11-15',
            'assignee_id' => $employee->id,
        ];

        $this->actingAs($manager, 'sanctum')
            ->postJson('/api/tasks', $payload)
            ->assertCreated()
            ->assertJsonPath('task.title', 'Prepare release')
            ->assertJsonPath('task.projectName', $project->name)
            ->assertJsonPath('task.assigneeId', $employee->id);

        $task = Task::firstOrFail();
        $this->actingAs($manager, 'sanctum')
            ->putJson("/api/tasks/{$task->id}", [...$payload, 'status' => 'In progress'])
            ->assertOk()
            ->assertJsonPath('task.status', 'In progress');

        $this->actingAs($manager, 'sanctum')
            ->deleteJson("/api/tasks/{$task->id}")
            ->assertOk();

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_employee_cannot_assign_tasks_to_other_users_or_change_other_users_tasks(): void
    {
        $employee = $this->makeUser('employee');
        $otherEmployee = $this->makeUser('employee');
        $otherTask = $this->makeTask($otherEmployee, $otherEmployee);
        $ownProject = $this->makeProject($employee, $employee);

        $this->actingAs($employee, 'sanctum')
            ->postJson('/api/tasks', [
                'project_id' => $ownProject->id,
                'title' => 'Restricted assignment',
                'status' => 'To do',
                'priority' => 'Medium',
                'due_date' => '2026-11-15',
                'assignee_id' => $otherEmployee->id,
            ])
            ->assertUnprocessable();

        $this->actingAs($employee, 'sanctum')
            ->putJson("/api/tasks/{$otherTask->id}", [
                'project_id' => $otherTask->project_id,
                'title' => 'Unauthorized update',
                'status' => 'Done',
                'priority' => 'Low',
                'due_date' => '2026-11-15',
                'assignee_id' => $otherEmployee->id,
            ])
            ->assertForbidden();
    }

    public function test_employee_can_create_a_personal_task_and_a_task_in_an_assigned_project(): void
    {
        $employee = $this->makeUser('employee');
        $manager = $this->makeUser('manager');
        $assignedProject = $this->makeProject($manager, $employee);
        $otherProject = $this->makeProject($manager, $this->makeUser('employee'));

        $personalTask = [
            'title' => 'Personal follow-up',
            'description' => 'A task without a project',
            'status' => 'To do',
            'priority' => 'Medium',
            'due_date' => '2026-11-15',
        ];

        $this->actingAs($employee, 'sanctum')
            ->postJson('/api/tasks', $personalTask)
            ->assertCreated()
            ->assertJsonPath('task.projectId', null)
            ->assertJsonPath('task.projectName', 'No project')
            ->assertJsonPath('task.assigneeId', $employee->id);

        $this->actingAs($employee, 'sanctum')
            ->postJson('/api/tasks', [
                ...$personalTask,
                'title' => 'Assigned project task',
                'project_id' => $assignedProject->id,
            ])
            ->assertCreated()
            ->assertJsonPath('task.projectId', $assignedProject->id)
            ->assertJsonPath('task.assigneeId', $employee->id);

        $this->actingAs($employee, 'sanctum')
            ->postJson('/api/tasks', [
                ...$personalTask,
                'title' => 'Unassigned project task',
                'project_id' => $otherProject->id,
            ])
            ->assertForbidden();
    }

    public function test_profile_can_be_updated_without_changing_role(): void
    {
        $user = $this->makeUser('employee');

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/profile', [
                'name' => 'Updated Employee',
                'email' => 'updated@example.test',
            ])
            ->assertOk()
            ->assertJsonPath('user.name', 'Updated Employee')
            ->assertJsonPath('user.email', 'updated@example.test')
            ->assertJsonPath('user.role', 'employee');
    }

    public function test_manager_can_create_and_update_project_status_and_assignments(): void
    {
        $manager = $this->makeUser('admin');
        $employee = $this->makeUser('employee');

        $response = $this->actingAs($manager, 'sanctum')
            ->postJson('/api/projects', [
                'name' => 'Website launch',
                'description' => 'Prepare the new website launch.',
                'status' => 'Pending',
                'due_date' => '2026-12-01',
                'assigned_to_id' => $employee->id,
            ])
            ->assertCreated()
            ->assertJsonPath('project.status', 'Pending')
            ->assertJsonPath('project.assignee', $employee->name);

        $projectId = $response->json('project.id');
        $this->actingAs($manager, 'sanctum')
            ->putJson("/api/projects/{$projectId}", [
                'name' => 'Website launch',
                'description' => 'Prepare the new website launch.',
                'status' => 'Completed',
                'due_date' => '2026-12-01',
                'assigned_to_id' => $employee->id,
            ])
            ->assertOk()
            ->assertJsonPath('project.status', 'Completed');
    }

    public function test_admin_can_assign_project_to_manager_who_can_assign_project_tasks(): void
    {
        $admin = $this->makeUser('admin');
        $manager = $this->makeUser('manager');
        $employee = $this->makeUser('employee');

        $projectResponse = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/projects', [
                'name' => 'Manager-owned project',
                'description' => 'A project assigned directly by an admin.',
                'status' => 'Pending',
                'due_date' => '2026-12-01',
                'assigned_to_id' => $manager->id,
            ])
            ->assertCreated()
            ->assertJsonPath('project.assignee', $manager->name);

        $projectId = $projectResponse->json('project.id');
        $this->actingAs($manager, 'sanctum')
            ->postJson('/api/tasks', [
                'project_id' => $projectId,
                'title' => 'Manager-assigned project task',
                'status' => 'To do',
                'priority' => 'High',
                'due_date' => '2026-11-15',
                'assignee_id' => $employee->id,
            ])
            ->assertCreated()
            ->assertJsonPath('task.projectId', $projectId)
            ->assertJsonPath('task.assigneeId', $employee->id);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/tasks', [
                'project_id' => $projectId,
                'title' => 'Admin-assigned project task',
                'status' => 'To do',
                'priority' => 'Medium',
                'due_date' => '2026-11-15',
                'assignee_id' => $manager->id,
            ])
            ->assertCreated()
            ->assertJsonPath('task.assigneeId', $manager->id);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/projects', [
                'name' => 'Admin-owned project',
                'status' => 'Pending',
                'assigned_to_id' => $admin->id,
            ])
            ->assertUnprocessable();
    }

    public function test_non_managers_only_see_projects_assigned_to_them(): void
    {
        $employee = $this->makeUser('employee');
        $otherEmployee = $this->makeUser('employee');
        $this->makeProject($employee, $employee);
        $this->makeProject($otherEmployee, $otherEmployee);

        $this->actingAs($employee, 'sanctum')
            ->getJson('/api/projects')
            ->assertOk()
            ->assertJsonCount(1, 'projects');
    }

    public function test_tasks_must_belong_to_an_open_project_and_completed_projects_are_not_task_options(): void
    {
        $manager = $this->makeUser('manager');
        $employee = $this->makeUser('employee');
        $project = $this->makeProject($manager, $employee, 'Completed');
        $payload = [
            'project_id' => $project->id,
            'title' => 'New task',
            'status' => 'To do',
            'priority' => 'Medium',
            'due_date' => '2026-11-15',
            'assignee_id' => $employee->id,
        ];

        $this->actingAs($manager, 'sanctum')
            ->postJson('/api/tasks', $payload)
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Tasks cannot be added to a completed project.');

        $this->actingAs($employee, 'sanctum')
            ->getJson('/api/projects/options')
            ->assertOk()
            ->assertJsonCount(0, 'projects');
    }

    public function test_project_cannot_be_deleted_while_it_has_tasks(): void
    {
        $manager = $this->makeUser('admin');
        $project = $this->makeProject($manager, $manager);
        $project->tasks()->create([
            'user_id' => $manager->id,
            'assignee_id' => $manager->id,
            'title' => 'Project task',
            'description' => '',
            'status' => 'To do',
            'priority' => 'Low',
            'due_date' => '2026-11-15',
        ]);

        $this->actingAs($manager, 'sanctum')
            ->deleteJson("/api/projects/{$project->id}")
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Move or delete this project’s tasks before deleting the project.');

        $this->assertDatabaseHas('projects', ['id' => $project->id]);
    }

    private function makeUser(string $role): User
    {
        static $userNumber = 0;
        $userNumber++;

        return User::create([
            'name' => ucfirst($role).' '.$userNumber,
            'email' => "{$role}{$userNumber}@example.test",
            'password' => Hash::make('password123'),
            'role' => $role,
            'is_active' => true,
        ]);
    }

    private function makeTask(User $creator, User $assignee): Task
    {
        $project = $this->makeProject($creator, $assignee);

        return Task::create([
            'user_id' => $creator->id,
            'project_id' => $project->id,
            'assignee_id' => $assignee->id,
            'title' => 'Task '.$creator->id,
            'description' => '',
            'status' => 'To do',
            'priority' => 'Medium',
            'due_date' => '2026-11-15',
        ]);
    }

    private function makeProject(User $creator, User $assignee, string $status = 'Pending'): Project
    {
        static $projectNumber = 0;
        $projectNumber++;

        return Project::create([
            'created_by_id' => $creator->id,
            'assigned_to_id' => $assignee->id,
            'name' => 'Project '.$projectNumber,
            'description' => '',
            'status' => $status,
            'due_date' => '2026-12-01',
        ]);
    }
}
