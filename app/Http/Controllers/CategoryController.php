<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(\App\Models\Category::all());
    }

    public function store(Request $request)
    {
        if (auth()->id() !== 1) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories',
        ]);

        $category = \App\Models\Category::create($validated);

        return response()->json($category, 201);
    }
}
