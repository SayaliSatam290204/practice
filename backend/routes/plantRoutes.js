const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const {
    addPlant,
    getAllPlants,
    getPlantById,
    updatePlant,
    deletePlant,
    getPlantsByCategory,
    getActivePlants,
    searchPlant,
    getPlantsByPrice,
    getIndoorPlants,
    getOutdoorPlants
} = require('../controllers/plantController');

router.get('/', getAllPlants);
router.post('/add', protect, adminOnly, upload.single('image'), addPlant);
router.get('/active', getActivePlants);
router.get('/indoor', getIndoorPlants);
router.get('/outdoor', getOutdoorPlants);
router.get('/category/:category', getPlantsByCategory);
router.get('/search/:name', searchPlant);
router.get('/price', getPlantsByPrice);
router.get('/:id', getPlantById);
router.put('/:id', protect, adminOnly, upload.single('image'), updatePlant);
router.delete('/:id', protect, adminOnly, deletePlant);

module.exports = router;
