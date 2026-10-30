<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $users = User::query()
            ->where('is_active', true)
            ->when(
                ! in_array($user->role, ['admin', 'manager'], true),
                fn ($query) => $query->whereKey($user->id),
            )
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role']);

        return response()->json(['status' => true, 'users' => $users]);
    }

    public function store(Request $request)
    {
        abort_unless($request->user()->role === 'admin', 403, 'Only administrators can add team members.');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => 'required|string|min:8|max:255',
            'role' => ['required', Rule::in(['manager', 'employee'])],
        ]);

        $teamMember = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'is_active' => true,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Team member account created successfully',
            'user' => $teamMember->only(['id', 'name', 'email', 'role']),
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        abort_unless($request->user()->role === 'admin', 403, 'Only administrators can update team members.');
        abort_unless($user->role !== 'admin' && $user->is_active, 404, 'Team member not found.');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', Rule::in(['manager', 'employee'])],
        ]);

        $user->update($validated);

        return response()->json([
            'status' => true,
            'message' => 'Team member updated successfully',
            'user' => $user->only(['id', 'name', 'email', 'role']),
        ]);
    }
}
