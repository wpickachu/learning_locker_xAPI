/* tslint:disable:no-let */
import NoModel from 'jscommons/dist/errors/NoModel';
import IfMatch from '../errors/IfMatch';
import DeleteProfileOptions from '../repoFactory/options/DeleteProfileOptions';
import DeleteProfileResult from '../repoFactory/results/DeleteProfileResult';
import Config from './Config';
import matchProfileIdentifier from './utils/matchProfileIdentifier';

export default (config: Config) => {
  return async (opts: DeleteProfileOptions): Promise<DeleteProfileResult> => {
    const storedProfiles = config.state.agentProfiles;
    const client = opts.client;
    const agent = opts.agent;
    let existingId: string | undefined;
    let existingContentType: string | undefined;
    let existingExtension: string | undefined;
    const remainingProfiles = storedProfiles.filter((profile) => {
      const isMatch = (
        matchProfileIdentifier({ client, agent, profile }) &&
        profile.profileId === opts.profileId
      );

      if (isMatch) {
        existingId = profile.id;
        existingContentType = profile.contentType;
        existingExtension = profile.extension;

        if (opts.ifMatch !== undefined && profile.etag !== opts.ifMatch) {
          throw new IfMatch();
        }
      }

      return !isMatch;
    });

    if (
      existingId !== undefined &&
      existingContentType !== undefined &&
      existingExtension !== undefined) {
      config.state.agentProfiles = remainingProfiles;
      return {
        contentType: existingContentType,
        extension: existingExtension,
        id: existingId,
      };
    }

    /* istanbul ignore next */
    throw new NoModel('Agent Profile');
  };
};
