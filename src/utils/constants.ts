import path from "path";

export class Constants {
    public static readonly EVENT_BLOCKS_SAVED = "blocks-saved";

    public static readonly APP_NAME = "com.lifi.block-scrapper.fee-collector";
    public static readonly APP_VERSION = "0.0.1";
    // Redis keys in format : package-name:version:chain-id:key
    //TODO: Right now hardcoding the package name and version, in production we can get it from package.json
    public static readonly FORWARD_CURSOR_REDIS_KEY = Constants.APP_NAME + ":" + Constants.APP_VERSION + ":forward-cursor";
    public static readonly BACKWARD_CURSOR_REDIS_KEY = Constants.APP_NAME + ":" + Constants.APP_VERSION + ":backward-cursor";

    public static readonly  BACKUP_DATA_PATH = path.join("./", 'backup');
    public static readonly  DATA_LOGS_PATH = path.join("./", 'data');

}
