import { Roles } from './roles.decorator';
import { Role } from '../enums/role.enum';

export const Admin = () => Roles(Role.ADMIN);