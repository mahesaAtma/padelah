<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCourtRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'court_number' => ['required', 'integer', 'min:1'],
            'name' => ['required', 'string', 'max:255'],
            'place' => ['required', Rule::in(['indoor', 'outdoor'])],
        ];
    }
}
