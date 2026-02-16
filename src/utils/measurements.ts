export type MeasurementSystem = "metric" | "imperial";

// Height conversions
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches % 12);
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = feet * 12 + inches;
  return Math.round(totalInches * 2.54);
}

export function formatHeight(
  value: number,
  unit: string,
  targetSystem: MeasurementSystem
): string {
  if (targetSystem === "imperial") {
    // If stored in cm, convert to ft'in"
    if (unit === "cm") {
      const { feet, inches } = cmToFeetInches(value);
      return `${feet}'${inches}"`;
    }
    // Already in imperial format
    return `${value}`;
  } else {
    // Metric
    if (unit === "cm") {
      return `${value} cm`;
    }
    // Convert from imperial to cm (assuming value is in inches)
    return `${Math.round(value * 2.54)} cm`;
  }
}

// Weight conversions
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.205);
}

export function lbsToKg(lbs: number): number {
  return Math.round(lbs / 2.205);
}

export function formatWeight(
  value: number,
  unit: string,
  targetSystem: MeasurementSystem
): string {
  if (targetSystem === "imperial") {
    if (unit === "kg") {
      return `${kgToLbs(value)} lbs`;
    }
    return `${value} lbs`;
  } else {
    if (unit === "lbs") {
      return `${lbsToKg(value)} kg`;
    }
    return `${value} kg`;
  }
}

// Distance conversions
export function kmToMiles(km: number): number {
  return km * 0.621371;
}

export function milesToKm(miles: number): number {
  return miles / 0.621371;
}

export function formatDistance(
  meters: number,
  targetSystem: MeasurementSystem
): string {
  if (targetSystem === "imperial") {
    const miles = kmToMiles(meters / 1000);
    return `${miles.toFixed(1)} mi`;
  } else {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  }
}

// Generate height options for picker
export function generateHeightOptions(system: MeasurementSystem) {
  if (system === "metric") {
    // 120cm to 220cm
    return Array.from({ length: 101 }, (_, i) => ({
      value: 120 + i,
      label: `${120 + i} cm`,
    }));
  } else {
    // 4'0" to 7'4" (roughly 120cm to 220cm)
    const options: { value: number; label: string; feet: number; inches: number }[] = [];
    for (let feet = 4; feet <= 7; feet++) {
      const maxInches = feet === 7 ? 4 : 11;
      for (let inches = 0; inches <= maxInches; inches++) {
        const cm = feetInchesToCm(feet, inches);
        if (cm >= 120 && cm <= 224) {
          options.push({
            value: cm, // Store as cm internally
            label: `${feet}'${inches}"`,
            feet,
            inches,
          });
        }
      }
    }
    return options;
  }
}

// Generate weight options for picker
export function generateWeightOptions(system: MeasurementSystem) {
  if (system === "metric") {
    // 40kg to 150kg
    return Array.from({ length: 111 }, (_, i) => ({
      value: 40 + i,
      label: `${40 + i} kg`,
    }));
  } else {
    // ~88lbs to ~330lbs (roughly 40kg to 150kg)
    const options: { value: number; label: string }[] = [];
    for (let lbs = 88; lbs <= 330; lbs++) {
      const kg = lbsToKg(lbs);
      if (kg >= 40 && kg <= 150) {
        options.push({
          value: kg, // Store as kg internally
          label: `${lbs} lbs`,
        });
      }
    }
    return options;
  }
}
