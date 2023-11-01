DROP TYPE IF EXISTS PermissionType CASCADE;
CREATE TYPE PermissionType AS ENUM ('user', 'maintainer', 'admin');

DROP TABLE IF EXISTS Account CASCADE;
CREATE TABLE Account (
  Email varchar(120) PRIMARY KEY,
  FirstName varchar(50) NOT NULL,
  LastName varchar(50) NOT NULL, 
  Password char(64) NOT NULL,
  Permission PermissionType NOT NULL DEFAULT 'user',
  VerificationId UUID DEFAULT gen_random_uuid()
);

DROP TABLE IF EXISTS Filament CASCADE;
CREATE TABLE Filament (
  Id SERIAL PRIMARY KEY,
  Material varchar(10) NOT NULL,
  Color varchar(10) NOT NULL,
  InStock bool NOT NULL DEFAULT TRUE,
  UNIQUE (Color, Material)
);

DROP TABLE IF EXISTS Printer CASCADE;
CREATE TABLE Printer (
  Name varchar(120) NOT NULL PRIMARY KEY, -- Bob, Joe, Cnacer
  Model varchar(120) NOT NULL,
  Dimensions int[3] NOT NULL,
  Filaments varchar(10)[] NOT NULL
);

DROP TABLE IF EXISTS Request CASCADE;
CREATE TABLE Request (
  Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Name varchar(120) NOT NULL,
  AccountEmail varchar(120) REFERENCES Account(Email) ON DELETE CASCADE ON UPDATE CASCADE,
  SubmitTime timestamp with time zone NOT NULL DEFAULT NOW(),
  IsFullfilled bool NOT NULL DEFAULT false,
  Notes varchar(500)
);

DROP TYPE IF EXISTS PartStatus;
CREATE TYPE PartStatus AS ENUM ('Pending', 'Denied', 'Queued', 'Printing', 'Printed', 'Failed');

DROP TABLE IF EXISTS Part CASCADE;
CREATE TABLE Part (
  RequestId UUID REFERENCES Request(Id) ON DELETE CASCADE ON UPDATE CASCADE,
  Name varchar(80) NOT NULL,
  Quantity int NOT NULL CHECK (Quantity > 0 and Quantity <= 100),
  Status PartStatus NOT NULL DEFAULT 'Pending',
  PrinterId varchar(120) DEFAULT NULL REFERENCES Printer(Name) ON DELETE SET NULL,
  FilamentId SERIAL NOT NULL REFERENCES Filament(Id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE (RequestId, Name)
);