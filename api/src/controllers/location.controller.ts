import { Request, Response } from 'express';
import {
  reverseGeocodeCoordinates,
  searchLocations,
  saveUserLocation,
} from '../services/location.service';

export const handleReverseGeocode = async (req: Request, res: Response) => {
  try {
    const lat = parseFloat((req.query.lat as string) || (req.body.lat as string));
    const lon = parseFloat(
      (req.query.lon as string) ||
        (req.query.lng as string) ||
        (req.body.lon as string) ||
        (req.body.lng as string)
    );

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude provided.',
      });
    }

    const result = await reverseGeocodeCoordinates(lat, lon);
    return res.json({
      success: true,
      data: {
        ...result,
        latitude: lat,
        longitude: lon,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to reverse geocode coordinates.',
      details: err?.message,
    });
  }
};

export const handleSearchLocations = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || (req.query.query as string) || (req.body?.query as string) || '';
    const results = await searchLocations(query);
    return res.json({
      success: true,
      data: results,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to search locations.',
      details: err?.message,
    });
  }
};

export const handleSaveLocation = async (req: Request, res: Response) => {
  try {
    const { address, latitude, longitude, city, pincode, isGpsVerified } = req.body;
    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address is required to save location.',
      });
    }

    const saved = saveUserLocation({
      address,
      latitude: typeof latitude === 'number' ? latitude : 0,
      longitude: typeof longitude === 'number' ? longitude : 0,
      city,
      pincode,
      isGpsVerified,
    });

    return res.json({
      success: true,
      message: 'Location saved successfully.',
      data: saved,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to save location.',
      details: err?.message,
    });
  }
};

