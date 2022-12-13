import pino from "pino";

const streams = [];

const logger = pino({}, pino.multistream(streams));

export default logger;
