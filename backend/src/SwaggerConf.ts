import { SPathUtil, SwaggerConfig } from '@grandlinex/swagger-mate';
import LibFile from './modules/WatchModule/database/entities/LibFile';
import Label from './modules/WatchModule/database/entities/Label';
import DownloadQ from './modules/WatchModule/database/queue/DownloadQ';
import LibPath from './modules/WatchModule/database/entities/LibPath';

const SwaggerConf: SwaggerConfig = {
  info: {
    version: '0.0.0',
    title: 'XServer',
    description: 'Basic Auth RESTFull interface',
  },
  openapi: '3.0.3',
  paths: {
    '/token': {
      post: {
        operationId: 'getApiToken',
        summary: 'Get Bearer for user.',
        description: 'Returns JWT',
        tags: ['Kernel'],
        responses: {
          ...SPathUtil.jsonResponse(
            '200',
            {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
            false,
            '403',
            '400',
            '500',
          ),
        },
        requestBody: SPathUtil.jsonBody({
          type: 'object',
          properties: {
            username: {
              type: 'string',
            },
            token: {
              type: 'string',
            },
          },
          required: ['username', 'token'],
        }),
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  servers: [
    {
      url: 'http://localhost:9257',
      description: 'Dev server',
    },
    {
      url: 'http://192.168.178.3:9257',
      description: 'Prod server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ...SPathUtil.schemaEntryGen(
        new LibFile(),
        new LibPath(),
        new Label(),
        new DownloadQ(),
      ),
      MLabel: {
        type: 'object',
        properties: {
          label: {
            $ref: SPathUtil.schemaPath('Label'),
          },
          map: {
            type: 'string',
          },
        },
        required: ['label', 'map'],
      },
    },
  },
};

export default SwaggerConf;
