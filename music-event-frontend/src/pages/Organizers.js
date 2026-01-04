import React, { useState, useEffect } from "react";
import { FaBuilding, FaCalendarCheck, FaUsers, FaStar, FaMapMarkerAlt, FaEnvelope, FaPhone, FaGlobe, FaTrophy } from "react-icons/fa";
import { userAPI } from "../services/api";
import "./Pages.css";

function Organizers() {
  const [selectedType, setSelectedType] = useState("all");
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getOrganizers();
      // Parse profile JSON strings
      const organizersWithParsedProfiles = response.data.map(organizer => ({
        ...organizer,
        profile: organizer.profile ? (typeof organizer.profile === 'string' ? JSON.parse(organizer.profile) : organizer.profile) : null
      }));
      setOrganizers(organizersWithParsedProfiles);
    } catch (error) {
      console.error('Error fetching organizers:', error);
      setOrganizers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ padding: "40px 20px", minHeight: "80vh", background: "var(--light)" }}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading organizers...</p>
        </div>
      </div>
    );
  }

  const types = ["all", ...new Set(organizers.filter(o => o.profile?.type).map(o => o.profile.type))];

  const filteredOrganizers = selectedType === "all" 
    ? organizers.filter(o => o.profile && Object.keys(o.profile).length > 0)
    : organizers.filter(org => org.profile?.type === selectedType);

  return (
    <div className="page" style={{ padding: "40px 20px", minHeight: "80vh", background: "var(--light)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <h1 style={{ fontSize: "48px", fontWeight: 800, marginBottom: "16px", background: "var(--gradient-1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Event Organizers
          </h1>
          <p style={{ fontSize: "18px", color: "var(--dark-light)" }}>
            Connect with professional event organizers to create memorable music experiences
          </p>
        </div>

        {types.length > 1 && (
          <div style={{ display: "flex", gap: "10px", marginBottom: "40px", flexWrap: "wrap", justifyContent: "center" }}>
            {types.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                style={{
                  padding: "12px 24px",
                  border: "none",
                  background: selectedType === type ? "var(--gradient-1)" : "var(--white)",
                  color: selectedType === type ? "var(--white)" : "var(--dark)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                  boxShadow: "var(--shadow)",
                  textTransform: "capitalize"
                }}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        {filteredOrganizers.length === 0 ? (
          <div style={{ 
            padding: "60px 20px", 
            textAlign: "center", 
            background: "var(--white)", 
            borderRadius: "16px",
            boxShadow: "var(--shadow)"
          }}>
            <FaBuilding style={{ fontSize: "64px", color: "var(--primary)", opacity: 0.3, marginBottom: "20px" }} />
            <h3 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "10px", color: "var(--dark)" }}>
              No organizers available
            </h3>
            <p style={{ color: "var(--dark-light)" }}>
              Organizers will appear here once they sign up and complete their profile.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "30px" }}>
            {filteredOrganizers.map(organizer => {
              const profile = organizer.profile || {};
              return (
                <div
                  key={organizer.id}
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
                      height: "200px",
                      backgroundImage: `linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%), url(https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80)`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <FaBuilding style={{ fontSize: "60px", color: "white", opacity: 0.3 }} />
                    {profile.rating && (
                      <div style={{ position: "absolute", top: "15px", right: "15px", background: "rgba(255,255,255,0.9)", padding: "8px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "5px" }}>
                        <FaStar style={{ color: "#fbbf24" }} />
                        <span style={{ fontWeight: 600, color: "var(--dark)" }}>{profile.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ padding: "30px" }}>
                    <div style={{ marginBottom: "15px" }}>
                      <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px", color: "var(--dark)" }}>
                        {organizer.name}
                      </h3>
                      {profile.type && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                          <FaTrophy style={{ color: "var(--primary)" }} />
                          <span style={{ color: "var(--dark-light)", fontWeight: 500 }}>{profile.type}</span>
                        </div>
                      )}
                    </div>

                    {profile.bio && (
                      <p style={{ color: "var(--dark-light)", marginBottom: "20px", lineHeight: 1.6 }}>
                        {profile.bio}
                      </p>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "15px", marginBottom: "20px", padding: "15px", background: "var(--light)", borderRadius: "8px" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--primary)", marginBottom: "5px" }}>
                          {profile.eventsOrganized || 0}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--dark-light)" }}>Events Organized</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--primary)", marginBottom: "5px" }}>
                          {profile.totalAttendees || "0"}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--dark-light)" }}>Total Attendees</div>
                      </div>
                    </div>

                    {profile.specialties && profile.specialties.length > 0 && (
                      <div style={{ marginBottom: "20px" }}>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--dark)", marginBottom: "10px" }}>Specialties:</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {profile.specialties.map((specialty, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: "6px 12px",
                                background: "rgba(99, 102, 241, 0.1)",
                                color: "var(--primary)",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: 500
                              }}
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                      {profile.location && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--dark-light)" }}>
                          <FaMapMarkerAlt style={{ color: "var(--primary)" }} />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      {(profile.contact || organizer.email) && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--dark-light)" }}>
                          <FaEnvelope style={{ color: "var(--primary)" }} />
                          <span>{profile.contact || organizer.email}</span>
                        </div>
                      )}
                      {profile.phone && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--dark-light)" }}>
                          <FaPhone style={{ color: "var(--primary)" }} />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                      {profile.website && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--dark-light)" }}>
                          <FaGlobe style={{ color: "var(--primary)" }} />
                          <span>{profile.website}</span>
                        </div>
                      )}
                    </div>

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

export default Organizers;
