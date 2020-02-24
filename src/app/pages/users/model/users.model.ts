import { Role } from 'app/types/Authorization';
import { KeyValue } from 'app/types/GlobalType';
import { UserRole, UserStatus } from 'app/types/User';

export const userStatuses: KeyValue[] = [
  { key: UserStatus.ACTIVE, value: 'users.status_active' },
  { key: UserStatus.BLOCKED, value: 'users.status_blocked' },
  { key: UserStatus.INACTIVE, value: 'users.status_inactive' },
  { key: UserStatus.LOCKED, value: 'users.status_locked' },
  { key: UserStatus.PENDING, value: 'users.status_pending' },
];

export class UserRoles {
  public static getAvailableRoles(role?: string): KeyValue[] {
    if (role === Role.SUPER_ADMIN) {
      return [
        { key: UserRole.SUPER_ADMIN, value: 'users.role_super_admin' },
      ];
    }
    return [
      { key: UserRole.ADMIN, value: 'users.role_admin' },
      { key: UserRole.BASIC, value: 'users.role_basic' },
      { key: UserRole.DEMO, value: 'users.role_demo' },
    ];
  }
}
