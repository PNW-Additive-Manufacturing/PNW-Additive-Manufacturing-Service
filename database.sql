CREATE TYPE PermissionType AS ENUM ('user', 'maintainer', 'admin');
CREATE TABLE Account (
  Email varchar(120) PRIMARY KEY,
  FirstName varchar(50) NOT NULL,
  LastName varchar(50) NOT NULL, 
  Password char(64) NOT NULL,
  Permission PermissionType NOT NULL DEFAULT 'user',
  VerificationId UUID DEFAULT gen_random_uuid()
);

CREATE TABLE Filament (
  Id SERIAL PRIMARY KEY,
  Material varchar(10) NOT NULL,
  Color varchar(10) NOT NULL,
  bool InStock NOT NULL DEFAULT TRUE,
  UNIQUE (Name, Material)
);

CREATE TABLE Printer (
  Name varchar(120) NOT NULL, -- Bob, Joe, Cnacer
  Model varchar(120) NOT NULL,
  Dimensions int[3] NOT NULL,
  Filaments varchar(10)[] NOT NULL
);

CREATE TABLE Request (
  Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  Name varchar(120) NOT NULL,
  AccountEmail varchar(120) REFERENCES Account(Email) ON DELETE CASCADE ON UPDATE CASCADE,
  SubmitTime timestamp with time zone NOT NULL DEFAULT NOW(),
  IsFullfilled bool NOT NULL DEFAULT false,
);

CREATE TYPE PartStatus AS ENUM ('Pending', 'Denied', 'Queued', 'Printing', 'Printed', 'Failed');
CREATE TABLE Part (
  RequestId UUID REFERENCES Request(Id) ON DELETE CASCADE ON UPDATE CASCADE,
  Name varchar(80) NOT NULL,
  Quantity int NOT NULL CHECK (Quantity > 0 and Quantity <= 100),
  Status PartStatus NOT NULL DEFAULT 'Pending',
  PrinterId UUID REFERENCES Printer(Id) ON DELETE SET NULL,
  FilamentId int 
  UNIQUE (RequestId, Name)
);