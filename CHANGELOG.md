# Application Changelog
As of 1/26/2025 this file will be used to keep track of new features and changes to the structure of the
Additive Manufacturing Service.

- Comment on new features.
- Provide database migration scripts when database changes occur.
- Provide information on when environment variable behaviors change.

<!-- 

Changelog Format:

## vx.x.x (month-day-year)

Insert a general description of the changes coming in this version.

### Release Highlight

Insert general changes and features which were added in this version.

### Database Changes

Insert any changes to the database and provide migration scripts.

### Environment Changes

Insert any changes related to configuring the application's environment variables.

 -->

## August-06-2025 

Introduced **reregistration**, a new system designed to monitor user activity by requiring them to re-register their accounts within defined academic periods *(e.g., Fall, Spring, Summer)*.

### Release Highlight

- Initial implementation of Reregistration.
- Until future releases, this information is not displayed on Web.

### Database Changes

A new `ReregistrationSpan` table now defines registration periods, including their start and end dates, as well as descriptive names *(e.g., Summer of 2025, Fall of 2025)*.
The `ReregistrationSpanEntry` table associates individual user accounts with specific spans.

#### Migration Scripts

```sql
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
```

## January-29-2025

This commit comes with MANY changes and improvements to this service.

### Release Highlights

- UI overhaul for request viewing and management.
- Introduced a new popup-form system which makes the UI more dynamic and easier to navigate.
- Added full support for supplementing filaments and declaring a reason.
- Invoices and receipts can be downloaded for each requests made and quotes may have a separate fee value. 
- Compartmentalized many UI feature into components used in multiple places.
- Improved the security of a few download endpoints.

### Database Changes

Parts may now have a reason provided when filaments are supplemented and requests can now contain the amount of fees a quote should have.
Since models can be "flagged" we needed to add a few more columns to the table.

#### Migration Scripts

```sql
ALTER TABLE Part ADD COLUMN SupplementedReason VARCHAR(500);
```

```sql
BEGIN;

ALTER TABLE Request ADD COLUMN IF NOT EXISTS FeesInCents BIGINT;

UPDATE Request SET FeesInCents = 0 WHERE FeesInCents IS NULL AND TotalPriceInCents IS NOT NULL;

ALTER TABLE Request DROP CONSTRAINT IF EXISTS PAID_CHK;

ALTER TABLE Request ADD CONSTRAINT PAID_CHK CHECK (
    (PaidAt IS NOT NULL AND TotalPriceInCents IS NOT NULL AND FeesInCents IS NOT NULL AND EstimatedCompletionDate IS NOT NULL) OR
    (PaidAt IS NULL)
);

-- Ensure to commit the changes if successful!
-- COMMIT;
```

```sql
ALTER TABLE Model
ADD COLUMN FlaggedIssues VARCHAR(500),
ADD COLUMN FlaggedAt TIMESTAMP WITH TIME ZONE;

ALTER TABLE Model
ADD CONSTRAINT FLAGGED_CHK CHECK (
    (FlaggedIssues IS NOT NULL AND FlaggedAt IS NOT NULL) OR
    (FlaggedIssues IS NULL AND FlaggedAt IS NULL)
);
```

```sql
CREATE TABLE ProjectSpotlightAttachment (
  Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ProjectId UUID REFERENCES ProjectSpotlight(Id) ON DELETE CASCADE ON UPDATE CASCADE,
  FileName VARCHAR(256) NOT NULL,
  DownloadCount INT NOT NULL DEFAULT 0,
  UploadedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() 
);
```