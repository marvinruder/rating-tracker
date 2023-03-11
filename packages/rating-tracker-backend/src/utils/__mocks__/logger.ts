import pino from "pino";

export const PREFIX_NODEJS = "";
export const PREFIX_REDIS = "";
export const PREFIX_CHROME = "";
export const PREFIX_SIGNAL = "";

// We do not want to log anything in tests
const streams = [];

const logger = pino({}, pino.multistream(streams));

export default logger;
