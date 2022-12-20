import pino from "pino";

export const PREFIX_NODEJS = "";
export const PREFIX_REDIS = "";
export const PREFIX_CHROME = "";

const streams = [];

const logger = pino({}, pino.multistream(streams));

export default logger;
