DROP TYPE IF EXISTS PermissionType CASCADE;
CREATE TYPE PermissionType AS ENUM ('user', 'maintainer', 'admin');

DROP TYPE IF EXISTS Technology CASCADE;
CREATE TYPE Technology AS ENUM ('FDM', 'LCD', 'Metal FFF');

DROP TABLE IF EXISTS Account CASCADE;
CREATE TABLE Account (
  Email varchar(254) PRIMARY KEY,
  FirstName varchar(50) NOT NULL,
  LastName varchar(50) NOT NULL,
  YearOfStudy VARCHAR(256),
  Department VARCHAR(256),
  Password char(64) NOT NULL,
  JoinedAt timestamp with time zone NOT NULL DEFAULT NOW(),
  Permission PermissionType NOT NULL DEFAULT 'user',
  IsEmailVerified BOOLEAN NOT NULL DEFAULT FALSE,
  TwoStepAuthSecret varchar(16),
  IsTwoStepAuthSecretVerified BOOLEAN NOT NULL DEFAULT FALSE,
  IsBanned BOOLEAN DEFAULT FALSE NOT NULL,
  CONSTRAINT TwoStepAuth_CHK CHECK (
    (TwoStepAuthSecret IS NULL AND IsTwoStepAuthSecretVerified = FALSE) OR
    (TwoStepAuthSecret IS NOT NULL)
  )
);

DROP TYPE IF EXISTS WalletTransactionPaymentMethod CASCADE;
CREATE TYPE WalletTransactionPaymentMethod AS ENUM ('cash', 'gift');

DROP TYPE IF EXISTS PaymentStatus CASCADE;
CREATE TYPE PaymentStatus AS ENUM ('pending', 'paid', 'cancelled');

DROP TABLE IF EXISTS WalletTransaction CASCADE;
CREATE TABLE WalletTransaction (
  Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  AccountEmail VARCHAR(254) REFERENCES Account(Email) ON DELETE CASCADE ON UPDATE CASCADE,
  AmountInCents BIGINT NOT NULL,
  FeesInCents BIGINT NOT NULL,
  CustomerPaidInCents BIGINT NOT NULL,
  Status PaymentStatus NOT NULL DEFAULT 'pending',
  PaidAt TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  PaymentMethod WalletTransactionPaymentMethod NOT NULL,
  CONSTRAINT PAID_CHK CHECK (
  	(Status = 'paid' AND PaidAt IS NOT NULL AND PaymentMethod='cash') OR
  	(Status = 'paid' AND PaidAt IS NOT NULL AND PaymentMethod='gift') OR
    (Status = 'pending')
  )
);

DROP TABLE IF EXISTS AccountVerificationCode CASCADE;
CREATE TABLE AccountVerificationCode (
  AccountEmail varchar(254) UNIQUE REFERENCES Account(Email) ON DELETE CASCADE ON UPDATE CASCADE,
  CreatedAt timestamp with time zone NOT NULL DEFAULT NOW(),
  Code CHAR(32) NOT NULL
);

DROP TABLE IF EXISTS AccountPasswordResetCode CASCADE;
CREATE TABLE AccountPasswordResetCode (
  AccountEmail varchar(254) UNIQUE REFERENCES Account(Email) ON DELETE CASCADE ON UPDATE CASCADE,
  CreatedAt timestamp with time zone NOT NULL DEFAULT NOW(),
  Code CHAR(32) NOT NULL
);

DROP TABLE IF EXISTS Filament CASCADE;
CREATE TABLE Filament (
  Id SMALLSERIAL PRIMARY KEY,
  Material varchar(50) NOT NULL,
  Details VARCHAR(1000) NOT NULL,
  ColorName varchar(50) NOT NULL,
  Technology Technology NOT NULL,
  MonoColor varchar(20),
  Hint VARCHAR(50),
  DiColorA varchar(20),
  DiColorB varchar(20),
  InStock bool NOT NULL DEFAULT TRUE,
  CostPerGramInCents REAL NOT NULL CHECK (CostPerGramInCents >= 0),
  LeadTimeInDays INT NOT NULL CHECK (LeadTimeInDays >= 0),
  UNIQUE (ColorName, Material),
  CONSTRAINT COLOR_CHK CHECK (
	(MonoColor IS NOT NULL AND (DiColorA IS NULL AND DiColorB IS NULL)) OR
	((DiColorA IS NOT NULL AND DiColorB IS NOT NULL) AND MonoColor IS NULL) 
  )
);

