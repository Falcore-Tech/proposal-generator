export type { AuthenticatedUser } from "./api";
export { requireAuth, requireAdmin } from "./api";

export type { AuthUser } from "./page";
export {
  getAuthUser,
  requireRole,
  requireAdminRole,
  requireSalesRepRole,
  requireAuthenticatedUser,
  hasRole,
  isAdmin,
  isSalesRep,
} from "./page";

export type { AuthContext, UserRole } from "./core";
export { resolveAuthContext, resolveProfileRole } from "./core";
