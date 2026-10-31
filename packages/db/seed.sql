-- VeriFind local development seed. Run with:
--   bunx wrangler d1 execute DB --local --file=../../packages/db/seed.sql
-- (from apps/server)
INSERT INTO "user" ("id", "name", "email", "email_verified", "created_at", "updated_at")
VALUES (
	'seed-landlord-01',
	'VeriFind Listings',
	'listings@verifind.local',
	1,
	cast(unixepoch('subsecond') * 1000 as integer),
	cast(unixepoch('subsecond') * 1000 as integer)
) ON CONFLICT ("id") DO NOTHING;

INSERT INTO property (
	"id", "owner_id", "title", "description", "property_type", "price", "price_period",
	"bedrooms", "bathrooms", "area_sqm", "address", "city", "state", "latitude", "longitude",
	"amenities", "images", "status", "verification_status", "verified_at", "created_at", "updated_at"
) VALUES
(
	'prop-yaba-01', 'seed-landlord-01',
	'2 Bedroom Apartment',
	'This modern 2-bedroom apartment is located in a serene and secure neighborhood in Yaba, Lagos. It offers contemporary finishes, spacious living areas, modern bathrooms, and excellent lighting. The property offers ample parking, a steady power supply, and 24/7 security.',
	'apartment', 1200000, 'year', 2, 2, 85,
	'Herbert Macaulay Way', 'Yaba', 'Lagos', 6.5095, 3.3711,
	'["parking_space","security_guard","fitted_kitchen","balcony","tiled_floor","prepaid_meter"]',
	'["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=900&auto=format&fit=crop","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=900&auto=format&fit=crop","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=900&auto=format&fit=crop"]',
	'available', 'verified', cast(unixepoch('subsecond') * 1000 as integer) - 86400000,
	cast(unixepoch('subsecond') * 1000 as integer) - 172800000,
	cast(unixepoch('subsecond') * 1000 as integer) - 86400000
),
(
	'prop-yaba-02', 'seed-landlord-01',
	'3 Bedroom Duplex',
	'A beautifully finished 3-bedroom duplex in the heart of Yaba. Features a spacious family lounge, fitted kitchen with island, all rooms en-suite, and a private compound with dedicated parking for three cars. Solar backup covers the essential loads.',
	'duplex', 2800000, 'year', 3, 4, 180,
	'Alagomeji', 'Yaba', 'Lagos', 6.5158, 3.3898,
	'["parking_space","security_guard","fitted_kitchen","solar_power","air_conditioning","balcony"]',
	'["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=900&auto=format&fit=crop","https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=900&auto=format&fit=crop"]',
	'available', 'verified', cast(unixepoch('subsecond') * 1000 as integer) - 86400000,
	cast(unixepoch('subsecond') * 1000 as integer) - 259200000,
	cast(unixepoch('subsecond') * 1000 as integer) - 86400000
),
(
	'prop-lekki-01', 'seed-landlord-01',
	'3 Bedroom Apartment',
	'Fully serviced 3-bedroom apartment in a gated estate off the Lekki-Epe expressway. Round-the-clock security, treated water supply, gym and swimming pool access. Walking distance to shops and restaurants in Lekki Phase 1.',
	'apartment', 3500000, 'year', 3, 3, 140,
	'Admiralty Way, Lekki Phase 1', 'Lekki', 'Lagos', 6.4281, 3.4219,
	'["parking_space","security_guard","fitted_kitchen","air_conditioning","water_heater","smart_tv","balcony"]',
	'["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=900&auto=format&fit=crop","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=900&auto=format&fit=crop","https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=900&auto=format&fit=crop"]',
	'available', 'verified', cast(unixepoch('subsecond') * 1000 as integer) - 86400000,
	cast(unixepoch('subsecond') * 1000 as integer) - 345600000,
	cast(unixepoch('subsecond') * 1000 as integer) - 86400000
),
(
	'prop-lekki-02', 'seed-landlord-01',
	'4 Bedroom Terrace Duplex',
	'Spacious 4-bedroom terrace duplex in a secure estate in Lekki. All bedrooms en-suite, a guest toilet, fitted kitchen with pantry, and a small private garden. The estate has 24/7 power supply and perimeter security.',
	'duplex', 4500000, 'year', 4, 5, 220,
	'Chevron Drive', 'Lekki', 'Lagos', 6.4408, 3.4721,
	'["parking_space","security_guard","fitted_kitchen","solar_power","air_conditioning","prepaid_meter"]',
	'["https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=900&auto=format&fit=crop","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=900&auto=format&fit=crop"]',
	'available', 'verified', cast(unixepoch('subsecond') * 1000 as integer) - 86400000,
	cast(unixepoch('subsecond') * 1000 as integer) - 432000000,
	cast(unixepoch('subsecond') * 1000 as integer) - 86400000
),
(
	'prop-ikeja-01', 'seed-landlord-01',
	'Self Contained Apartment',
	'Neat self-contained unit in Ikeja GRA, ideal for a young professional. Comes with a kitchenette, private bathroom and dedicated parking. Generator and borehole on the premises, with a caretaker on site.',
	'self_contained', 900000, 'year', 1, 1, 42,
	'GRA, Ikeja', 'Ikeja', 'Lagos', 6.5833, 3.3417,
	'["parking_space","security_guard","tiled_floor","prepaid_meter","borehole"]',
	'["https://images.unsplash.com/photo-1592595896551-12b371d546d5?q=80&w=900&auto=format&fit=crop","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=900&auto=format&fit=crop"]',
	'available', 'verified', cast(unixepoch('subsecond') * 1000 as integer) - 86400000,
	cast(unixepoch('subsecond') * 1000 as integer) - 518400000,
	cast(unixepoch('subsecond') * 1000 as integer) - 86400000
),
(
	'prop-surulere-01', 'seed-landlord-01',
	'1 Bedroom Apartment',
	'Cozy 1-bedroom apartment in a quiet street off Bode Thomas, Surulere. Recently renovated with new tiles, modern kitchen fittings and secure windows. Water and waste disposal are included in the rent.',
	'apartment', 750000, 'year', 1, 1, 48,
	'Bode Thomas Street', 'Surulere', 'Lagos', 6.4969, 3.3503,
	'["security_guard","tiled_floor","prepaid_meter","borehole"]',
	'["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=900&auto=format&fit=crop"]',
	'available', 'verified', cast(unixepoch('subsecond') * 1000 as integer) - 86400000,
	cast(unixepoch('subsecond') * 1000 as integer) - 604800000,
	cast(unixepoch('subsecond') * 1000 as integer) - 86400000
),
(
	'prop-gbagada-01', 'seed-landlord-01',
	'Room in Shared Apartment',
	'A private room in a well-kept shared apartment in Gbagada. Shared kitchen and living room with two other quiet tenants. Cleaning of common areas included, plus 24/7 security and steady water supply.',
	'shared_apartment', 450000, 'year', 1, 1, 25,
	'Millennium Estate, Gbagada', 'Gbagada', 'Lagos', 6.5556, 3.3833,
	'["security_guard","fitted_kitchen","borehole","prepaid_meter"]',
	'["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=900&auto=format&fit=crop"]',
	'available', 'pending', NULL,
	cast(unixepoch('subsecond') * 1000 as integer) - 691200000,
	cast(unixepoch('subsecond') * 1000 as integer) - 691200000
),
(
	'prop-vi-01', 'seed-landlord-01',
	'3 Bedroom Luxury Apartment',
	'Stunning 3-bedroom luxury apartment with ocean views in Victoria Island. Floor-to-ceiling windows, fully fitted kitchen with premium appliances, concierge service, gym, pool and covered parking. 24/7 power and security.',
	'apartment', 8000000, 'year', 3, 4, 210,
	'Adeola Odeku Street', 'Victoria Island', 'Lagos', 6.4281, 3.4109,
	'["parking_space","security_guard","fitted_kitchen","air_conditioning","smart_tv","water_heater","solar_power","balcony"]',
	'["https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=900&auto=format&fit=crop","https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=900&auto=format&fit=crop","https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=900&auto=format&fit=crop"]',
	'available', 'verified', cast(unixepoch('subsecond') * 1000 as integer) - 86400000,
	cast(unixepoch('subsecond') * 1000 as integer) - 777600000,
	cast(unixepoch('subsecond') * 1000 as integer) - 86400000
);
