import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import fetch from 'node-fetch';
import { handleException, validateProperties } from '../../utils/functions';

interface ContactBody {
  message: string;
}

export default function handler(req: GatsbyFunctionRequest<ContactBody>, res: GatsbyFunctionResponse) {
  const get = async () => {
    try {
      const { url } = req.query;

      validateProperties(res, ['url'], req.query, 'Missing required parameter');

      const response = await fetch(
        `https://api.apiflash.com/v1/urltoimage?access_key=${process.env.APIFLASH_API_KEY}&url=${url}&response_type=image&thumbnail_width=320&wait_until=page_loaded`,
      )

      console.log({
        url,
        response
      })

      const imageBlob = await response.buffer();
      const base64data = `data:image/jpeg;base64,${imageBlob.toString('base64')}`;

      res.send({
        file: {
          url: base64data,
        },
      });
    } catch (e) {
      console.error(e)
      handleException(e, req, res);
    }
  };

  try {
    switch (req.method) {
      case 'GET':
        get();
        break;
      default:
        res.setHeader('x-gatsby-Allow', ['GET']);
        res.status(405);
        throw new Error(`Method ${req.method} Not Allowed`);
    }
  } catch (e) {
    handleException(e, req, res);
  }
}
