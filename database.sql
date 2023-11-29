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
  Id SMALLSERIAL PRIMARY KEY,
  Material varchar(10) NOT NULL,
  Color varchar(10) NOT NULL,
  InStock bool NOT NULL DEFAULT TRUE,
  UNIQUE (Color, Material)
);

DROP TABLE IF EXISTS Printer CASCADE;
CREATE TABLE Printer (
  Name varchar(120) NOT NULL PRIMARY KEY, -- Bob, Joe, Cnacer
  Model varchar(120) NOT NULL,
  Dimensions int[3] NOT NULL DEFAULT '{}',
  SupportedMaterials varchar(10)[] NOT NULL,
  OutOfOrder bool NOT NULL DEFAULT false,
  Queue SMALLINT[] NOT NULL DEFAULT '{}'
);

DROP TABLE IF EXISTS Request CASCADE;
CREATE TABLE Request (
  Id SMALLSERIAL PRIMARY KEY,
  Name varchar(120) NOT NULL,
  OwnerEmail varchar(120) REFERENCES Account(Email) ON DELETE CASCADE ON UPDATE CASCADE,
  SubmitTime timestamp with time zone NOT NULL DEFAULT NOW(),
  IsFulfilled bool NOT NULL DEFAULT false,
  Notes varchar(500)
);

DROP TABLE IF EXISTS Model CASCADE;
CREATE TABLE Model (
  Id SMALLSERIAL PRIMARY KEY,
  Name varchar(50) NOT NULL,
  FilePath varchar(256) NOT NULL,
  ThumbnailPath varchar(256),
  OwnerEmail varchar(120) REFERENCES Account(Email) ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TYPE IF EXISTS PartStatus CASCADE;
CREATE TYPE PartStatus AS ENUM ('pending', 'denied', 'queued', 'printing', 'printed', 'failed');

DROP TABLE IF EXISTS Part CASCADE;
CREATE TABLE Part (
  Id SMALLSERIAL PRIMARY KEY,
  RequestId SMALLSERIAL REFERENCES Request(Id) ON DELETE CASCADE ON UPDATE CASCADE,
  ModelId SMALLSERIAL REFERENCES Model(Id) ON DELETE CASCADE ON UPDATE CASCADE,
  Quantity int NOT NULL CHECK (Quantity > 0 and Quantity <= 100),
  Status PartStatus NOT NULL DEFAULT 'pending',
  AssignedPrinterName varchar(120) DEFAULT NULL REFERENCES Printer(Name) ON DELETE SET NULL,
  AssignedFilamentId SMALLINT REFERENCES Filament(Id) ON DELETE SET NULL ON UPDATE CASCADE
);
