import { CONFIG_DEFAULT_SETTING } from './constants';
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { Config } from './types/stores';

const CONFIGS_DIR = 'configs';
const CONFIG_EXTESION = '.json';
const HIERARCHY = '../';
const UNICODE = 'utf8';

class Context {
  private _config: Config = {
    sandboxMode: CONFIG_DEFAULT_SETTING.sandBoxMode,
    orderSizeBTC: CONFIG_DEFAULT_SETTING.orderSizeBTC,
    intervalSec: CONFIG_DEFAULT_SETTING.intervalSec,
  };

  init() {
    this.initConfig();
  }

  get config() {
    return this._config;
  }

  private initConfig() {
    const configsDirPath = path.join(__dirname, HIERARCHY, CONFIGS_DIR);
    const configFileName = `${process.env.SERVICE_ENV}${CONFIG_EXTESION}`;
    const configFilePath = path.join(configsDirPath, configFileName);
    this._config = JSON.parse(
      fs.readFileSync(configFilePath, UNICODE)
    ) as Config;
  }
}

export = new Context();
