import { useState, useEffect } from "react";
import api from "../../services/api";
import PlantCard from "./PlantCard";
import "./RecommendedPlants.css";

const RecommendedPlants = ({ currentPlantId, category }) => {
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await api.get('/plants');
                // Filter out the current plant
                let plants = response.data.plants || [];
                if (currentPlantId) {
                    plants = plants.filter(p => p._id !== currentPlantId && p._id !== currentPlantId._id);
                }
                
                // Prioritize matching category
                let recommendedPool = [];
                if (category) {
                    const sameCategory = plants.filter(p => p.category === category);
                    const others = plants.filter(p => p.category !== category);
                    
                    const shuffledSameCategory = sameCategory.sort(() => 0.5 - Math.random());
                    const shuffledOthers = others.sort(() => 0.5 - Math.random());
                    
                    recommendedPool = [...shuffledSameCategory, ...shuffledOthers];
                } else {
                    recommendedPool = plants.sort(() => 0.5 - Math.random());
                }

                setRecommended(recommendedPool.slice(0, 4));
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch recommendations", error);
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [currentPlantId]);

    if (loading || recommended.length === 0) return null;

    return (
        <div className="recommended-section">
            <h3 className="recommended-title">You Might Also Like</h3>
            <div className="recommended-grid">
                {recommended.map(plant => (
                    <PlantCard key={plant._id} plant={plant} />
                ))}
            </div>
        </div>
    );
};

export default RecommendedPlants;
