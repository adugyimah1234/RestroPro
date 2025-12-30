-- Add Superadmin Script

-- ------------------------------------------------------
-- Note: Replace '_Morrison.1' with a strong, hashed password.
-- ------------------------------------------------------

-- Insert into superadmins table
INSERT INTO `superadmins` (`email`, `password`, `name`)
VALUES ('adugyimah6776@gmail.com', '$2b$10$AiGcy0rTi36Pj.09xJu05.6cfiTcuo0yopBSGvZSw2JKNbZxcJjGm', 'superadminmorris');

-- Insert into users table
-- Note: Ensure tenant_id is set correctly if required, though for a superadmin it might be NULL.
INSERT INTO `users` (`username`, `password`, `name`, `role`, `email`, `tenant_id`)
VALUES ('adugyimah6776@gmail.com', '$2b$10$AiGcy0rTi36Pj.09xJu05.6cfiTcuo0yopBSGvZSw2JKNbZxcJjGm', 'superadminmorris', 'superadmin', 'adugyimah6776@gmail.com', NULL);
