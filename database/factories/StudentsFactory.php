<?php

namespace Database\Factories;

use App\Models\Students;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Students>
 */
class StudentsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => fake()->unique()->numerify('2026-####'),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'middle_initial' => fake()->randomLetter(),
            'grade_level' => fake()->randomElement(['7', '8', '9', '10', '11', '12',]),
            'section' => fake()->randomElement(['A', 'B', 'C', 'D',]),
            'adviser' => fake()->name(),
        ];
    }
}
