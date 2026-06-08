import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { SettingsService } from './settings.service';
import { GlobalSettings } from './settings.schema';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Public } from '../common/decorators/public.decorator';

@Resolver(() => GlobalSettings)
export class SettingsResolver {
  constructor(private readonly settingsService: SettingsService) {}

  @Query(() => GlobalSettings, { name: 'getGlobalSettings' })
  @Public() // Needs to be accessible by packer app and admin panel
  async getGlobalSettings(): Promise<GlobalSettings> {
    return this.settingsService.getGlobalSettings();
  }

  @Mutation(() => GlobalSettings, { name: 'updateGlobalSettings' })
  @Roles(Role.ADMIN)
  async updateGlobalSettings(
    @Args('isPackerScanBypassEnabled', { type: () => Boolean })
    isPackerScanBypassEnabled: boolean,
  ): Promise<GlobalSettings> {
    return this.settingsService.updateGlobalSettings(
      isPackerScanBypassEnabled,
    );
  }
}
