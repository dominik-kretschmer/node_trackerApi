import { createModel } from "./createModel.js";

export const Food = createModel("food_entries", (food) => ({
    user_id: food.userId,
    description: food.description,
    category: food.category,
}));

export const DailyEntry = createModel("daily_entries", (entry) => ({
    user_id: entry.userId,
    mood_rating: entry.mood_rating,
    energy_level: entry.energy_level,
    productivity_level: entry.productivity_level,
    sleep_quality: entry.sleep_quality,
}));

export const SymptomEntry = createModel("symptom_entries", (entry) => ({
    user_id: entry.userId,
    date: entry.date,
    sneezing: entry.sneezing,
    itchy_eyes: entry.itchy_eyes,
    congestion: entry.congestion,
}));

export const User = createModel("users", (user) => ({
    username: user.username,
    password_hash: user.password_hash,
}));
