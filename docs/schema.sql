-- Sunai / Shunya Kuda — Partner DB
-- Import this into ERD Editor (right-click canvas -> Import -> SQL DDL)
-- to auto-generate the diagram instead of drawing tables by hand.
-- Source of truth remains src/db/operations.js and application models.

CREATE TABLE staffUsers (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  mobileNo VARCHAR(10) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'technician' | 'data_operator'
  isActive BOOLEAN DEFAULT TRUE
);

CREATE TABLE wasteGroups (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  swatch VARCHAR(30)
);

CREATE TABLE wasteCategories (
  id VARCHAR(20) PRIMARY KEY,
  groupId VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  FOREIGN KEY (groupId) REFERENCES wasteGroups(id)
);

CREATE TABLE masterItems (
  id VARCHAR(20) PRIMARY KEY,
  categoryId VARCHAR(20) NOT NULL,
  name VARCHAR(150) NOT NULL,
  unit VARCHAR(10) NOT NULL, -- 'kg' | 'piece'
  pricePerUnit DECIMAL(10,2) NOT NULL,
  minQty DECIMAL(10,2),
  isEnabled BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (categoryId) REFERENCES wasteCategories(id)
);

CREATE TABLE generatorCategories (
  id VARCHAR(30) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  subCategory VARCHAR(100) -- single type/tag, replaces embedded subCategories array
);

CREATE TABLE generators (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(10) NOT NULL,
  address VARCHAR(255),
  category VARCHAR(30) NOT NULL, -- 'family' | 'business' | 'public'
  lifetimeKG DECIMAL(10,2) DEFAULT 0,
  totalPayout DECIMAL(10,2) DEFAULT 0,
  outstandingDues DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (category) REFERENCES generatorCategories(id)
);

CREATE TABLE pickupSlots (
  id VARCHAR(20) PRIMARY KEY,
  date DATE NOT NULL,
  day VARCHAR(10),
  timeWindow VARCHAR(50),
  bookedKg DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) -- 'available' | 'full'
);

CREATE TABLE pickupTickets (
  id VARCHAR(30) PRIMARY KEY,
  generatorId VARCHAR(20) NOT NULL,
  slotId VARCHAR(20) NOT NULL,
  status VARCHAR(20), -- 'pending' | 'completed'
  estimatedWeight DECIMAL(10,2) DEFAULT 0,
  estimateAtPickup BOOLEAN DEFAULT FALSE,
  notes TEXT,
  createdAt DATETIME,
  completedAt DATETIME,
  FOREIGN KEY (generatorId) REFERENCES generators(id),
  FOREIGN KEY (slotId) REFERENCES pickupSlots(id)
);

CREATE TABLE ticketItems (
  id VARCHAR(40) PRIMARY KEY,
  ticketId VARCHAR(30) NOT NULL,
  itemId VARCHAR(20) NOT NULL,
  itemNameSnapshot VARCHAR(150),
  rateSnapshot DECIMAL(10,2),
  weight DECIMAL(10,2),
  amount DECIMAL(10,2),
  FOREIGN KEY (ticketId) REFERENCES pickupTickets(id),
  FOREIGN KEY (itemId) REFERENCES masterItems(id)
);

CREATE TABLE transactions (
  id VARCHAR(30) PRIMARY KEY,
  ticketId VARCHAR(30), -- nullable: null = direct walk-in purchase
  generatorId VARCHAR(20) NOT NULL,
  technicianId VARCHAR(20) NOT NULL,
  paymentMethod VARCHAR(10) NOT NULL, -- 'cash' | 'upi' | 'due'
  grandTotal DECIMAL(10,2) NOT NULL,
  createdAt DATETIME,
  FOREIGN KEY (ticketId) REFERENCES pickupTickets(id),
  FOREIGN KEY (generatorId) REFERENCES generators(id),
  FOREIGN KEY (technicianId) REFERENCES staffUsers(id)
);

CREATE TABLE transactionItems (
  id VARCHAR(40) PRIMARY KEY,
  transactionId VARCHAR(30) NOT NULL,
  itemId VARCHAR(20) NOT NULL,
  itemNameSnapshot VARCHAR(150),
  rateSnapshot DECIMAL(10,2),
  weight DECIMAL(10,2),
  amount DECIMAL(10,2),
  FOREIGN KEY (transactionId) REFERENCES transactions(id),
  FOREIGN KEY (itemId) REFERENCES masterItems(id)
);

CREATE TABLE priceAuditLog (
  id VARCHAR(40) PRIMARY KEY,
  batchId VARCHAR(50), -- nullable: group ID for bulk rate revisions
  itemId VARCHAR(20) NOT NULL,
  itemName VARCHAR(150),
  oldPrice DECIMAL(10,2),
  newPrice DECIMAL(10,2),
  changedBy VARCHAR(20),
  changedAt DATETIME,
  isRevert BOOLEAN DEFAULT FALSE, -- true if entry is a rollback of a previous revision
  FOREIGN KEY (itemId) REFERENCES masterItems(id),
  FOREIGN KEY (changedBy) REFERENCES staffUsers(id)
);
