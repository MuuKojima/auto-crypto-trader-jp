import Express from 'express';
import TradeAlgorithm from './controllers';
import { CONFIG_DEFAULT_SETTING } from './constants';

const POST = process.env.PORT || CONFIG_DEFAULT_SETTING.port;
const ALGORITHM_ID =
  process.env.ALGORITHM_ID || CONFIG_DEFAULT_SETTING.algorithumId;
const REQ_PING = '/ping';
const RES_PONG = 'pong';

class Server {
  init() {
    const server = Express();
    // Routes
    server.get(REQ_PING, (req: Express.Request, res: Express.Response) =>
      res.status(200).send(RES_PONG)
    );
    // Listen
    server.listen(POST, () => {
      TradeAlgorithm.init(ALGORITHM_ID)
        .dressup()
        .catch((err) => {
          throw err;
        });
    });
  }
}

export = new Server();
