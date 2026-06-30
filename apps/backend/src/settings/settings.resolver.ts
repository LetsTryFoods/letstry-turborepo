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
    @Args('minAppVersionAndroid', { type: () => String, nullable: true })
    minAppVersionAndroid: string,
    @Args('minAppVersionIos', { type: () => String, nullable: true })
    minAppVersionIos: string,
  ): Promise<GlobalSettings> {
    // Keep existing values if not provided (for backwards compatibility during mutation changes)
    const current = await this.settingsService.getGlobalSettings();
    return this.settingsService.updateGlobalSettings(
      isPackerScanBypassEnabled,
      minAppVersionAndroid ?? current.minAppVersionAndroid,
      minAppVersionIos ?? current.minAppVersionIos,
    );
  }
}
