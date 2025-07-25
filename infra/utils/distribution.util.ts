import {
  BehaviorOptions,
  CachePolicy,
  IOrigin,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';

interface Props {
  origin: IOrigin;
  responseHeadersPolicy: ResponseHeadersPolicy | undefined;
  isProduction: boolean;
}

export const getAdditionalBehaviors = ({
  origin,
  responseHeadersPolicy,
  isProduction,
}: Props): Record<string, BehaviorOptions> | undefined => {
  if (!isProduction) {
    return undefined;
  }

  const keys = ['/assets/*', '*.js', '*.css', '/fonts/**/*'];

  return keys.reduce<Record<string, BehaviorOptions>>((acc, key) => {
    acc[key] = {
      origin,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy: CachePolicy.CACHING_OPTIMIZED,
      responseHeadersPolicy,
    };

    return acc;
  }, {});
};
