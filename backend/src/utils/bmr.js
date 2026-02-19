export const calculateBMR = ({ weight, height, age, gender }) => {
  return gender === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
};

export const activityMultiplier = (level) => {
  const map = {
    sedentary: 1.2,
    moderate: 1.55,
    active: 1.75,
  };
  return map[level] || 1.2;
};
