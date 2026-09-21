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
            'student_id' => $this->faker->unique()->numerify('STU-#####'),
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'middle_initial' => $this->faker->randomLetter(),
            'lrn' => $this->faker->unique()->numerify('############'),
            'gender' => $this->faker->randomElement(['Male','Female',]),
            'parents_name' => $this->faker->name(),
            'grade_level' => $this->faker->randomElement(['7','8','9','10','11','12',]),
            'section' => $this->faker->randomElement(['A','B','C','D',]),
            'adviser' => $this->faker->name(),
            'status' => $this->faker->randomElement(['Not Printed','Printed',]),
        ];
    }
}
