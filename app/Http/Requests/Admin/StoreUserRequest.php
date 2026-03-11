<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isSuperAdmin();
    }

    public function rules(): array
    {
        $userId = $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'phone' => ['nullable', 'string', 'max:20'],
            'type' => ['required', Rule::in(['superadmin', 'venue-admin', 'customer'])],
            'status' => ['required', Rule::in(['not-registered', 'pending-activation', 'inactive', 'active'])],
            'password' => $userId ? ['nullable', 'string', 'min:8'] : ['required', 'string', 'min:8'],
            'venue_ids' => ['nullable', 'array'],
            'venue_ids.*' => ['integer', 'exists:venues,id'],
        ];
    }
}
