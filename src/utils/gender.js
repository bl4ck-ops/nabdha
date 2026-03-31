// g(maleForm, femaleForm, gender) → returns the correct Arabic gender form
// If gender is unset, defaults to masculine (standard Arabic convention)
export const g = (m, f, gender) => gender === 'female' ? f : m
