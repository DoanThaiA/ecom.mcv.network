import { Session } from '../../../session/domain/session';
import { CmsUser } from '../../../cms-users/domain/cms-user';

export type JwtCmsPayloadType = Pick<
  CmsUser,
  'id' | 'permissions' | 'accountType' | 'affiliateId'
> & {
  sessionId: Session['id'];
  iat: number;
  exp: number;
};
