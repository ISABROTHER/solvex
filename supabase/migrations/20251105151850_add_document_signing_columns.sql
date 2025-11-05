/*
  # Add Document Signing Fields to Employee Documents

  ## Problem
  The application code expects a `requires_signing` column and other signing-related
  fields that don't exist in the employee_documents table.

  ## Solution
  Add columns to support document signing workflow:
  - requires_signing: boolean flag to indicate if document needs signature
  - signed_storage_url: URL to the signed version of document (if signed)
  - signed_at: timestamp when document was signed
  - storage_path: explicit storage path (was missing, only had storage_url)

  ## Changes
  1. Add requires_signing column (boolean, default false)
  2. Add signed_storage_url column (text, nullable)
  3. Add signed_at column (timestamptz, nullable)
  4. Ensure storage_path exists and is nullable for legacy data
*/

-- Add requires_signing column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employee_documents' AND column_name = 'requires_signing'
  ) THEN
    ALTER TABLE employee_documents 
    ADD COLUMN requires_signing boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Add signed_storage_url column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employee_documents' AND column_name = 'signed_storage_url'
  ) THEN
    ALTER TABLE employee_documents 
    ADD COLUMN signed_storage_url text;
  END IF;
END $$;

-- Add signed_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employee_documents' AND column_name = 'signed_at'
  ) THEN
    ALTER TABLE employee_documents 
    ADD COLUMN signed_at timestamptz;
  END IF;
END $$;

-- Make storage_path nullable if it isn't already (for existing data)
DO $$
BEGIN
  ALTER TABLE employee_documents 
  ALTER COLUMN storage_path DROP NOT NULL;
EXCEPTION
  WHEN others THEN
    -- Column might already be nullable, ignore error
    NULL;
END $$;

-- Add comment to document the schema
COMMENT ON COLUMN employee_documents.requires_signing IS 'Whether this document requires employee signature';
COMMENT ON COLUMN employee_documents.signed_storage_url IS 'Storage URL for the signed version of the document';
COMMENT ON COLUMN employee_documents.signed_at IS 'Timestamp when the document was signed by the employee';
