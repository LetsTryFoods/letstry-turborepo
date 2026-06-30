import { Injectable } from '@nestjs/common';

@Injectable()
export class LogisticsService {
  /**
   * Determine region and rate from address.
   * Simple heuristic:
   * NCR: Delhi, Noida, Gurgaon, Ghaziabad, Faridabad.
   * Metro Cities: Mumbai, Chennai, Kolkata, Bangalore, Hyderabad, Pune, Ahmedabad.
   * Special Locations: Manipur, Mizoram, Nagaland, Tripura, Arunachal Pradesh, Meghalaya, Sikkim, Assam, J&K.
   * North India: Punjab, Haryana, UP, Uttarakhand, Himachal Pradesh, Chandigarh, Rajasthan.
   * Rest of India: Default.
   */
  getRegionAndRate(state: string, city: string): { region: string; rate: number } {
    const s = (state || '').toLowerCase();
    const c = (city || '').toLowerCase();

    // NCR
    if (s.includes('delhi') || ['noida', 'gurgaon', 'gurugram', 'ghaziabad', 'faridabad'].some(x => c.includes(x))) {
      return { region: 'NCR', rate: 30 };
    }

    // Special Locations
    const specialStates = ['manipur', 'mizoram', 'nagaland', 'tripura', 'arunachal', 'meghalaya', 'sikkim', 'assam', 'jammu', 'kashmir'];
    if (specialStates.some(x => s.includes(x))) {
      return { region: 'Special Locations', rate: 60 };
    }

    // Metro Cities
    const metroCities = ['mumbai', 'chennai', 'kolkata', 'bangalore', 'bengaluru', 'hyderabad', 'pune', 'ahmedabad'];
    if (metroCities.some(x => c.includes(x))) {
      return { region: 'Metro Cities', rate: 45 };
    }

    // North India
    const northStates = ['punjab', 'haryana', 'uttar pradesh', 'uttarakhand', 'himachal', 'chandigarh', 'rajasthan'];
    if (northStates.some(x => s.includes(x))) {
      return { region: 'North India', rate: 40 };
    }

    // Rest of India
    return { region: 'Rest of India', rate: 50 };
  }

  /**
   * Volumetric Weight = (L × B × H in cm) / 4500
   */
  calculateVolumetricWeight(lCm: number, bCm: number, hCm: number): number {
    return (lCm * bCm * hCm) / 4500;
  }

  /**
   * Calculate base cost = Volumetric Weight (rounded up to next 0.5kg or 1kg? Let's just use exact or rounded up? Wait, usually logistics rounds up to 0.5kg)
   * The formula given didn't mention rounding, so we use exact volumetric weight for now.
   */
  calculateBaseCost(volumetricWeight: number, rate: number): number {
    return volumetricWeight * rate;
  }

  /**
   * Calculate total monthly cost with surcharges.
   * Fuel Charge: 25%
   * FOV: 0.2%
   * GST: 18% (Applied on Base + Fuel + FOV)
   */
  calculateTotalCostWithSurcharges(baseCost: number): number {
    const fuel = baseCost * 0.25;
    const fov = baseCost * 0.002;
    const preGst = baseCost + fuel + fov;
    const gst = preGst * 0.18;
    return preGst + gst;
  }
}
