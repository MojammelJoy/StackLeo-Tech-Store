import type { DashboardOverviewResponseDto } from "../dto";
import type { AdminDashboardRepository } from "../repository";

/**
 * Dashboard summary orchestration — currently a single-repository
 * pass-through, but kept as its own service (rather than the controller
 * calling the repository directly) so a future addition that needs to
 * combine more than one source, or apply admin-specific shaping, has
 * somewhere to live without the controller growing business logic.
 */
export class AdminDashboardService {
  constructor(private readonly dashboardRepository: AdminDashboardRepository) {}

  async getOverview(): Promise<DashboardOverviewResponseDto> {
    return this.dashboardRepository.getOverview();
  }
}
