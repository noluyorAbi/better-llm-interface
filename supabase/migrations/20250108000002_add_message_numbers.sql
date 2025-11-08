-- Add message_number to all existing messages in chats
UPDATE chats
SET messages = (
  SELECT json_agg(
    json_build_object(
      'id', msg->>'id',
      'role', msg->>'role',
      'content', msg->>'content',
      'images', msg->'images',
      'created_at', msg->>'created_at',
      'message_number', msg_num
    ) ORDER BY msg_num
  )::jsonb
  FROM (
    SELECT 
      msg,
      row_number() OVER (ORDER BY COALESCE((msg->>'created_at')::timestamp, NOW())) AS msg_num
    FROM jsonb_array_elements(chats.messages) AS msg
  ) AS numbered_msgs
  WHERE chats.messages IS NOT NULL
)
WHERE messages IS NOT NULL AND jsonb_array_length(messages) > 0;

