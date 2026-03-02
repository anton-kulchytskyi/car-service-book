export type CarMake = {
  make: string
  models: string[]
}

export const CAR_DATA: CarMake[] = [
  { make: 'Acura', models: ['ILX', 'MDX', 'RDX', 'TLX'] },
  { make: 'Alfa Romeo', models: ['147', '156', '159', '166', 'Giulia', 'Giulietta', 'Stelvio'] },
  { make: 'Audi', models: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'e-tron', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'TT'] },
  { make: 'BMW', models: ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4', 'iX', 'i3', 'i4'] },
  { make: 'BYD', models: ['Atto 3', 'Dolphin', 'Han', 'Seal', 'Song', 'Tang'] },
  { make: 'Chery', models: ['Arrizo 5', 'Arrizo 8', 'Tiggo 4', 'Tiggo 7', 'Tiggo 8'] },
  { make: 'Chevrolet', models: ['Aveo', 'Camaro', 'Captiva', 'Cobalt', 'Corvette', 'Cruze', 'Epica', 'Equinox', 'Lacetti', 'Malibu', 'Orlando', 'Spark', 'Suburban', 'Tahoe', 'Trailblazer', 'Traverse'] },
  { make: 'Citroën', models: ['Berlingo', 'C-Crosser', 'C1', 'C2', 'C3', 'C4', 'C5', 'C5 Aircross', 'C8', 'DS3', 'DS4', 'DS5', 'Jumper', 'Jumpy', 'Picasso', 'SpaceTourer', 'Xsara'] },
  { make: 'Dacia', models: ['Duster', 'Jogger', 'Logan', 'Sandero', 'Solenza', 'Spring'] },
  { make: 'Daewoo', models: ['Lanos', 'Leganza', 'Matiz', 'Nexia', 'Nubira', 'Sens', 'Tacuma'] },
  { make: 'Dodge', models: ['Challenger', 'Charger', 'Durango', 'Journey', 'RAM 1500'] },
  { make: 'Fiat', models: ['500', '500X', 'Bravo', 'Doblo', 'Ducato', 'Fiorino', 'Panda', 'Punto', 'Scudo', 'Tipo'] },
  { make: 'Ford', models: ['C-Max', 'Edge', 'Escape', 'Expedition', 'Explorer', 'F-150', 'Fiesta', 'Focus', 'Fusion', 'Galaxy', 'Kuga', 'Mondeo', 'Mustang', 'Puma', 'Ranger', 'S-Max', 'Transit', 'Transit Connect'] },
  { make: 'Geely', models: ['Atlas', 'Coolray', 'Emgrand', 'Tugella'] },
  { make: 'Honda', models: ['Accord', 'City', 'Civic', 'CR-V', 'CR-Z', 'Element', 'Fit', 'HR-V', 'Jazz', 'Odyssey', 'Pilot', 'Ridgeline'] },
  { make: 'Hyundai', models: ['Accent', 'Creta', 'Elantra', 'Grandeur', 'i10', 'i20', 'i30', 'i40', 'ix35', 'IONIQ', 'IONIQ 5', 'IONIQ 6', 'Kona', 'Santa Fe', 'Sonata', 'Tucson', 'Venue'] },
  { make: 'Infiniti', models: ['FX35', 'FX37', 'Q30', 'Q50', 'Q60', 'QX50', 'QX56', 'QX60', 'QX80'] },
  { make: 'Isuzu', models: ['D-Max', 'MU-X', 'Trooper'] },
  { make: 'Jeep', models: ['Cherokee', 'Commander', 'Compass', 'Grand Cherokee', 'Renegade', 'Wrangler'] },
  { make: 'Kia', models: ['Carens', 'Carnival', 'Ceed', 'EV6', 'Niro', 'Optima', 'Picanto', 'ProCeed', 'Rio', 'Sorento', 'Soul', 'Sportage', 'Stinger', 'Stonic', 'Telluride', 'Venga', 'XCeed'] },
  { make: 'Lada', models: ['2101', '2102', '2103', '2104', '2105', '2106', '2107', '2108', '2109', '2110', '2111', '2112', '2113', '2114', '2115', 'Granta', 'Kalina', 'Largus', 'Niva', 'Priora', 'Vesta', 'XRAY'] },
  { make: 'Land Rover', models: ['Defender', 'Discovery', 'Discovery Sport', 'Freelander', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar'] },
  { make: 'Lexus', models: ['CT', 'ES', 'GS', 'GX', 'IS', 'LC', 'LX', 'NX', 'RC', 'RX', 'UX'] },
  { make: 'Mazda', models: ['2', '3', '5', '6', 'CX-3', 'CX-30', 'CX-5', 'CX-7', 'CX-9', 'MX-5', 'MX-30'] },
  { make: 'Mercedes-Benz', models: ['A-Class', 'B-Class', 'C-Class', 'CLA', 'CLS', 'E-Class', 'EQC', 'G-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLK', 'GLS', 'ML-Class', 'S-Class', 'Sprinter', 'V-Class', 'Vito'] },
  { make: 'Mini', models: ['Clubman', 'Convertible', 'Cooper', 'Countryman', 'Paceman'] },
  { make: 'Mitsubishi', models: ['ASX', 'Eclipse Cross', 'Galant', 'L200', 'Lancer', 'Outlander', 'Pajero', 'Pajero Sport', 'Space Star'] },
  { make: 'Nissan', models: ['Ariya', 'Juke', 'Leaf', 'Micra', 'Murano', 'Navara', 'Note', 'Patrol', 'Pathfinder', 'Qashqai', 'Tiida', 'X-Trail'] },
  { make: 'Opel', models: ['Adam', 'Agila', 'Antara', 'Astra', 'Corsa', 'Crossland', 'Grandland', 'Insignia', 'Meriva', 'Mokka', 'Vectra', 'Vivaro', 'Zafira'] },
  { make: 'Peugeot', models: ['107', '206', '207', '208', '2008', '301', '307', '308', '3008', '4008', '406', '407', '408', '5008', '508', 'Boxer', 'Partner', 'Rifter', 'Traveller'] },
  { make: 'Porsche', models: ['718', '911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'] },
  { make: 'Renault', models: ['Arkana', 'Captur', 'Clio', 'Duster', 'Espace', 'Fluence', 'Kadjar', 'Kangoo', 'Koleos', 'Laguna', 'Logan', 'Master', 'Megane', 'Sandero', 'Scenic', 'Trafic', 'Zoe'] },
  { make: 'Seat', models: ['Arona', 'Ateca', 'Ibiza', 'Leon', 'Tarraco', 'Toledo'] },
  { make: 'Skoda', models: ['Citigo', 'Enyaq', 'Fabia', 'Kamiq', 'Karoq', 'Kodiaq', 'Octavia', 'Rapid', 'Scala', 'Superb', 'Yeti'] },
  { make: 'Subaru', models: ['BRZ', 'Forester', 'Impreza', 'Legacy', 'Outback', 'WRX', 'XV'] },
  { make: 'Suzuki', models: ['Baleno', 'Grand Vitara', 'Ignis', 'Jimny', 'S-Cross', 'Swift', 'SX4', 'Vitara'] },
  { make: 'Tesla', models: ['Model 3', 'Model S', 'Model X', 'Model Y'] },
  { make: 'Toyota', models: ['Auris', 'Avensis', 'Aygo', 'C-HR', 'Camry', 'Corolla', 'Fortuner', 'Highlander', 'Hilux', 'Land Cruiser', 'Land Cruiser Prado', 'Prius', 'RAV4', 'Sequoia', 'Sienna', 'Supra', 'Tundra', 'Yaris', 'bZ4X'] },
  { make: 'Volkswagen', models: ['Amarok', 'Arteon', 'Atlas', 'Caddy', 'California', 'Crafter', 'Golf', 'ID.3', 'ID.4', 'ID.6', 'Jetta', 'Multivan', 'Passat', 'Phaeton', 'Polo', 'T-Cross', 'T-Roc', 'Taos', 'Tiguan', 'Touareg', 'Touran', 'Transporter', 'Up!'] },
  { make: 'Volvo', models: ['C40', 'S60', 'S90', 'V40', 'V60', 'V90', 'XC40', 'XC60', 'XC90'] },
]

export const CAR_MAKES = CAR_DATA.map((c) => c.make)

export function getModels(make: string): string[] {
  return CAR_DATA.find((c) => c.make.toLowerCase() === make.toLowerCase())?.models ?? []
}
