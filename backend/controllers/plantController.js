const Plant = require('../models/Plant');

//Add New Plant
//API: POST /api/plants/add
const addPlant = async (req, res) => {
    try {
        const plantData = { ...req.body };
        if (req.file) {
            plantData.image = req.file.path;
        }
        const plant = await Plant.create(plantData);

        res.status(201).json({
            message: 'Plant added successfully',
            plant
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Get All Plant
//API: GET /api/plants
const getAllPlants = async (req, res) => {
    try {
        const plants = await Plant.find();

        res.status(200).json(plants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Get Plant By Id
//API: GET /api/plants/:id
const getPlantById = async (req, res) => {
    try {
        const plant = await Plant.findById(req.params.id);

        if (!plant) {
            return res.status(404).json({
                message: 'Plant Not Found'
            });
        }

        res.status(200).json(plant);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Update Plant
//API: PUT /api/plants/:id
const updatePlant = async (req, res) => {
    try {
        const plantData = { ...req.body };
        if (req.file) {
            plantData.image = req.file.path;
        }
        
        const plant = await Plant.findByIdAndUpdate(
            req.params.id,
            plantData,
            { new: true }
        );

        if (!plant) {
            return res.status(404).json({
                message: 'Plant Not Found'
            });
        }
        res.status(200).json({
            message: 'Plant Updated Successfully',
            plant
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Delete Plant
//API: DELETE /api/plants/:id
const deletePlant = async (req, res) => {
    try {
        const plant = await Plant.findByIdAndDelete(req.params.id);

        if (!plant) {
            return res.status(404).json({
                message: 'Plant Not Found'
            });
        }
        res.status(200).json({
            message: 'Plant Deleted Successfully',
            plant
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Get Plants By Category
//API: GET /api/plants/category/:category
const getPlantsByCategory = async (req, res) => {
    try {
        const plants = await Plant.find({
            category: req.params.category
        });

        res.status(200).json(plants);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Get Active Plant
//API: GET /api/plants/active
const getActivePlants = async (req, res) => {
    try {
        const plants = await Plant.find({
            active: true
        });

        res.status(200).json(plants);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Search Plants By Name
//API: GET /api/plants/search/:name
const searchPlant = async (req, res) => {
    try {
        const plants = await Plant.find({
            name: {
                $regex: req.params.name,
                $options: 'i'
            }
        });

        res.status(200).json(plants);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Get Plants By Price Range
//API: GET /api/plants/price
const getPlantsByPrice = async (req, res) => {
    try {

        const minPrice = Number(req.query.minPrice);
        const maxPrice = Number(req.query.maxPrice);

        const plants = await Plant.find({
            price: {
                $gte: minPrice,
                $lte: maxPrice
            }
        });

        res.status(200).json(plants);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Get Indoor Plants
//API: GET /api/plants/indoor
const getIndoorPlants = async (req, res) => {
    try {
        const plants = await Plant.find({
            isIndoor: true
        });

        res.status(200).json(plants);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

//Get Outdoor Plants
//API: GET /api/plants/outdoor
const getOutdoorPlants = async (req, res) => {
    try {
        const plants = await Plant.find({
            isOutdoor: true
        });

        res.status(200).json(plants);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
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
    getOutdoorPlants,
}