DROP TABLE IF EXISTS Printer CASCADE;
CREATE TABLE Printer (
  Name varchar(120) NOT NULL PRIMARY KEY,
  Model varchar(120) NOT NULL,
  Dimensions int[3] NOT NULL DEFAULT '{}',
  SupportedMaterials varchar(10)[] NOT NULL,
  OutOfOrder bool NOT NULL DEFAULT false,
  CommunicationStrategy varchar,
  CommunicationStrategyOptions varchar,
  Queue SMALLINT[] NOT NULL DEFAULT '{}'
);

DROP TABLE IF EXISTS Request CASCADE;
CREATE TABLE Request (
  Id SERIAL PRIMARY KEY,
  Name varchar(300) NOT NULL,
  OwnerEmail varchar(254) REFERENCES Account(Email) ON DELETE CASCADE ON UPDATE CASCADE,
  SubmitTime timestamp with time zone NOT NULL DEFAULT NOW(),
  Comments VARCHAR(1000),
  PaidAt timestamp with time zone,
  FulfilledAt timestamp with time zone,
  TotalPriceInCents BIGINT,
  FeesInCents BIGINT NOT NULL,
  NeedBy TIMESTAMP WITH TIME ZONE,
  EstimatedCompletionDate timestamp with time zone,
  CONSTRAINT PAID_CHK CHECK (
  	(PaidAt IS NOT NULL AND TotalPriceInCents IS NOT NULL AND FeesInCents IS NOT NULL AND EstimatedCompletionDate IS NOT NULL) OR
    (PaidAt IS NULL)
  )
);

DROP TYPE IF EXISTS RequestEmailKind CASCADE;
CREATE TYPE RequestEmailKind AS ENUM ('received', 'quoted', 'approved', 'completed');

DROP TABLE IF EXISTS RequestEmail CASCADE;
CREATE TABLE RequestEmail (
  Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  RequestId SERIAL REFERENCES Request(Id) ON DELETE CASCADE ON UPDATE CASCADE,
  Kind RequestEmailKind NOT NULL,
  FailedReason VARCHAR(1000),
  SentAt TIMESTAMP WITH TIME ZONE,
  SeenAt TIMESTAMP WITH TIME ZONE
);

DROP TABLE IF EXISTS RequestRefund CASCADE;
CREATE TABLE RequestRefund (
  Id SERIAL PRIMARY KEY,
  RequestId SERIAL REFERENCES Request(Id) ON DELETE CASCADE ON UPDATE CASCADE,
  RequestedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CompletedAt TIMESTAMP WITH TIME ZONE,
  Reason VARCHAR(500)
);

DROP TABLE IF EXISTS Model CASCADE;
CREATE TABLE Model (
  Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  UploadedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FlaggedIssues VARCHAR(500),
  FlaggedAt TIMESTAMP WITH TIME ZONE NOT NULL,
  Name varchar(256) NOT NULL,
  FileSizeInBytes BIGINT NOT NULL,
  Favorite BOOLEAN NOT NULL DEFAULT FALSE,
  IsPurged BOOLEAN NOT NULL DEFAULT FALSE,
  OwnerEmail varchar(254) REFERENCES Account(Email) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT FLAGGED_CHK CHECK (
    (FlaggedIssues IS NOT NULL AND FlaggedAt IS NOT NULL) OR
    (FlaggedAt IS NULL AND FlaggedIssues IS NULL)
  )
);

DROP TABLE IF EXISTS ModelAnalysis CASCADE;
CREATE TABLE ModelAnalysis
(
  ModelId UUID PRIMARY KEY REFERENCES Model(Id) ON DELETE CASCADE ON UPDATE CASCADE,
  FailedReason VARCHAR(2000),
  EstimatedFilamentUsedInGrams FLOAT(2),
  EstimatedDuration INTERVAL, 
  CreatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  MachineModel VARCHAR(100) NOT NULL,
  MachineManufacturer VARCHAR(100) NOT NULL,
  CONSTRAINT FAILED_CHK CHECK (
  	(FailedReason IS NOT NULL AND EstimatedFilamentUsedInGrams IS NULL AND EstimatedDuration IS NULL) OR
    (FailedReason IS NULL)
  )
);

