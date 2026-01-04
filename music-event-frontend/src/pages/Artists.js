import React, { useState, useEffect } from "react";
import { FaMusic, FaMicrophone, FaCalendarAlt, FaRupeeSign, FaStar, FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa";
import { userAPI } from "../services/api";
import "./Pages.css";

function Artists() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getArtists();
      // Parse profile JSON strings
      const artistsWithParsedProfiles = response.data.map(artist => ({
        ...artist,
        profile: artist.profile ? (typeof artist.profile === 'string' ? JSON.parse(artist.profile) : artist.profile) : null
      }));
      setArtists(artistsWithParsedProfiles);
    } catch (error) {
      console.error('Error fetching artists:', error);
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ padding: "40px 20px", minHeight: "80vh", background: "var(--light)" }}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading artists...</p>
        </div>
      </div>
    );
  }

  const categories = ["all", ...new Set(artists.filter(a => a.profile?.genre).map(a => a.profile.genre))];

  const filteredArtists = selectedCategory === "all" 
    ? artists.filter(a => a.profile && Object.keys(a.profile).length > 0)
    : artists.filter(artist => artist.profile?.genre === selectedCategory);

  return (
    <div className="page" style={{ padding: "40px 20px", minHeight: "80vh", background: "var(--light)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <h1 style={{ fontSize: "48px", fontWeight: 800, marginBottom: "16px", background: "var(--gradient-1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Artists & Musicians
          </h1>
          <p style={{ fontSize: "18px", color: "var(--dark-light)" }}>
            Discover talented artists and book them for your events
          </p>
        </div>

        {categories.length > 1 && (
          <div style={{ display: "flex", gap: "10px", marginBottom: "40px", flexWrap: "wrap", justifyContent: "center" }}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: "12px 24px",
                  border: "none",
                  background: selectedCategory === category ? "var(--gradient-1)" : "var(--white)",
                  color: selectedCategory === category ? "var(--white)" : "var(--dark)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                  boxShadow: "var(--shadow)",
                  textTransform: "capitalize"
                }}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {filteredArtists.length === 0 ? (
          <div style={{ 
            padding: "60px 20px", 
            textAlign: "center", 
            background: "var(--white)", 
            borderRadius: "16px",
            boxShadow: "var(--shadow)"
          }}>
            <FaMusic style={{ fontSize: "64px", color: "var(--primary)", opacity: 0.3, marginBottom: "20px" }} />
            <h3 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "10px", color: "var(--dark)" }}>
              No artists available
            </h3>
            <p style={{ color: "var(--dark-light)" }}>
              Artists will appear here once they sign up and complete their profile.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "30px" }}>
            {filteredArtists.map(artist => {
              const profile = artist.profile || {};
              return (
                <div
                  key={artist.id}
                  style={{
                    background: "var(--white)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "var(--shadow)",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-10px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "var(--shadow)";
                  }}
                >
                  <div
                    style={{
                      height: "250px",
                      backgroundImage: `linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%), url(https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80)`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <FaMusic style={{ fontSize: "60px", color: "white", opacity: 0.3 }} />
                  </div>
                  
                  <div style={{ padding: "30px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
                      <div>
                        <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px", color: "var(--dark)" }}>
                          {artist.name}
                        </h3>
                        {profile.genre && (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                            <FaMicrophone style={{ color: "var(--primary)" }} />
                            <span style={{ color: "var(--dark-light)", fontWeight: 500 }}>{profile.genre}</span>
                          </div>
                        )}
                      </div>
                      {profile.rating && (
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <FaStar style={{ color: "#fbbf24" }} />
                          <span style={{ fontWeight: 600, color: "var(--dark)" }}>{profile.rating}</span>
                        </div>
                      )}
                    </div>

                    {profile.bio && (
                      <p style={{ color: "var(--dark-light)", marginBottom: "20px", lineHeight: 1.6 }}>
                        {profile.bio}
                      </p>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                      {profile.location && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--dark-light)" }}>
                          <FaMapMarkerAlt style={{ color: "var(--primary)" }} />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      {profile.upcomingShows !== undefined && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--dark-light)" }}>
                          <FaCalendarAlt style={{ color: "var(--primary)" }} />
                          <span>{profile.upcomingShows || 0} Upcoming Shows</span>
                        </div>
                      )}
                      {artist.email && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--dark-light)" }}>
                          <FaEnvelope style={{ color: "var(--primary)" }} />
                          <span>{artist.email}</span>
                        </div>
                      )}
                      {profile.phone && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--dark-light)" }}>
                          <FaPhone style={{ color: "var(--primary)" }} />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                    </div>

                    {(profile.price || profile.price === 0) && (
                      <div style={{ paddingTop: "20px", borderTop: "2px solid var(--light)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <span style={{ fontSize: "14px", color: "var(--dark-light)", marginRight: "8px" }}>Performance Fee:</span>
                          <FaRupeeSign style={{ color: "var(--primary)", fontSize: "20px" }} />
                          <span style={{ fontSize: "24px", fontWeight: 700, color: "var(--primary)" }}>
                            ₹{parseInt(profile.price).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Artists;
