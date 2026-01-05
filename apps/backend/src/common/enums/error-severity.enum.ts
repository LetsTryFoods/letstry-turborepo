import { registerEnumType } from '@nestjs/graphql';

export enum ErrorSeverity {
  MINOR = 'minor',
  MAJOR = 'major',
  CRITICAL = 'critical',
}

registerEnumType(ErrorSeverity, {
  name: 'ErrorSeverity',
});
