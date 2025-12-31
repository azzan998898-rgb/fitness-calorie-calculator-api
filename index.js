const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: '🏋️ Fitness Calorie API is Working!',
    version: '1.0.0',
    endpoints: {
      '/calculate': 'POST - Calculate daily calories',
      '/bmi': 'POST - Calculate BMI'
    }
  });
});

// Calculate calories
app.post('/calculate', (req, res) => {
  try {
    const { gender, weight, height, age, activityLevel = 'moderate', goal = 'maintenance' } = req.body;

    if (!gender || !weight || !height || !age) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // BMR Calculation
    let bmr = gender.toLowerCase() === 'male' 
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

    // Activity multipliers
    const multipliers = {
      sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9
    };

    const tdee = bmr * (multipliers[activityLevel] || 1.55);

    // Goal adjustment
    let dailyCalories = tdee;
    if (goal === 'weight_loss') dailyCalories = tdee - 500;
    if (goal === 'extreme_weight_loss') dailyCalories = tdee - 1000;
    if (goal === 'weight_gain') dailyCalories = tdee + 500;

    res.json({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      daily_calories: Math.round(dailyCalories),
      goal: goal,
      activity_level: activityLevel
    });

  } catch (error) {
    res.status(500).json({ error: 'Calculation failed' });
  }
});

// Calculate BMI
app.post('/bmi', (req, res) => {
  try {
    const { weight, height } = req.body;
    
    if (!weight || !height) {
      return res.status(400).json({ error: 'Weight and height required' });
    }

    const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
    let category = '';

    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal weight';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    res.json({
      bmi: parseFloat(bmi),
      category: category
    });

  } catch (error) {
    res.status(500).json({ error: 'BMI calculation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Fitness API running on port ${PORT}`);
});