DROP TYPE IF EXISTS PartStatus CASCADE;
CREATE TYPE PartStatus AS ENUM ('denied', 'pending', 'printing', 'printed', 'failed');

DROP TABLE IF EXISTS Part CASCADE;
CREATE TABLE Part (
  Id SMALLSERIAL PRIMARY KEY,
  RequestId SERIAL REFERENCES Request(Id) ON DELETE CASCADE ON UPDATE CASCADE,
  ModelId UUID REFERENCES Model(Id) ON DELETE CASCADE ON UPDATE CASCADE,
  Quantity int NOT NULL CHECK (Quantity > 0 and Quantity <= 1000),
  Note VARCHAR(500) CHECK (LENGTH(Note) > 0),
  Status PartStatus NOT NULL DEFAULT 'pending',
  AssignedPrinterName varchar(120) DEFAULT NULL REFERENCES Printer(Name) ON DELETE SET NULL,
  AssignedFilamentId SMALLINT REFERENCES Filament(Id) ON DELETE SET NULL ON UPDATE CASCADE,
  SupplementedFilamentId SMALLINT REFERENCES Filament(Id) ON DELETE SET NULL ON UPDATE CASCADE,
  SupplementedReason VARCHAR(500),
  PriceCents BIGINT DEFAULT NULL,
  RefundReason VARCHAR(500),
  RefundQuantity INT,
  RevokedReason VARCHAR(500),
  CONSTRAINT REVOKE_DATA_CHK CHECK (
    (Status = 'denied' AND RevokedReason IS NOT NULL AND PriceCents IS NULL) OR
    (Status != 'denied' AND RevokedReason IS NULL)),

  CONSTRAINT REFUND_DATA_CHK CHECK (
	(RefundQuantity IS NOT NULL AND RefundReason IS NOT NULL) OR
	(RefundQuantity IS NULL AND RefundReason IS NULL))
);

CREATE OR REPLACE FUNCTION prevent_price_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the referenced Request's TotalPriceInCents is not null
    IF (SELECT TotalPriceInCents FROM Request WHERE Id = NEW.RequestId) IS NOT NULL THEN
        RAISE EXCEPTION 'Cannot modify part cost once itemized request is quoted!';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER prevent_price_change_trigger
BEFORE UPDATE OF PriceCents ON Part
FOR EACH ROW
EXECUTE FUNCTION prevent_price_change();

CREATE TABLE ProjectSpotlight (
  Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  CreatedAt timestamp with time zone NOT NULL DEFAULT NOW(), 
  Title VARCHAR(64) NOT NULL,
  Description VARCHAR(2048) NOT NULL,
  Author VARCHAR(128),
  HasImage BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE ProjectSpotlightAttachment (
  Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ProjectId UUID REFERENCES ProjectSpotlight(Id) ON DELETE CASCADE ON UPDATE CASCADE,
  FileName VARCHAR(256) NOT NULL,
  DownloadCount INT NOT NULL DEFAULT 0,
  UploadedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() 
);

CREATE TABLE ReregistrationSpan (
  Id VARCHAR(40) PRIMARY KEY NOT NULL,
  BeginAt TIMESTAMP NOT NULL,
  EndAt TIMESTAMP NOT NULL,
  Name VARCHAR(256) NOT NULL
);

CREATE TABLE ReregistrationSpanEntry (
  SpanId VARCHAR(40) REFERENCES ReregistrationSpan(Id) ON DELETE CASCADE ON UPDATE CASCADE,
  SubmittedAt TIMESTAMP WITH TIME ZONE NOT NULL,
  AccountEmail VARCHAR(254) REFERENCES Account(Email) ON DELETE CASCADE ON UPDATE CASCADE,
  YearOfStudy VARCHAR(256) NOT NULL,
  Department VARCHAR(256) NOT NULL,
  PRIMARY KEY (SpanId, AccountEmail)
);
