-- Add messages JSONB column to chats table
ALTER TABLE chats ADD COLUMN IF NOT EXISTS messages JSONB DEFAULT '[]'::jsonb;

-- Migrate existing messages to chats table
UPDATE chats 
SET messages = (
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'id', id,
        'role', role,
        'content', content,
        'images', images,
        'created_at', created_at
      ) ORDER BY created_at
    )::jsonb,
    '[]'::jsonb
  )
  FROM messages
  WHERE messages.chat_id = chats.id
);

-- Create index on messages JSONB for better query performance
CREATE INDEX IF NOT EXISTS idx_chats_messages ON chats USING gin (messages);

-- Note: We keep the messages table for now in case we need to rollback
-- To fully migrate, you can drop it later with: DROP TABLE IF EXISTS messages;

