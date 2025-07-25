import { ResponseHeadersPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';

interface Props {
  isProduction: boolean;
  construct: Construct;
}

export const getCacheOptimizedResponsePolicy = ({
  isProduction,
  construct,
}: Props): ResponseHeadersPolicy | undefined => {
  if (!isProduction) {
    return;
  }

  return new ResponseHeadersPolicy(construct, 'CachedOptimizedResponsePolicy', {
    customHeadersBehavior: {
      customHeaders: [
        {
          header: 'Cache-Control',
          value: `cache-control: public, max-age=31536000, immutable`,
          override: true,
        },
      ],
    },
  });
};

export const getCacheDisabledResponsePolicy = ({
  isProduction,
  construct,
}: Props): ResponseHeadersPolicy | undefined => {
  if (!isProduction) {
    return;
  }

  return new ResponseHeadersPolicy(construct, 'CachedDisabledResponsePolicy', {
    customHeadersBehavior: {
      customHeaders: [
        {
          header: 'Cache-Control',
          value: `cache-control: public, max-age=0, must-revalidate`,
          override: true,
        },
      ],
    },
  });
};
