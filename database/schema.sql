CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS folders (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  parent_id CHAR(36) NULL,
  name VARCHAR(255) NOT NULL,
  is_starred TINYINT(1) DEFAULT 0,
  is_trashed TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_folders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_folders_parent FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS files (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  folder_id CHAR(36) NULL,
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  firebase_path VARCHAR(512) NOT NULL,
  file_type VARCHAR(128) NOT NULL,
  file_size BIGINT DEFAULT 0,
  is_starred TINYINT(1) DEFAULT 0,
  is_trashed TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_files_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_files_folder FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS permissions (
  id CHAR(36) PRIMARY KEY,
  owner_id CHAR(36) NOT NULL,
  file_id CHAR(36) NOT NULL,
  shared_with_id CHAR(36) NOT NULL,
  permission ENUM('view','edit') NOT NULL DEFAULT 'view',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_permissions_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_permissions_file FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
  CONSTRAINT fk_permissions_target FOREIGN KEY (shared_with_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_permissions_share UNIQUE (file_id, shared_with_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS activity_logs (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  action VARCHAR(128) NOT NULL,
  entity_id CHAR(36) NULL,
  entity_type VARCHAR(64) NULL,
  metadata JSON NOT NULL DEFAULT (JSON_OBJECT()),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_files_user ON files(user_id);
CREATE INDEX idx_files_name ON files(name);
CREATE INDEX idx_folders_user ON folders(user_id);
CREATE INDEX idx_activity_user ON activity_logs(user_id);
