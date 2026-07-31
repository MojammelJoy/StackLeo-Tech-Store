/**
 * A key-value configuration record admins manage directly — the one
 * domain entity this foundation actually owns (every other management
 * area described in `constants/management-module.constants.ts` belongs
 * to its own module). `updatedBy` is a bare FK-shaped string; this
 * module never imports `modules/user`.
 */
export interface SystemSetting {
  key: string;
  value: string;
  description: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSystemSettingInput {
  key: string;
  value: string;
  description?: string | null;
  updatedBy?: string | null;
}

/** Deliberately excludes `key` — a setting's key is its identity and is
 * never renamed in place; deleting and recreating is the only way to
 * change it. */
export interface UpdateSystemSettingInput {
  value?: string;
  description?: string | null;
  updatedBy?: string | null;
}
