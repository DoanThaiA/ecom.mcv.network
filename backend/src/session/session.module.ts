import {
  // common
  Module,
} from '@nestjs/common';

import { SessionDocumentModule } from './model/session-document.module';
import { SessionService } from './session.service';

const infrastructurePersistenceModule = SessionDocumentModule;

@Module({
  imports: [infrastructurePersistenceModule],
  providers: [SessionService],
  exports: [SessionService, infrastructurePersistenceModule],
})
export class SessionModule {}
