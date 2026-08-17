import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    FaLeaf,
    FaSearch,
    FaFilter,
} from "react-icons/fa";

import api from "../services/api";
import PlantCard from "../components/plants/PlantCard";


const Plants = () => {

    const [plants, setPlants] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const location = useLocation();

    // Read initial filters from URL
    const getInitialFilter = (paramName) => {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get(paramName) || "all";
    };

    const [categoryGroup, setCategoryGroup] = useState(getInitialFilter("categoryGroup"));
    const [category, setCategory] = useState(getInitialFilter("category"));
    const [sortBy, setSortBy] = useState("featured");
    const [priceRange, setPriceRange] = useState("all");
    const [environment, setEnvironment] = useState("all");

    // Sync state if URL changes (e.g. clicking mega menu while already on /plants)
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const urlCat = searchParams.get('category') || "all";
        const urlGroup = searchParams.get('categoryGroup') || "all";
        if (urlCat !== category) setCategory(urlCat);
        if (urlGroup !== categoryGroup) setCategoryGroup(urlGroup);
    }, [location.search]);


    // =========================
    // FETCH PLANTS
    // =========================

    useEffect(() => {

        const fetchPlants = async () => {

            try {

                setLoading(true);

                setError("");

                const response =
                    await api.get("/plants");

                const plantData =
                    response.data?.plants ||
                    response.data?.data ||
                    response.data;

                setPlants(
                    Array.isArray(plantData)
                        ? plantData
                        : []
                );

            } catch (err) {

                console.error(
                    "Failed to fetch plants:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Unable to load plants."
                );

            } finally {

                setLoading(false);

            }

        };

        fetchPlants();

    }, []);


    // =========================
    // CATEGORIES
    // =========================

    const categoryGroups = [
        "all",
        ...new Set(
            plants
                .map((plant) => plant.categoryGroup)
                .filter(Boolean)
        ),
    ];

    const availableCategories = [
        "all",
        ...new Set(
            plants
                .filter(p => categoryGroup === "all" || p.categoryGroup === categoryGroup)
                .map((plant) => plant.category)
                .filter(Boolean)
        ),
    ];


    // =========================
    // FILTER PLANTS
    // =========================

    let filteredPlants = plants.filter((plant) => {

        const matchesSearch =
            plant.name
                ?.toLowerCase()
                .includes(
                    search.toLowerCase()
                );

        const matchesCategoryGroup =
            categoryGroup === "all" ||
            plant.categoryGroup === categoryGroup;

        const matchesCategory =
            category === "all" ||
            plant.category === category;

        const currentPrice = plant.discountPrice && plant.discountPrice < plant.price ? plant.discountPrice : plant.price;
        
        let matchesPriceRange = true;
        if (priceRange === "under500") matchesPriceRange = currentPrice < 500;
        else if (priceRange === "500to1000") matchesPriceRange = currentPrice >= 500 && currentPrice <= 1000;
        else if (priceRange === "over1000") matchesPriceRange = currentPrice > 1000;

        let matchesEnvironment = true;
        if (environment === "indoor") matchesEnvironment = plant.isIndoor === true;
        else if (environment === "outdoor") matchesEnvironment = plant.isOutdoor === true;

        return (
            matchesSearch &&
            matchesCategoryGroup &&
            matchesCategory &&
            matchesPriceRange &&
            matchesEnvironment
        );

    });

    // =========================
    // SORT PLANTS
    // =========================

    if (sortBy === "priceLowToHigh") {
        filteredPlants.sort((a, b) => {
            const priceA = a.discountPrice && a.discountPrice < a.price ? a.discountPrice : a.price;
            const priceB = b.discountPrice && b.discountPrice < b.price ? b.discountPrice : b.price;
            return priceA - priceB;
        });
    } else if (sortBy === "priceHighToLow") {
        filteredPlants.sort((a, b) => {
            const priceA = a.discountPrice && a.discountPrice < a.price ? a.discountPrice : a.price;
            const priceB = b.discountPrice && b.discountPrice < b.price ? b.discountPrice : b.price;
            return priceB - priceA;
        });
    } else if (sortBy === "topRated") {
        filteredPlants.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (
            <main className="plants-page">

                <div className="plants-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading plants...
                    </p>

                </div>

            </main>
        );

    }


    return (

        <main className="plants-page">

            <div className="plants-container">


                {/* =========================
                    HEADER
                ========================== */}

                <section className="plants-header">

                    <div>

                        <span className="plants-eyebrow">

                            <FaLeaf />

                            Our Collection

                        </span>

                        <h1>
                            Explore Plants
                        </h1>

                        <p>
                            Discover beautiful plants
                            for your home and garden.
                        </p>

                    </div>

                </section>


                {/* =========================
                    SEARCH & FILTER
                ========================== */}

                <section className="plants-toolbar" style={{ flexWrap: 'wrap', gap: '15px' }}>


                    {/* SEARCH */}

                    <div className="plants-search">

                        <FaSearch />

                        <input
                            type="text"
                            placeholder="Search plants..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* CATEGORY GROUP */}

                    <div className="plants-filter" style={{ minWidth: '180px' }}>

                        <FaFilter />

                        <select
                            value={categoryGroup}
                            onChange={(e) => {
                                setCategoryGroup(e.target.value);
                                setCategory("all"); // Reset subcategory when group changes
                            }}
                        >

                            {categoryGroups.map(
                                (item) => (

                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item === "all"
                                            ? "All Groups"
                                            : item}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* SUB CATEGORY */}

                    <div className="plants-filter" style={{ minWidth: '180px' }}>

                        <FaFilter />

                        <select
                            value={category}
                            onChange={(e) =>
                                setCategory(
                                    e.target.value
                                )
                            }
                        >

                            {availableCategories.map(
                                (item) => (

                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item === "all"
                                            ? "All Subcategories"
                                            : item}
                                    </option>

                                )
                            )}

                        </select>

                    </div>

                    {/* SORT BY */}
                    <div className="plants-filter" style={{ minWidth: '160px' }}>
                        <FaFilter />
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="featured">Featured</option>
                            <option value="priceLowToHigh">Price: Low to High</option>
                            <option value="priceHighToLow">Price: High to Low</option>
                            <option value="topRated">Top Rated</option>
                        </select>
                    </div>

                    {/* PRICE RANGE */}
                    <div className="plants-filter" style={{ minWidth: '160px' }}>
                        <FaFilter />
                        <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
                            <option value="all">All Prices</option>
                            <option value="under500">Under ₹500</option>
                            <option value="500to1000">₹500 - ₹1000</option>
                            <option value="over1000">Over ₹1000</option>
                        </select>
                    </div>

                    {/* ENVIRONMENT */}
                    <div className="plants-filter" style={{ minWidth: '160px' }}>
                        <FaFilter />
                        <select value={environment} onChange={(e) => setEnvironment(e.target.value)}>
                            <option value="all">All Environments</option>
                            <option value="indoor">Indoor</option>
                            <option value="outdoor">Outdoor</option>
                        </select>
                    </div>

                </section>


                {/* =========================
                    ERROR
                ========================== */}

                {error && (

                    <div className="plants-error">

                        <FaLeaf />

                        <h2>
                            Something went wrong
                        </h2>

                        <p>
                            {error}
                        </p>

                        <button
                            onClick={() =>
                                window.location.reload()
                            }
                        >
                            Try Again
                        </button>

                    </div>

                )}


                {/* =========================
                    EMPTY
                ========================== */}

                {!error &&
                    filteredPlants.length === 0 && (

                        <div className="plants-empty">

                            <FaLeaf />

                            <h2>
                                No Plants Found
                            </h2>

                            <p>
                                Try changing your
                                search or category.
                            </p>

                        </div>

                    )}


                {/* =========================
                    PLANT GRID
                ========================== */}

                {!error &&
                    filteredPlants.length > 0 && (

                        <section className="plants-grid">

                            {filteredPlants.map(
                                (plant) => (

                                    <PlantCard
                                        key={plant._id}
                                        plant={plant}
                                    />

                                )
                            )}

                        </section>

                    )}

            </div>

        </main>

    );

};


export default Plants;