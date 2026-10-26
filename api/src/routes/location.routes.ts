import { Router } from 'express';
import {
  handleReverseGeocode,
  handleSearchLocations,
  handleSaveLocation,
} from '../controllers/location.controller';

const router = Router();

router.get('/location/reverse-geocode', handleReverseGeocode);
router.post('/location/reverse-geocode', handleReverseGeocode);

router.get('/location/search', handleSearchLocations);
router.post('/location/search', handleSearchLocations);

router.post('/location/save', handleSaveLocation);

export default router;

